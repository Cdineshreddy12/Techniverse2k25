import express from 'express';
import { OfflineUser, OfflineRegistration } from '../Models/OfflineModel.js';
import  Event  from '../Models/eventModel.js';
import  Workshop  from '../Models/workShopModel.js';
import OfflineCheckIn from '../Models/offline.js';
import crypto from 'crypto';
import QRCode from 'qrcode';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import CoordinatorStats from '../Models/CoOrdinatorSchema.js';
import Sequence from '../Models/sequenceSchema.js';
import { kindeMiddleware } from '../KindeAuth.js';
import { requireCoordinator } from '../KindeAuth.js';
import { sendUserCredentials } from '../utils/EmailService.js';
dotenv.config();
const router = express.Router();

// Error handling middleware
const errorHandler = (err, req, res) => {
  console.error('Error:', err);
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: Object.values(err.errors).map(e => e.message)
    });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      error: `${field} already exists`
    });
  }
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
};

// QR Generation Function
const generateOfflineQR = async (data) => {
  try {
    if (!process.env.OFFLINE_QR_SECRET) {
      throw new Error('OFFLINE_QR_SECRET environment variable is not set');
    }

    const dataToSign = {
      type: 'offline',
      receiptNumber: data.receiptNumber,
      userId: data.userId,
      events: (data.events || []).map(e => e.eventId).filter(Boolean),
      workshops: (data.workshops || []).map(w => w.workshopId).filter(Boolean),
      registrationId: data.registrationId,
      timestamp: new Date().toISOString(),
      expiryTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    };

    const signature = crypto
      .createHmac('sha256', process.env.OFFLINE_QR_SECRET)
      .update(JSON.stringify(dataToSign))
      .digest('hex');

    return await QRCode.toDataURL(JSON.stringify({
      ...dataToSign,
      signature
    }), {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 1.0,
      margin: 1,
      width: 300
    });
  } catch (error) {
    console.error('QR Generation Error:', error);
    throw error;
  }
};



// User Login
// User Login with improved password handling
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await OfflineUser.findOne({ email });
    if (!user || !user.isOfflineRegistered) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Get registration details
    const registration = await OfflineRegistration.findOne({ userId: user._id })
      .populate('events.eventId')
      .populate('workshops.workshopId');

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, type: 'offline' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        branch: user.branch,
        class: user.class
      },
      registration: registration ? {
        receiptNumber: registration.receiptNumber,
        qrCode: registration.qrCode,
        registrationType: registration.registrationType,
        events: registration.events.map(e => ({
          id: e.eventId._id,
          name: e.eventId.title,
          status: e.status
        })),
        workshops: registration.workshops.map(w => ({
          id: w.workshopId._id,
          name: w.workshopId.title,
          status: w.status
        }))
      } : null
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Get User Dashboard Data
router.get('/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get full user details
    const user = await OfflineUser.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get registration with populated events and workshops
    const registration = await OfflineRegistration.findOne({ userId })
      .populate({
        path: 'events.eventId',
        select: '_id title status'
      })
      .populate({
        path: 'workshops.workshopId',
        select: '_id title status'
      });

    // Get check-in history if registration exists
    const checkIns = registration ? await OfflineCheckIn.find({ 
      receiptNumber: registration.receiptNumber 
    })
      .populate('event', 'title')
      .populate('workshop', 'title')
      .sort('-createdAt') : [];

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          studentId: user.studentId,
          branch: user.branch,
          class: user.class
        },
        registration: registration ? {
          receiptNumber: registration.receiptNumber,
          qrCode: registration.qrCode,
          registrationType: registration.registrationType,
          amount: registration.amount,
          paymentStatus: registration.paymentStatus,
          events: registration.events.map(e => ({
            id: e.eventId._id,
            name: e.eventId.title,
            status: e.status,
            registeredAt: e.registeredAt
          })),
          workshops: registration.workshops.map(w => ({
            id: w.workshopId._id,
            name: w.workshopId.title,
            status: w.status,
            registeredAt: w.registeredAt
          }))
        } : null,
        checkIns: checkIns.map(c => ({
          id: c._id,
          type: c.type,
          itemName: c.type === 'event' ? c.event?.title : c.workshop?.title,
          timestamp: c.timestamp,
          verifiedBy: c.verifiedBy,
          status: c.status
        }))
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    errorHandler(error, req, res);
  }
});

// Get Registration Details
router.get('/registration/:receiptNumber', async (req, res) => {
  try {
    const { receiptNumber } = req.params;

    const registration = await OfflineRegistration.findOne({ receiptNumber })
      .populate('userId')
      .populate('events.eventId')
      .populate('workshops.workshopId');

    if (!registration) {
      throw new Error('Registration not found');
    }

    res.json({
      success: true,
      registration: {
        receiptNumber: registration.receiptNumber,
        qrCode: registration.qrCode,
        registrationType: registration.registrationType,
        user: {
          name: registration.userId.name,
          studentId: registration.userId.studentId,
          email: registration.userId.email,
          branch: registration.userId.branch,
          class: registration.userId.class
        },
        events: registration.events.map(e => ({
          id: e.eventId._id,
          name: e.eventId.title,
          status: e.status
        })),
        workshops: registration.workshops.map(w => ({
          id: w.workshopId._id,
          name: w.workshopId.title,
          status: w.status
        }))
      }
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});


const getNextSequenceValue = async (sequenceName) => {
  const sequenceDoc = await Sequence.findByIdAndUpdate(
    sequenceName,
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDoc.sequence_value;
};

const generateReceiptNumber = async () => {
  try {
    const sequenceNumber = await getNextSequenceValue('receiptNumber');
    const paddedNumber = sequenceNumber.toString().padStart(4, '0');
    const receiptNumber = `TK25${paddedNumber}`;
    return receiptNumber;
  } catch (error) {
    console.error('Error generating receipt number:', error);
    throw new Error('Failed to generate receipt number');
  }
};



router.delete('/delete-orphaned-registrations',  async (req, res) => {
  try {
    // First, get all user IDs from OfflineUser collection
    const allUsers = await OfflineUser.find({}, '_id');
    const validUserIds = allUsers.map(user => user._id.toString());
    
    // Find registrations where userId is not in the list of valid user IDs
    const orphanedRegistrations = await OfflineRegistration.find({});
    
    // Filter to only get registrations with missing userIds
    const orphaned = orphanedRegistrations.filter(reg => {
      // Check if userId exists and is valid
      return !reg.userId || !validUserIds.includes(reg.userId.toString());
    });
    
    if (orphaned.length === 0) {
      return res.json({
        success: true,
        message: 'No orphaned registrations found',
        count: 0
      });
    }
    
    // Get the IDs of orphaned registrations
    const orphanedIds = orphaned.map(reg => reg._id);
    
    // Delete orphaned registrations
    const deleteResult = await OfflineRegistration.deleteMany({
      _id: { $in: orphanedIds }
    });
    
    // Delete related check-ins
    const receiptNumbers = orphaned.map(reg => reg.receiptNumber);
    const checkInDeleteResult = await OfflineCheckIn.deleteMany({
      receiptNumber: { $in: receiptNumbers }
    });
    
    res.json({
      success: true,
      message: `Successfully deleted ${deleteResult.deletedCount} orphaned registrations`,
      count: deleteResult.deletedCount,
      checkInsDeleted: checkInDeleteResult.deletedCount,
      details: orphaned.map(reg => ({
        registrationId: reg._id,
        receiptNumber: reg.receiptNumber,
        missingUserId: reg.userId
      }))
    });
  } catch (error) {
    console.error('Error deleting orphaned registrations:', error);
    errorHandler(error, req, res);
  }
});

// Create offline user
router.post('/create-offline-user',kindeMiddleware,requireCoordinator, async (req, res) => {
  try {
    const { studentId, name, email, branch, class: className, mobileNo } = req.body;
    
    console.log('Starting user creation for:', email);

    // Check for existing user
    const existingUser = await OfflineUser.findOne({
      $or: [{ studentId }, { email }, { mobileNo }]
    });

    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(200).json({
        success: true,
        message: 'User already exists',
        user: existingUser // Returning the existing user's data
      });
    }
    

    // Generate plain password
    const plainPassword = Math.random().toString(36).slice(-8);
    console.log('Generated plain password:', plainPassword);

    // Create user instance
    const user = new OfflineUser({
      studentId,
      name,
      email,
      branch,
      class: className,
      mobileNo,
      password: plainPassword, // Store plain password, middleware will hash it
      isOfflineRegistered: true
    });

    // Save user
    console.log('Saving user...');
    await user.save();
    console.log('User saved successfully');

    // Verify the password works
    console.log('Verifying password...');
    const passwordVerification = await user.verifyPassword(plainPassword);
    console.log('Password verification result:', passwordVerification);

    if (!passwordVerification) {
      console.error('Password verification failed immediately after creation');
      throw new Error('Password verification failed');
    }


    // Send credentials via email
    try {
      await sendUserCredentials({
        email,
        name,
        plainPassword
      });
      console.log('Credentials email sent successfully');
    } catch (emailError) {
      console.error('Failed to send credentials email:', emailError);
      // Don't throw error here, continue with response
    }

    // Send response
    res.json({
      success: true,
      userId: user._id,
      credentials: {
        email,
        password: plainPassword
      }
    });

  } catch (error) {
    console.error('User creation error:', error);
    errorHandler(error, req, res);
  }
});

router.post('/search-registration', async (req, res) => {
  try {
    const { studentId, email } = req.body;

    // Find user first
    const user = await OfflineUser.findOne({
      studentId,
      email,
      isOfflineRegistered: true
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No registration found with these details'
      });
    }

    // Find registration
    const registration = await OfflineRegistration.findOne({ userId: user._id })
      .populate('events.eventId', 'title')
      .populate('workshops.workshopId', 'title');

    if (!registration) {
      return res.status(404).json({
        success: false,
        error: 'No registration found'
      });
    }

    res.json({
      success: true,
      registration: {
        _id: registration._id,
        user: {
          studentId: user.studentId,
          name: user.name,
          email: user.email,
          branch: user.branch,
          class: user.class,
          mobileNo: user.mobileNo
        },
        events: registration.events.map(e => ({
          id: e.eventId._id,
          name: e.eventId.title
        })),
        workshops: registration.workshops.map(w => ({
          id: w.workshopId._id,
          name: w.workshopId.title
        })),
        registrationType: registration.registrationType
      }
    });
  } catch (error) {
    console.error('Search registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search registration'
    });
  }
});


// Create offline registration
// Create offline registration
router.post('/create-offline-registration',kindeMiddleware,requireCoordinator, async (req, res) => {
  try {
    const { userId, events, workshops, amount, receivedBy } = req.body;
    const { coordinatorId, name: coordinatorName } = req.user; // From Kinde auth

    const user = await OfflineUser.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify events and workshops exist
    const verifiedEvents = await Event.find({ _id: { $in: events.map(e => e.eventId) } });
    const verifiedWorkshops = await Workshop.find({ _id: { $in: workshops.map(w => w.workshopId) } });

    if (events.length > 0 && verifiedEvents.length !== events.length) {
      throw new Error('One or more events not found');
    }
    if (workshops.length > 0 && verifiedWorkshops.length !== workshops.length) {
      throw new Error('One or more workshops not found');
    }

    // Create registration
    const registration = new OfflineRegistration({
      userId,
      events: events.map(e => ({
        eventId: e.eventId,
        status: 'registered'
      })),
      workshops: workshops.map(w => ({
        workshopId: w.workshopId,
        status: 'registered'
      })),
      amount,
      receivedBy: coordinatorName,
      registrationType: workshops.length > 0 ? 
        (events.length > 0 ? 'both' : 'workshop') : 'events',
      paymentStatus: 'completed',
      studentClass: user.class?.toUpperCase() || 'UNKNOWN', // Add null check
      coordinatorId
    });

    const receiptNumber = await generateReceiptNumber();
    
    // Generate QR code
    const qrCode = await generateOfflineQR({
      receiptNumber,
      userId,
      events: verifiedEvents,
      workshops: verifiedWorkshops,
      registrationId: registration._id
    });

    registration.qrCode = qrCode;
    registration.receiptNumber = receiptNumber;

    await registration.save();

    // Update coordinator stats
    let coordinatorStats = await CoordinatorStats.findOne({ coordinatorId });
    if (!coordinatorStats) {
      coordinatorStats = new CoordinatorStats({
        coordinatorId,
        name: coordinatorName
      });
    }
    coordinatorStats.addRegistration(registration);
    await coordinatorStats.save();

    res.json({
      success: true,
      registration: {
        receiptNumber: registration.receiptNumber,
        qrCode,
        registrationId: registration._id,
        events: verifiedEvents.map(e => ({ id: e._id, name: e.title })),
        workshops: verifiedWorkshops.map(w => ({ id: w._id, name: w.title }))
      }
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

// Add this new route for class-wise statistics
router.get('/class-wise-stats', kindeMiddleware,requireCoordinator, async (req, res) => {
  try {
    // Get all registrations
    const registrations = await OfflineRegistration.find()
      .populate('userId', 'class');

    // Process class-wise data
    const classWiseData = registrations.reduce((acc, reg) => {
      const className = (reg.studentClass || reg.userId?.class || 'UNKNOWN').toUpperCase();
      
      if (!acc[className]) {
        acc[className] = {
          totalAmount: 0,
          registrations: 0,
          events: 0,
          workshops: 0,
          registrationTypes: {
            events: 0,
            workshop: 0,
            both: 0
          }
        };
      }

      acc[className].totalAmount += reg.amount || 0;
      acc[className].registrations++;
      acc[className].events += reg.events.length;
      acc[className].workshops += reg.workshops.length;
      acc[className].registrationTypes[reg.registrationType]++;

      return acc;
    }, {});

    // Get total stats
    const totalStats = Object.values(classWiseData).reduce((total, classData) => {
      total.totalAmount += classData.totalAmount;
      total.registrations += classData.registrations;
      total.events += classData.events;
      total.workshops += classData.workshops;
      return total;
    }, { totalAmount: 0, registrations: 0, events: 0, workshops: 0 });

    res.json({
      success: true,
      data: {
        classWiseData,
        totalStats,
        // Add daily statistics
        dailyStats: await getDailyStats()
      }
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

// Helper function to get daily statistics
async function getDailyStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const registrations = await OfflineRegistration.find({
    createdAt: { $gte: today }
  });

  return {
    totalRegistrations: registrations.length,
    totalAmount: registrations.reduce((sum, reg) => sum + (reg.amount || 0), 0),
    registrationTypes: registrations.reduce((acc, reg) => {
      acc[reg.registrationType] = (acc[reg.registrationType] || 0) + 1;
      return acc;
    }, {})
  };
}


router.get('/coordinator-stats/:coordinatorId',kindeMiddleware,requireCoordinator, async (req, res) => {
  try {
    const { coordinatorId } = req.params;
    
    let stats = await CoordinatorStats.findOne({ coordinatorId })
      .populate({
        path: 'registrations.registrationId',
        populate: { path: 'userId', select: 'class' }
      });
    
    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'Coordinator stats not found'
      });
    }

    // Get class-wise registration data
   // Get class-wise registration data with null check
   const classWiseData = stats.registrations.reduce((acc, reg) => {
    const className = (reg.studentClass || 
                      reg.registrationId?.userId?.class || 
                      'UNKNOWN').toUpperCase();
    
    if (!acc[className]) {
      acc[className] = {
        count: 0,
        amount: 0
      };
    }
    acc[className].count++;
    acc[className].amount += reg.amount || 0;
    return acc;
  }, {});

    // Get registration type data
    const typeWiseData = stats.registrations.reduce((acc, reg) => {
      const type = reg.registrationType;
      if (!acc[type]) {
        acc[type] = {
          count: 0,
          amount: 0
        };
      }
      acc[type].count++;
      acc[type].amount += reg.amount;
      return acc;
    }, {});

    res.json({
      success: true,
      stats: {
        totalAmount: stats.totalAmount,
        totalRegistrations: stats.totalRegistrations,
        totalCheckIns: stats.totalCheckIns,
        lastActive: stats.lastActive,
        classWiseData,
        typeWiseData,
        // Last 5 activities
        recentActivity: [
          ...stats.registrations.slice(-5).map(r => ({
            type: 'registration',
            amount: r.amount,
            timestamp: r.timestamp,
            studentClass: r.studentClass
          })),
          ...stats.checkIns.slice(-5).map(c => ({
            type: 'check-in',
            itemType: c.type,
            timestamp: c.timestamp
          }))
        ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5)
      }
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

// Get all coordinators summary
router.get('/coordinators-summary',kindeMiddleware,requireCoordinator, async (req, res) => {
  try {
    const stats = await CoordinatorStats.find().sort('-totalAmount');
    
    const summary = stats.map(coord => ({
      coordinatorId: coord.coordinatorId,
      name: coord.name,
      totalAmount: coord.totalAmount,
      totalRegistrations: coord.totalRegistrations,
      totalCheckIns: coord.totalCheckIns,
      lastActive: coord.lastActive
    }));

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

router.post('/check-in', kindeMiddleware,requireCoordinator, async (req, res) => {
  try {
    const { qrData, itemId, type, verifiedBy, validationMethod = 'qr' } = req.body;
    const { coordinatorId, name: coordinatorName } = req.user;

    if (!['event', 'workshop'].includes(type)) {
      throw new Error('Invalid type. Must be either "event" or "workshop"');
    }

    let registration;

    // Handle different validation methods
    if (validationMethod === 'manual') {
      registration = await OfflineRegistration.findOne({ receiptNumber: qrData })
        .populate('userId')
        .populate({
          path: `${type}s.${type}Id`,
          select: 'name startTime endTime'
        });
    } else {
      let parsedQR;
      try {
        parsedQR = JSON.parse(qrData);
      } catch (error) {
        throw new Error('Invalid QR data format');
      }

      if (parsedQR.type !== 'offline') {
        throw new Error('Invalid QR code type');
      }

      registration = await OfflineRegistration.findById(parsedQR.registrationId)
        .populate('userId')
        .populate({
          path: `${type}s.${type}Id`,
          select: 'name startTime endTime'
        });
    }

    if (!registration) {
      throw new Error('Registration not found');
    }

    // Verify registration includes this item
    const itemsArray = type === 'event' ? registration.events : registration.workshops;
    const itemField = type === 'event' ? 'eventId' : 'workshopId';
    
    if (!Array.isArray(itemsArray)) {
      throw new Error(`No ${type}s array found in registration`);
    }

    // Debug logging with proper ID extraction
    console.log(`${type}s in registration:`, itemsArray.map(item => ({
      id: item[itemField]?._id?.toString() || item[itemField]?.toString(),
      status: item.status
    })));

    // Fixed comparison logic
    const registeredItem = itemsArray.find(item => {
      const registeredItemId = item[itemField]?._id?.toString() || item[itemField]?.toString();
      return registeredItemId === itemId;
    });

    if (!registeredItem) {
      const availableIds = itemsArray.map(item => 
        item[itemField]?._id?.toString() || item[itemField]?.toString()
      ).join(', ');
      throw new Error(`${type} not found in registration. Available ${type} IDs: ${availableIds}`);
    }

    // Check if already attended
    if (registeredItem.status === 'attended') {
      throw new Error(`Already attended this ${type}`);
    }

    // Verify the event/workshop is currently active
    const itemDetails = registeredItem[itemField];
    if (itemDetails?.startTime && itemDetails?.endTime) {
      const now = new Date();
      if (now < new Date(itemDetails.startTime) || now > new Date(itemDetails.endTime)) {
        throw new Error(`This ${type} is not currently active`);
      }
    }

    // Check for existing check-in
    const existingCheckIn = await OfflineCheckIn.findOne({
      registration: registration._id,
      type: type,
      [type]: itemId
    });

    if (existingCheckIn) {
      throw new Error(`Already checked in for this ${type}`);
    }

    // Create check-in record
    const checkIn = new OfflineCheckIn({
      registration: registration._id,
      [type]: itemId,
      type,
      status: 'completed',
      verificationMethod: validationMethod === 'manual' ? 'manual_receipt' : 'offline_qr',
      verifiedBy: coordinatorName,
      coordinatorId,
      receiptNumber: registration.receiptNumber,
      studentDetails: {
        name: registration.userId.name.toUpperCase(),
        studentId: registration.userId.studentId.toUpperCase(),
        branch: registration.userId.branch.toUpperCase(),
        class: registration.userId.class.toUpperCase()
      },
      coordinatorDetails: {
        name: coordinatorName,
        id: coordinatorId
      }
    });

    await checkIn.save();

    // Update coordinator stats
    await CoordinatorStats.findOneAndUpdate(
      { coordinatorId },
      {
        $setOnInsert: { name: coordinatorName },
        $inc: { [`${type}CheckIns`]: 1, totalCheckIns: 1 },
        $push: { recentCheckIns: { $each: [checkIn._id], $slice: -50 } }
      },
      { upsert: true, new: true }
    );

    // Update registration status
    const updateResult = await OfflineRegistration.updateOne(
      { 
        _id: registration._id,
        [`${type}s.${itemField}`]: itemId 
      },
      { 
        $set: { 
          [`${type}s.$.status`]: 'attended',
          [`${type}s.$.attendedAt`]: new Date()
        }
      }
    );

    if (updateResult.modifiedCount === 0) {
      console.warn('Registration status not updated:', {
        registrationId: registration._id,
        type,
        itemId
      });
    }

    res.json({
      success: true,
      checkIn: {
        id: checkIn._id,
        type,
        timestamp: checkIn.timestamp,
        studentName: checkIn.studentDetails.name,
        studentId: checkIn.studentDetails.studentId,
        receiptNumber: checkIn.receiptNumber,
        itemName: itemDetails?.name || 'Unknown'
      }
    });
  } catch (error) {
    console.error('Check-in error:', {
      error: error.message,
      stack: error.stack,
      requestBody: req.body
    });
    errorHandler(error, req, res);
  }
});


// Update registration
router.put('/update-registration/:registrationId', kindeMiddleware, requireCoordinator, async (req, res) => {
  try {
    const { events, workshops, registrationType, amount } = req.body;
    const { registrationId } = req.params;

    // Find registration by _id instead of userId
    const registration = await OfflineRegistration.findById(registrationId)
      .populate('userId');

    if (!registration) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }

    // Verify new items
    const verifiedEvents = await Event.find({ _id: { $in: events.map(e => e.eventId) } });
    const verifiedWorkshops = await Workshop.find({ _id: { $in: workshops.map(w => w.workshopId) } });

    // Replace existing items instead of pushing
    registration.events = events.map(e => ({
      eventId: e.eventId,
      status: 'registered',
      registeredAt: new Date()
    }));

    registration.workshops = workshops.map(w => ({
      workshopId: w.workshopId,
      status: 'registered',
      registeredAt: new Date()
    }));

    // Update registration type and amount
    registration.registrationType = registrationType;
    registration.amount = amount;

    // Generate new QR
    const qrCode = await generateOfflineQR({
      receiptNumber: registration.receiptNumber,
      userId: registration.userId._id, // Use the populated userId
      events: verifiedEvents,
      workshops: verifiedWorkshops,
      registrationId: registration._id
    });

    registration.qrCode = qrCode;
    await registration.save();

    res.json({
      success: true,
      registration: {
        receiptNumber: registration.receiptNumber,
        qrCode,
        registrationId: registration._id,
        events: verifiedEvents.map(e => ({ id: e._id, title: e.title })),
        workshops: verifiedWorkshops.map(w => ({ id: w._id, title: w.title })),
        registrationType: registration.registrationType,
        amount: registration.amount
      }
    });
  } catch (error) {
    console.error('Update registration error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update registration'
    });
  }
});

// Get check-in history
router.get('/check-in-history/:receiptNumber',kindeMiddleware,requireCoordinator, async (req, res) => {
  try {
    const { receiptNumber } = req.params;
    
    const checkIns = await OfflineCheckIn.find({ receiptNumber })
      .populate('event')
      .populate('workshop')
      .sort('-createdAt');

    res.json({
      success: true,
      checkIns: checkIns.map(checkIn => ({
        type: checkIn.type,
        itemName: checkIn.type === 'event' ? checkIn.event?.title : checkIn.workshop?.title,
        timestamp: checkIn.timestamp,
        verifiedBy: checkIn.verifiedBy,
        status: checkIn.status
      }))
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { studentId, email } = req.body;
    
    const user = await OfflineUser.findOne({ 
      studentId,
      email,
      isOfflineRegistered: true
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const newPassword = Math.random().toString(36).slice(-8);
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    res.json({
      success: true,
      newPassword
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

export default router;