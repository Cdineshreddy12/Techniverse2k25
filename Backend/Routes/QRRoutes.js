import express from 'express';
import { Student } from '../Models/StudentSchema.js';
import { Registration } from '../Models/RegistrationSchema.js';
import { CheckIn } from '../Models/checkinSchema.js';
import crypto from 'crypto';
import QRCode from 'qrcode';
import dotenv from 'dotenv';
import Event from '../Models/eventModel.js';

dotenv.config();

const router = express.Router();

// Environment validation
const validateEnvironment = () => {
  if (!process.env.RAZORPAY_SECRET_KEY) {
    throw new Error('Missing required environment variable: RAZORPAY_SECRET_KEY');
  }
};

// Enhanced QR code generation with Razorpay verification
export const generateQRCode = async (data) => {
  try {
    validateEnvironment();

    // Validate required input data
    if (!data?.userId || !data?.selectedEvents) {
      throw new Error('Invalid input data for QR code generation');
    }

    // Create the data object with Razorpay verification
    const dataToSign = {
      id: data.userId,
      events: (data.selectedEvents || []).map(e => e.eventId || e.id).filter(Boolean),
      workshops: (data.selectedWorkshops || []).map(w => w.workshopId || w.id).filter(Boolean),
      orderId: data.orderId,
      paymentId: data.paymentId,
      amount: data.amount
    };

    // Generate Razorpay-based signature
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
      .update(JSON.stringify(dataToSign))
      .digest('hex');

    // Combine data with signature and timestamp
    const qrData = JSON.stringify({
      ...dataToSign,
      signature,
      timestamp: new Date().toISOString(),
      validUntil: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString() // 7 days validity
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

// Enhanced validation endpoint with Razorpay verification
router.post('/validate-registration', async (req, res) => {
  try {
    const { qrData, eventId } = req.body;
    
    if (!eventId || !qrData) {
      return res.status(400).json({
        success: false,
        message: 'Event ID and QR data are required'
      });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
      
      // Verify QR code hasn't expired
      const validUntil = new Date(parsedData.validUntil);
      if (validUntil < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'QR code has expired'
        });
      }

      // Verify Razorpay signature
      const dataToVerify = {
        id: parsedData.id,
        events: parsedData.events,
        workshops: parsedData.workshops,
        orderId: parsedData.orderId,
        paymentId: parsedData.paymentId,
        amount: parsedData.amount
      };

      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
        .update(JSON.stringify(dataToVerify))
        .digest('hex');

      if (parsedData.signature !== expectedSignature) {
        return res.status(400).json({
          success: false,
          message: 'Invalid QR code signature'
        });
      }

    } catch (error) {
      console.error('QR parsing error:', error);
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code format'
      });
    }

    // Validate student and registration
    const student = await Student.findOne({ kindeId: parsedData.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const registration = await Registration.findOne({
      student: student._id,
      kindeId: parsedData.id,
      paymentStatus: 'completed',
      'paymentDetails.razorpayOrderId': parsedData.orderId,
      'paymentDetails.razorpayPaymentId': parsedData.paymentId
    }).populate('student').populate('selectedEvents.eventId');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found or payment pending'
      });
    }

    // Verify amount matches
    if (registration.amount !== parsedData.amount) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount'
      });
    }

    const registeredEvent = registration.selectedEvents.find(
      e => e.eventId._id.toString() === eventId
    );

    if (!registeredEvent) {
      return res.status(400).json({
        success: false,
        message: 'Not registered for this event'
      });
    }

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
      message: 'Validation failed',
      error: error.message
    });
  }
});

// Check-in route with Razorpay verification
router.post('/check-in', async (req, res) => {
  try {
    const { qrData, eventId } = req.body;
    
    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required'
      });
    }

    // Parse and verify QR data
    const parsedData = JSON.parse(qrData);

    // Verify Razorpay signature
    const dataToVerify = {
      id: parsedData.id,
      events: parsedData.events,
      workshops: parsedData.workshops,
      orderId: parsedData.orderId,
      paymentId: parsedData.paymentId,
      amount: parsedData.amount
    };

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
      .update(JSON.stringify(dataToVerify))
      .digest('hex');

    if (parsedData.signature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code signature'
      });
    }

    // Verify the specific event is in the QR code
    if (!parsedData.events.includes(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'QR code does not include this event'
      });
    }

    // Verify student and registration
    const student = await Student.findOne({ kindeId: parsedData.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const registration = await Registration.findOne({
      student: student._id,
      kindeId: parsedData.id,
      paymentStatus: 'completed',
      'paymentDetails.razorpayOrderId': parsedData.orderId,
      'paymentDetails.razorpayPaymentId': parsedData.paymentId
    }).populate('student').populate('selectedEvents.eventId');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Invalid registration or payment pending'
      });
    }

    // Verify amount matches
    if (registration.amount !== parsedData.amount) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount'
      });
    }

    const registeredEvent = registration.selectedEvents.find(
      e => e.eventId && e.eventId._id && e.eventId._id.toString() === eventId
    );

    if (!registeredEvent) {
      return res.status(400).json({
        success: false,
        message: 'Not registered for this event'
      });
    }

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

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Create check-in record
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

    // Update event check-in count
    await Event.findByIdAndUpdate(eventId, {
      $inc: { checkInCount: 1 }
    });

    res.json({
      success: true,
      details: {
        name: registration.student.name,
        email: registration.student.email,
        studentId: registration.student.studentId,
        mobileNumber: registration.student.mobileNumber,
        event: registeredEvent.eventId.name,
        eventDetails: {
          name: registeredEvent.eventId.name,
          date: registeredEvent.eventId.date,
          tag: registeredEvent.eventId.tag,
          registrationType: registeredEvent.registrationType
        },
        registration: {
          id: registration._id,
          amount: registration.amount,
          paymentId: registration.paymentDetails.razorpayPaymentId,
          orderId: registration.paymentDetails.razorpayOrderId
        },
        checkIn: {
          timestamp: checkIn.timestamp,
          registrationId: registration._id
        }
      }
    });

  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Check-in failed',
      debug: {
        errorMessage: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
});

export default router;