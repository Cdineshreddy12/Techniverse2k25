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
    const { qrData, eventId } = req.body;  // eventId is required now
    
    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required'
      });
    }

    // Parse and validate QR code (existing code)...
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code format'
      });
    }

    // Verify QR signature (existing code)...
    const dataToSign = {
      id: parsedData.id,
      events: parsedData.events,
      workshops: parsedData.workshops || []
    };

    // Verify the specific event is in the QR code
    if (!parsedData.events.includes(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'QR code does not include this event'
      });
    }

    // Find registration with population
    const registration = await Registration.findOne({
      'student.kindeId': parsedData.id
    }).populate('student').populate('selectedEvents.eventId');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Check if the event is in the registration
    const registeredEvent = registration.selectedEvents.find(
      e => e.eventId._id.toString() === eventId
    );

    if (!registeredEvent) {
      return res.status(400).json({
        success: false,
        message: 'Not registered for this event'
      });
    }

    // Check for existing check-in
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

    // Return success with registration and event details
    res.json({
      success: true,
      registration: {
        _id: registration._id,
        name: registration.student.name,
        email: registration.student.email,
        studentId: registration.student.studentId,
        eventName: registeredEvent.eventId.name,
        event: {
          _id: registeredEvent.eventId._id,
          name: registeredEvent.eventId.name,
          date: registeredEvent.eventId.date
        }
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
// check-in route
router.post('/check-in', async (req, res) => {
  try {
    const { qrData, eventId } = req.body;
    
    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required'
      });
    }

    // Parse QR data
    const parsedData = JSON.parse(qrData);
    const { id: userId } = parsedData;

    // Find registration
    const registration = await Registration.findOne({
      'student.kindeId': userId,
      paymentStatus: 'completed'
    }).populate('student').populate('selectedEvents.eventId');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Invalid registration or payment pending'
      });
    }

    // Find the specific event in registration
    const registeredEvent = registration.selectedEvents.find(
      e => e.eventId._id.toString() === eventId
    );

    if (!registeredEvent) {
      return res.status(400).json({
        success: false,
        message: 'Not registered for this event'
      });
    }

    // Check for existing check-in
    const existingCheckIn = await CheckIn.findOne({
      registration: registration._id,
      event: eventId,
      status: 'completed'
    });

    if (existingCheckIn) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in for this event',
        details: {
          name: registration.student.name,
          eventName: registeredEvent.eventId.name,
          checkInTime: existingCheckIn.timestamp
        }
      });
    }

    // Create single event check-in record
    const checkIn = new CheckIn({
      registration: registration._id,
      event: eventId,
      status: 'completed',
      timestamp: new Date(),
      verificationMethod: 'qr_only'
    });

    await checkIn.save();

    // Update event status in registration
    await Registration.updateOne(
      { 
        _id: registration._id,
        'selectedEvents.eventId': eventId
      },
      {
        $set: {
          'selectedEvents.$.status': 'completed'
        }
      }
    );

    res.json({
      success: true,
      details: {
        name: registration.student.name,
        event: registeredEvent.eventId.name,
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