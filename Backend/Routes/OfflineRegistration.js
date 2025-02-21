import express from 'express';
import { OfflineRegistration } from '../Models/offlineRegistration.js';
import { OfflineCheckin } from '../Models/offlineCheckIn.js';
import { generateOfflineQRCode, verifyOfflineQR } from '../../Backend/utils/OfflineQrUtils.js';
import { auth } from '../KindeAuth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for security
const checkinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Schema for tracking used QR codes to prevent replay attacks
const OfflineUsedQR = mongoose.model('OfflineUsedQR', {
  secureKey: { type: String, required: true },
  usedAt: { type: Date, default: Date.now },
  eventId: { type: String, required: true }
});

// Create new offline registration
router.post('/offline/register', auth, async (req, res) => {
    try {
      const {
        studentId,
        name,
        branch,
        class: studentClass,
        mobileNo,
        registrationType,
        registrationFee,
        receivedBy,
        selectedEvents = [],
        selectedWorkshops = []
      } = req.body;
  
      // Validate registration type and selections
      if (registrationType === 'events' && selectedEvents.length === 0) {
        throw new Error('Please select at least one event');
      }
      if (registrationType === 'workshop' && selectedWorkshops.length === 0) {
        throw new Error('Please select at least one workshop');
      }
      if (registrationType === 'both' && 
          selectedEvents.length === 0 && selectedWorkshops.length === 0) {
        throw new Error('Please select at least one event or workshop');
      }
  
      // Check for existing registration
      const existingRegistration = await OfflineRegistration.findOne({
        studentId,
        $or: [
          { 'selectedEvents.eventId': { $in: selectedEvents.map(e => e.eventId) } },
          { 'selectedWorkshops.workshopId': { $in: selectedWorkshops.map(w => w.workshopId) } }
        ]
      });
  
      if (existingRegistration) {
        throw new Error('Student already registered for one or more selected items');
      }
  
      // Create registration
      const registration = new OfflineRegistration({
        receiptNumber: await generateReceiptNumber(),
        studentId,
        name,
        branch,
        class: studentClass,
        mobileNo,
        registrationType,
        registrationFee,
        receivedBy,
        selectedEvents,
        selectedWorkshops
      });
  
      // Generate QR code
      const { qrImage, secureKey } = await generateOfflineQRCode({
        receiptNumber: registration.receiptNumber,
        studentId: registration.studentId,
        selectedEvents,
        selectedWorkshops
      });
  
      registration.qrCode = qrImage;
      registration.secureKey = secureKey;
      await registration.save();
  
      res.status(201).json({
        success: true,
        registration: {
          ...registration.toObject(),
          qrCode: qrImage
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });
// Validate offline registration QR
router.post('/offline/validate', [auth, checkinLimiter], async (req, res) => {
    try {
      const { qrData, itemId, itemType, validatedBy } = req.body;
  
      const verification = await verifyOfflineQR(qrData);
      if (!verification.isValid) {
        throw new Error(verification.error);
      }
  
      const { registration, events, workshops } = verification.data;
  
      // Find the item in either events or workshops
      const items = itemType === 'event' ? events : workshops;
      const item = items.find(i => i.id === itemId);
  
      if (!item) {
        throw new Error(`Not registered for this ${itemType}`);
      }
  
      // Check if already used
      const usedQR = await OfflineUsedQR.findOne({
        secureKey: registration.secureKey,
        itemId,
        itemType
      });
  
      if (usedQR) {
        throw new Error(`QR code already used for this ${itemType}`);
      }
  
      // Create check-in record
      const checkin = new OfflineCheckin({
        registrationId: registration._id,
        itemId,
        itemType,
        studentId: registration.studentId,
        validatedBy,
        checkinTime: new Date(),
        receiptNumber: registration.receiptNumber,
        studentDetails: {
          name: registration.name,
          branch: registration.branch,
          class: registration.class,
          mobileNo: registration.mobileNo
        }
      });
  
      await checkin.save();
  
      // Mark QR as used
      await new OfflineUsedQR({
        secureKey: registration.secureKey,
        itemId,
        itemType
      }).save();
  
      // Update registration status
      const updateField = itemType === 'event' ? 'selectedEvents' : 'selectedWorkshops';
      const idField = itemType === 'event' ? 'eventId' : 'workshopId';
  
      await OfflineRegistration.updateOne(
        { 
          _id: registration._id,
          [`${updateField}.${idField}`]: itemId 
        },
        {
          $set: {
            [`${updateField}.$.status`]: 'attended',
            [`${updateField}.$.checkinTime`]: new Date(),
            [`${updateField}.$.validatedBy`]: validatedBy
          }
        }
      );
  
      res.json({
        success: true,
        checkin: {
          studentId: registration.studentId,
          name: registration.name,
          itemName: item.name,
          checkinTime: checkin.checkinTime
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  });

// Complete offline check-in
router.post('/offline/checkin', [auth, checkinLimiter], async (req, res) => {
  try {
    const { qrData, eventId, validatorId } = req.body;

    // Verify QR code
    const verification = await verifyOfflineQR(qrData);
    if (!verification.isValid) {
      return res.status(400).json({
        success: false,
        message: verification.error
      });
    }

    const { registration, events } = verification.data;

    // Check if QR has been used
    const usedQR = await OfflineUsedQR.findOne({
      secureKey: registration.secureKey,
      eventId
    });

    if (usedQR) {
      return res.status(400).json({
        success: false,
        message: 'QR code already used for this event'
      });
    }

    // Verify event registration
    const event = events.find(e => e.id === eventId);
    if (!event) {
      return res.status(400).json({
        success: false,
        message: 'Not registered for this event'
      });
    }

    // Create check-in record
    const checkin = new OfflineCheckin({
      registrationId: registration._id,
      eventId,
      validatorId,
      checkinTime: new Date()
    });
    await checkin.save();

    // Mark QR as used
    await new OfflineUsedQR({
      secureKey: registration.secureKey,
      eventId
    }).save();

    // Update registration status
    await OfflineRegistration.updateOne(
      { 
        _id: registration._id,
        'selectedEvents.eventId': eventId
      },
      {
        $set: {
          'selectedEvents.$.status': 'attended',
          'selectedEvents.$.checkinTime': new Date()
        }
      }
    );

    res.json({
      success: true,
      checkin: {
        studentId: registration.studentId,
        name: registration.name,
        event: event.name,
        checkinTime: checkin.checkinTime
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get offline registration stats
router.get('/offline/stats', auth, async (req, res) => {
  try {
    const stats = await OfflineRegistration.aggregate([
      {
        $group: {
          _id: null,
          totalRegistrations: { $sum: 1 },
          totalAmount: { $sum: '$registrationFee' },
          totalCheckins: {
            $sum: {
              $size: {
                $filter: {
                  input: '$selectedEvents',
                  as: 'event',
                  cond: { $eq: ['$$event.status', 'attended'] }
                }
              }
            }
          }
        }
      }
    ]);

    const eventWiseStats = await OfflineRegistration.aggregate([
      { $unwind: '$selectedEvents' },
      {
        $group: {
          _id: '$selectedEvents.eventId',
          registrations: { $sum: 1 },
          checkins: {
            $sum: {
              $cond: [
                { $eq: ['$selectedEvents.status', 'attended'] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats[0] || {
        totalRegistrations: 0,
        totalAmount: 0,
        totalCheckins: 0
      },
      eventWiseStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;