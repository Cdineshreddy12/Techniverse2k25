import express from 'express';
import { Student } from '../Models/StudentSchema.js';
import { Registration } from '../Models/RegistrationSchema.js';
import { CheckIn } from '../Models/checkinSchema.js';
import crypto from 'crypto';
import QRCode from 'qrcode';
import dotenv from 'dotenv';
import Event from '../Models/eventModel.js';
import mongoose from 'mongoose'
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
    if (!data?.userId) {
      throw new Error('Invalid input data for QR code generation: userId is required');
    }

    // Create the data object with consistent structure
    const dataToSign = {
      id: data.userId,
      events: (data.selectedEvents || []).map(e => {
        // Handle different data structures consistently
        return (e.eventId && typeof e.eventId === 'object') ? e.eventId.toString() : 
               (e.eventId) ? e.eventId.toString() : 
               (e.id) ? e.id.toString() : null;
      }).filter(Boolean),
      workshops: (data.selectedWorkshops || []).map(w => {
        // Handle different data structures consistently
        return (w.workshopId && typeof w.workshopId === 'object') ? w.workshopId.toString() : 
               (w.workshopId) ? w.workshopId.toString() : 
               (w.id) ? w.id.toString() : null;
      }).filter(Boolean),
      // Make sure to include these even if undefined - will use falsy checks in validation
      orderId: data.orderId || (data.verificationHash ? 'direct' : undefined),
      paymentId: data.paymentId,
      amount: data.amount
    };

    console.log('QR Code dataToSign:', JSON.stringify(dataToSign, null, 2));

    // Check if verificationHash is provided directly
    let signature;
    if (data.verificationHash) {
      signature = data.verificationHash;
    } else {
      // Generate Razorpay-based signature
      signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
        .update(JSON.stringify(dataToSign))
        .digest('hex');
    }

    // Set expiration date to April 9, 2025 (or adjust as needed)
    const expirationDate = new Date('2025-04-09T23:59:59.999Z');

    // Combine data with signature and timestamp
    const qrData = JSON.stringify({
      ...dataToSign,
      signature,
      timestamp: new Date().toISOString(),
      validUntil: expirationDate.toISOString()
    });

    const qrCodeOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 1.0,
      margin: 1,
      width: 300
    };

    console.log('Generated QR data:', qrData);
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
      console.log('Parsed QR data:', JSON.stringify(parsedData, null, 2));
      
      // Verify QR code hasn't expired
      const validUntil = new Date(parsedData.validUntil);
      if (validUntil < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'QR code has expired'
        });
      }

      // Check if we have events data
      if (!parsedData.events || !Array.isArray(parsedData.events) || parsedData.events.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No event data found in QR code'
        });
      }

      // Check if event is included in QR data
      if (!parsedData.events.includes(eventId) && !parsedData.events.some(e => e.toString() === eventId.toString())) {
        return res.status(400).json({
          success: false,
          message: 'This ticket is not valid for this event'
        });
      }

      // Different validation paths based on QR code type
      if (parsedData.orderId && parsedData.paymentId) {
        // Normal payment flow QR
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
          console.error('QR validation failed - signature mismatch:', {
            expected: expectedSignature,
            received: parsedData.signature
          });
          
          return res.status(400).json({
            success: false,
            message: 'Invalid QR code signature'
          });
        }
      } else if (parsedData.signature) {
        // Legacy or custom signature flow
        // Just use the existing signature and assume it was generated correctly
        console.log('Using legacy/custom signature validation');
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid QR code format - missing signature data'
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

    // Different query strategies based on QR type
    let registrationQuery = {
      student: student._id,
      kindeId: parsedData.id,
      paymentStatus: 'completed'
    };

    // Add additional filters for payment-based QRs
    if (parsedData.orderId && parsedData.paymentId) {
      registrationQuery['paymentDetails.razorpayOrderId'] = parsedData.orderId;
      registrationQuery['paymentDetails.razorpayPaymentId'] = parsedData.paymentId;
    }

    const registration = await Registration.findOne(registrationQuery)
      .populate('student')
      .populate('selectedEvents.eventId');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found or payment pending'
      });
    }

    // Verify amount matches only if amount is provided
    if (parsedData.amount && registration.amount !== parsedData.amount) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount'
      });
    }

    // Find the event in registration data
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

    // Create check-in record with student field properly populated
    const checkIn = new CheckIn({
      registration: registration._id,
      event: eventId,
      student: {
        _id: student._id,
        kindeId: student.kindeId, // This is the missing required field
        name: student.name
      },
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


router.post('/validate-workshop-registration', async (req, res) => {
  try {
    const { qrData, workshopId } = req.body;
    
    if (!workshopId || !qrData) {
      return res.status(400).json({
        success: false,
        message: 'Workshop ID and QR data are required'
      });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
      console.log('Parsed QR data:', JSON.stringify(parsedData, null, 2));
      
      // Verify QR code hasn't expired
      const validUntil = new Date(parsedData.validUntil);
      if (validUntil < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'QR code has expired'
        });
      }

      // Check if we have workshops data
      if (!parsedData.workshops || !Array.isArray(parsedData.workshops) || parsedData.workshops.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No workshop data found in QR code'
        });
      }

      // Check if workshop is included in QR data
      if (!parsedData.workshops.includes(workshopId) && 
          !parsedData.workshops.some(w => w.toString() === workshopId.toString())) {
        return res.status(400).json({
          success: false,
          message: 'This ticket is not valid for this workshop'
        });
      }

      // Different validation paths based on QR code type
      if (parsedData.orderId && parsedData.paymentId) {
        // Normal payment flow QR
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
          console.error('QR validation failed - signature mismatch:', {
            expected: expectedSignature,
            received: parsedData.signature
          });
          
          return res.status(400).json({
            success: false,
            message: 'Invalid QR code signature'
          });
        }
      } else if (parsedData.signature) {
        // Legacy or custom signature flow
        console.log('Using legacy/custom signature validation');
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid QR code format - missing signature data'
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

    // Different query strategies based on QR type
    let registrationQuery = {
      student: student._id,
      kindeId: parsedData.id,
      paymentStatus: 'completed',
      'selectedWorkshops.workshopId': workshopId
    };

    // Add additional filters for payment-based QRs
    if (parsedData.orderId && parsedData.paymentId) {
      registrationQuery['paymentDetails.razorpayOrderId'] = parsedData.orderId;
      registrationQuery['paymentDetails.razorpayPaymentId'] = parsedData.paymentId;
    }

    const Workshop = mongoose.model('Workshop');
    const registration = await Registration.findOne(registrationQuery)
      .populate('student')
      .populate({
        path: 'selectedWorkshops.workshopId',
        model: Workshop
      });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found or payment pending'
      });
    }

    // Verify amount matches only if amount is provided
    if (parsedData.amount && registration.amount !== parsedData.amount) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount'
      });
    }

    // Find the workshop in registration data
    const registeredWorkshop = registration.selectedWorkshops.find(
      w => w.workshopId && w.workshopId._id && w.workshopId._id.toString() === workshopId
    );

    if (!registeredWorkshop) {
      return res.status(400).json({
        success: false,
        message: 'Not registered for this workshop'
      });
    }

    const existingCheckIn = await CheckIn.findOne({
      registration: registration._id,
      event: workshopId, // Using event field for workshop too
      status: 'completed'
    });

    if (existingCheckIn) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in for this workshop',
        checkInTime: existingCheckIn.timestamp
      });
    }

    res.json({
      success: true,
      isWorkshop: true,
      registration: {
        _id: registration._id,
        name: registration.student.name,
        email: registration.student.email,
        studentId: registration.student.studentId,
        workshopName: registeredWorkshop.workshopName,
        workshop: {
          _id: registeredWorkshop.workshopId._id,
          name: registeredWorkshop.workshopId.title,
          date: registeredWorkshop.workshopId.date,
          venue: registeredWorkshop.workshopId.venue,
          instructor: registeredWorkshop.workshopId.instructor
        }
      }
    });

  } catch (error) {
    console.error('Workshop registration validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Validation failed',
      error: error.message
    });
  }
});


router.post('/workshop-check-in', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { qrData, workshopId } = req.body;
    
    if (!workshopId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Workshop ID is required'
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
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code signature'
      });
    }

    // Verify the specific workshop is in the QR code
    if (!parsedData.workshops || !parsedData.workshops.includes(workshopId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'QR code does not include this workshop'
      });
    }

    // Verify student
    const student = await Student.findOne({ kindeId: parsedData.id }).session(session);
    if (!student) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if already checked in BEFORE further processing to prevent race conditions
    const existingCheckIn = await CheckIn.findOne({
      event: workshopId, // Using event field for workshop
      'student.kindeId': parsedData.id,
      status: 'completed'
    }).session(session);

    if (existingCheckIn) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Already checked in for this workshop',
        details: {
          name: student.name,
          checkInTime: existingCheckIn.timestamp
        }
      });
    }

    // Get registration
    const registration = await Registration.findOne({
      student: student._id,
      kindeId: parsedData.id,
      paymentStatus: 'completed',
      'selectedWorkshops.workshopId': workshopId
    }).populate('student').populate('selectedWorkshops.workshopId').session(session);

    if (!registration) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Not registered for this workshop or payment pending'
      });
    }

    // Verify amount matches only if amount is provided
    if (parsedData.amount && registration.amount !== parsedData.amount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount'
      });
    }

    const registeredWorkshop = registration.selectedWorkshops.find(
      w => w.workshopId && w.workshopId._id && w.workshopId._id.toString() === workshopId
    );

    if (!registeredWorkshop) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Not registered for this workshop'
      });
    }

    // Get workshop details
    const Workshop = mongoose.model('Workshop');
    const workshop = await Workshop.findById(workshopId).session(session);
    
    if (!workshop) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Workshop not found'
      });
    }

    // Create check-in record with student reference
    const checkIn = new CheckIn({
      registration: registration._id,
      event: workshopId, // Using event field for workshop
      student: {
        _id: student._id,
        kindeId: student.kindeId,
        name: student.name
      },
      status: 'completed',
      timestamp: new Date(),
      verificationMethod: 'qr_only'
    });

    await checkIn.save({ session });

    // Update workshop status in registration
    await Registration.updateOne(
      { 
        _id: registration._id,
        'selectedWorkshops.workshopId': workshopId
      },
      {
        $set: {
          'selectedWorkshops.$.status': 'completed'
        }
      },
      { session }
    );

    // Update workshop check-in count
    await Workshop.findByIdAndUpdate(
      workshopId,
      {
        $inc: { checkInCount: 1 }
      },
      { session }
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      isWorkshop: true,
      details: {
        name: registration.student.name,
        email: registration.student.email,
        studentId: registration.student.studentId,
        mobileNumber: registration.student.mobileNumber,
        workshop: registeredWorkshop.workshopName,
        workshopDetails: {
          name: workshop.title,
          date: workshop.date,
          venue: workshop.venue,
          instructor: workshop.instructor
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
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    
    console.error('Workshop check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Workshop check-in failed',
      debug: {
        errorMessage: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
});


export default router;