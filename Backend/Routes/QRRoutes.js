import express from 'express';
import { Student } from '../Models/StudentSchema.js';
import { Registration } from '../Models/RegistrationSchema.js';
import { CheckIn } from '../Models/checkinSchema.js';
import crypto from 'crypto';
import QRCode from 'qrcode';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const router = express.Router();

// Add validation for required environment variables
const validateEnvironment = () => {
  if (!process.env.QR_SECRET) {
    throw new Error('QR_SECRET environment variable is not set');
  }
};

// QR code generation with proper error handling and validation
export const generateQRCode = async (data) => {
  try {
    // Validate environment variables first
    validateEnvironment();

    // Validate input data
    if (!data?.userId || !data?.selectedEvents) {
      throw new Error('Invalid input data for QR code generation');
    }

    // Create the data object that will be signed
    const dataToSign = {
      id: data.userId,
      events: (data.selectedEvents || []).map(e => e.eventId || e.id).filter(Boolean),
      workshops: (data.selectedWorkshops || []).map(w => w.workshopId || w.id).filter(Boolean)
    };

    // Generate signature using the QR_SECRET with proper error handling
    let signature;
    try {
      signature = crypto
        .createHmac('sha256', process.env.QR_SECRET)
        .update(JSON.stringify(dataToSign))
        .digest('hex');
    } catch (error) {
      console.error('Error generating signature:', error);
      throw new Error('Failed to generate QR code signature');
    }

    // Combine data with signature and timestamp
    const qrData = JSON.stringify({
      ...dataToSign,
      signature,
      timestamp: new Date().toISOString()
    });

    const qrCodeOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 1.0,
      margin: 1,
      width: 300
    };

    return await QRCode.toDataURL(qrData, qrCodeOptions);
  } catch (error) {
    console.error('QR Generation Error:', error);
    throw error;
  }
};

router.post('/validate-registration', async (req, res) => {
  try {
    const { qrData, eventId } = req.body;
    
    // Validate QR signature
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code format'
      });
    }

    // Verify QR signature
    const dataToSign = {
      id: parsedData.id,
      events: parsedData.events,
      workshops: parsedData.workshops || []
    };

    const expectedSignature = crypto
      .createHmac('sha256', process.env.QR_SECRET)
      .update(JSON.stringify(dataToSign))
      .digest('hex');

    if (parsedData.signature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code'
      });
    }

    // Find registration
    const registration = await Registration.findOne({
      'student.kindeId': parsedData.id
    }).populate('student');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Check if the event is in the registration
    const registeredEvent = registration.selectedEvents.find(
      e => e.eventId.toString() === eventId
    );

    if (!registeredEvent) {
      return res.status(400).json({
        success: false,
        message: 'Not registered for this event'
      });
    }

    // Check for existing check-ins
    const existingCheckIn = await CheckIn.findOne({
      registration: registration._id,
      event: eventId,
      status: 'completed'
    });

    if (existingCheckIn) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in for this event',
        checkInTime: existingCheckIn.timestamp
      });
    }

    res.json({
      success: true,
      registration: {
        _id: registration._id,
        name: registration.student.name,
        email: registration.student.email,
        studentId: registration.student.studentId,
        eventName: registeredEvent.eventName
      }
    });

  } catch (error) {
    console.error('Registration validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Validation failed'
    });
  }
});

// Complete check-in with student ID verification
router.post('/check-in', async (req, res) => {
  try {
      const { qrData } = req.body;
      
      // Parse QR data
      const parsedData = JSON.parse(qrData);
      const { userId, selectedEvents, selectedWorkshops } = parsedData;

      // Find registration
      const registration = await Registration.findOne({
          'student.kindeId': userId,
          paymentStatus: 'completed'
      }).populate('student');

      if (!registration) {
          return res.status(404).json({
              success: false,
              message: 'Invalid registration or payment pending'
          });
      }

      // Verify events exist in registration
      const eventIds = selectedEvents.map(e => e.eventId || e.id);
      const registeredEvents = registration.selectedEvents.map(e => e.eventId.toString());

      if (!eventIds.every(id => registeredEvents.includes(id))) {
          return res.status(400).json({
              success: false,
              message: 'QR code does not match registration events'
          });
      }

      // Check for existing check-in
      const existingCheckIn = await CheckIn.findOne({
          registration: registration._id,
          'selectedEvents.eventId': { $in: eventIds },
          status: 'completed'
      });

      if (existingCheckIn) {
          return res.status(400).json({
              success: false,
              message: 'Already checked in',
              details: {
                  name: registration.student.name,
                  eventName: registration.selectedEvents.find(e => e.eventId.toString() === existingCheckIn.selectedEvents[0].eventId.toString())?.eventName,
                  checkInTime: existingCheckIn.timestamp
              }
          });
      }

      // Create check-in record
      const checkIn = new CheckIn({
          registration: registration._id,
          selectedEvents: eventIds.map(eventId => ({
              eventId,
              status: 'completed'
          })),
          selectedWorkshops: selectedWorkshops?.map(workshop => ({
              workshopId: workshop.workshopId || workshop.id,
              status: 'completed'
          })) || [],
          status: 'completed',
          timestamp: new Date()
      });

      await checkIn.save();

      // Update registration status
      await Registration.findByIdAndUpdate(registration._id, {
          $set: {
              'selectedEvents.$[].status': 'completed',
              ...(selectedWorkshops?.length && {
                  'selectedWorkshops.$[].status': 'completed'
              })
          }
      });

      res.json({
          success: true,
          details: {
              name: registration.student.name,
              events: registration.selectedEvents.map(e => e.eventName).join(', '),
              workshops: registration.selectedWorkshops?.map(w => w.workshopName).join(', '),
              timestamp: checkIn.timestamp
          }
      });

  } catch (error) {
      console.error('Check-in error:', error);
      res.status(500).json({
          success: false,
          message: 'Check-in failed'
      });
  }
});


export default router;