// routes/offlineRegistration.js
import express from 'express';
import { OfflineRegistration } from '../Models/offlineRegistration.js';
import { generateQRCode } from './QRRoutes.js';
import { sendConfirmationEmail } from '../index.js';
import { authenticateCoordinator } from '../middleware/CoOrdinatorMiddleware.js';
import XLSX from 'xlsx';
import multer from 'multer';
import { Coordinator } from '../Models/CoOrdinatorSchema.js';
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Process Excel upload
// Bulk upload students from Excel

router.get('/coordinator/permissions', authenticateCoordinator, async (req, res) => {
    try {
      const coordinator = await Coordinator.findById(req.coordinator._id)
        .select('assignedBranches assignedClasses');
      
      res.json({
        success: true,
        permissions: coordinator
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  
  router.post('/bulk-upload', authenticateCoordinator, async (req, res) => {
    try {
      const { students, receivedBy } = req.body;
      
      const results = {
        successful: [],
        failed: []
      };
  
      for (const student of students) {
        try {
          // Validate access
          if (!req.coordinator.canAccessBranch(student.branch) ||
              !req.coordinator.canAccessClass(`${student.branch}-${student.class}`)) {
            throw new Error('Unauthorized for this branch/class');
          }
  
          const registration = new OfflineRegistration({
            studentId: student.studentId,
            name: student.name,
            email: student.email,
            branch: student.branch,
            class: student.class,
            mobileNo: student.mobileNo,
            registrationType: 'pending',
            registrationFee: 0,
            receivedBy,
            paymentStatus: 'PENDING'
          });
  
          await registration.save();
          results.successful.push({
            studentId: student.studentId,
            receiptNumber: registration.receiptNumber
          });
        } catch (error) {
          results.failed.push({
            studentId: student.studentId,
            error: error.message
          });
        }
      }
  
      res.json({ success: true, results });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

  
// Update payment status for multiple students
router.post('/bulk-payment-update', authenticateCoordinator, async (req, res) => {
    try {
      const { studentIds, paymentStatus, receivedBy } = req.body;
  
      const registrations = await OfflineRegistration.find({
        studentId: { $in: studentIds }
      });
  
      // Validate access
      const hasAccess = registrations.every(reg => 
        req.coordinator.canAccessBranch(reg.branch)
      );
  
      if (!hasAccess) {
        throw new Error('Unauthorized to update some registrations');
      }
  
      const results = {
        successful: [],
        failed: []
      };
  
      // Process each registration
      for (const registration of registrations) {
        try {
          if (paymentStatus === 'PAID' && registration.paymentStatus !== 'PAID') {
            // Generate QR code only for newly paid registrations
            const qrCode = await generateQRCode({
              userId: registration._id,
              registrationType: registration.registrationType,
              selectedEvents: registration.selectedEvents,
              selectedWorkshops: registration.selectedWorkshops
            });
  
            registration.qrCode = qrCode;
            registration.paymentStatus = 'PAID';
            registration.receivedBy = receivedBy;
            await registration.save();
  
            // Send confirmation email
            await sendConfirmationEmail(registration.email, qrCode, {
              name: registration.name,
              receiptNumber: registration.receiptNumber,
              registrationType: registration.registrationType,
              amount: registration.registrationFee
            });
          } else {
            registration.paymentStatus = paymentStatus;
            await registration.save();
          }
  
          results.successful.push(registration.studentId);
        } catch (error) {
          results.failed.push({
            studentId: registration.studentId,
            error: error.message
          });
        }
      }
  
      res.json({
        success: true,
        results
      });
  
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });


  // Get students by branch and class
router.get('/class-students', authenticateCoordinator, async (req, res) => {
    try {
      const { branch, class: className } = req.query;
  
      // Validate access
      if (!req.coordinator.canAccessBranch(branch)) {
        throw new Error('Unauthorized to access this branch');
      }
  
      const students = await OfflineRegistration.find({
        branch,
        class: className
      }).sort('studentId');
  
      res.json({
        success: true,
        students
      });
  
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  
  // Update student selections
  router.put('/update-selections/:studentId', authenticateCoordinator, async (req, res) => {
    try {
      const { eventIds, workshopIds, registrationType } = req.body;
      const registration = await OfflineRegistration.findOne({
        studentId: req.params.studentId
      });
  
      if (!registration) {
        throw new Error('Registration not found');
      }
  
      // Validate access
      if (!req.coordinator.canAccessBranch(registration.branch)) {
        throw new Error('Unauthorized to update this registration');
      }
  
      // Update selections
      registration.registrationType = registrationType;
      registration.registrationFee = registrationType === 'both' ? 299 : 199;
      registration.selectedEvents = eventIds.map(id => ({ eventId: id }));
      registration.selectedWorkshops = workshopIds.map(id => ({ workshopId: id }));
  
      await registration.save();
  
      // If already paid, regenerate QR and send email
      if (registration.paymentStatus === 'PAID') {
        const qrCode = await generateQRCode({
          userId: registration._id,
          registrationType,
          selectedEvents: registration.selectedEvents,
          selectedWorkshops: registration.selectedWorkshops
        });
  
        registration.qrCode = qrCode;
        await registration.save();
  
        await sendConfirmationEmail(registration.email, qrCode, {
          name: registration.name,
          receiptNumber: registration.receiptNumber,
          registrationType,
          amount: registration.registrationFee,
          isUpdate: true
        });
      }
  
      res.json({
        success: true,
        registration
      });
  
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });


// Individual registration
router.post('/register', authenticateCoordinator, async (req, res) => {
  try {
    const registration = new OfflineRegistration({
      ...req.body,
      registrationSource: 'manual'
    });

    await registration.save();

    // Generate QR code
    const qrCode = await generateQRCode({
      userId: registration._id,
      registrationType: registration.registrationType
    });

    registration.qrCode = qrCode;
    await registration.save();

    // Send confirmation email
    await sendConfirmationEmail(registration.email, qrCode, {
      name: registration.name,
      receiptNumber: registration.receiptNumber,
      registrationType: registration.registrationType,
      amount: registration.registrationFee
    });

    res.status(201).json({
      success: true,
      registration
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Validate registration and mark attendance
router.post('/validate', authenticateCoordinator, async (req, res) => {
  try {
    const { receiptNumber, eventName, validatedBy } = req.body;

    const registration = await OfflineRegistration.findOne({
      receiptNumber: receiptNumber.toUpperCase()
    });

    if (!registration) {
      throw new Error('Registration not found');
    }

    // Check if already attended
    const existingAttendance = registration.eventAttendance.find(
      a => a.eventName === eventName
    );

    if (existingAttendance) {
      throw new Error('Already attended this event');
    }

    // Verify registration type matches event
    if (registration.registrationType === 'workshop' && !eventName.toLowerCase().includes('workshop')) {
      throw new Error('Student is registered for workshops only');
    }
    if (registration.registrationType === 'events' && eventName.toLowerCase().includes('workshop')) {
      throw new Error('Student is registered for events only');
    }

    // Mark attendance
    await registration.addEventAttendance(eventName, validatedBy);

    res.json({
      success: true,
      message: 'Attendance marked successfully',
      registration: {
        studentId: registration.studentId,
        name: registration.name,
        eventAttendance: registration.eventAttendance
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get registration stats
router.get('/stats', authenticateCoordinator, async (req, res) => {
  try {
    const stats = await OfflineRegistration.aggregate([
      {
        $group: {
          _id: {
            branch: '$branch',
            class: '$class'
          },
          totalCount: { $sum: 1 },
          totalAmount: { $sum: '$registrationFee' },
          events: {
            $sum: { $cond: [{ $eq: ['$registrationType', 'events'] }, 1, 0] }
          },
          workshops: {
            $sum: { $cond: [{ $eq: ['$registrationType', 'workshop'] }, 1, 0] }
          },
          both: {
            $sum: { $cond: [{ $eq: ['$registrationType', 'both'] }, 1, 0] }
          },
          validated: {
            $sum: { $cond: [{ $eq: ['$validated', true] }, 1, 0] }
          }
        }
      },
      {
        $sort: { '_id.branch': 1, '_id.class': 1 }
      }
    ]);

    // Get coordinator stats
    const coordinatorStats = await OfflineRegistration.aggregate([
      {
        $group: {
          _id: '$receivedBy',
          totalAmount: { $sum: '$registrationFee' },
          totalCount: { $sum: 1 },
          events: {
            $sum: { $cond: [{ $eq: ['$registrationType', 'events'] }, 1, 0] }
          },
          workshops: {
            $sum: { $cond: [{ $eq: ['$registrationType', 'workshop'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);

    res.json({
      success: true,
      stats: {
        classWise: stats,
        coordinators: coordinatorStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Export registrations to Excel
router.get('/export', authenticateCoordinator, async (req, res) => {
  try {
    const registrations = await OfflineRegistration.find()
      .sort('-createdAt')
      .lean();

    const workbook = XLSX.utils.book_new();

    // Main registrations sheet
    const worksheet = XLSX.utils.json_to_sheet(registrations.map(reg => ({
      'Receipt No': reg.receiptNumber,
      'Student ID': reg.studentId,
      'Name': reg.name,
      'Branch': reg.branch,
      'Class': reg.class,
      'Mobile': reg.mobileNo,
      'Email': reg.email,
      'Registration Type': reg.registrationType,
      'Amount': reg.registrationFee,
      'Payment Status': reg.paymentStatus,
      'Received By': reg.receivedBy,
      'Registration Date': new Date(reg.createdAt).toLocaleDateString(),
      'Validation Status': reg.validated ? 'Validated' : 'Pending',
      'Validated By': reg.validatedBy || '-',
      'Attended Events': reg.eventAttendance.map(e => e.eventName).join(', '),
      'Total Events Attended': reg.eventAttendance.length
    })));

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

    // Stats sheet
    const stats = await OfflineRegistration.aggregate([
      {
        $group: {
          _id: {
            branch: '$branch',
            class: '$class'
          },
          totalAmount: { $sum: '$registrationFee' },
          totalCount: { $sum: 1 },
          events: {
            $sum: { $cond: [{ $eq: ['$registrationType', 'events'] }, 1, 0] }
          },
          workshops: {
            $sum: { $cond: [{ $eq: ['$registrationType', 'workshop'] }, 1, 0] }
          },
          both: {
            $sum: { $cond: [{ $eq: ['$registrationType', 'both'] }, 1, 0] }
          },
          validated: {
            $sum: { $cond: [{ $eq: ['$validated', true] }, 1, 0] }
          }
        }
      }
    ]);

    const statsWorksheet = XLSX.utils.json_to_sheet(stats.map(stat => ({
      'Branch': stat._id.branch,
      'Class': stat._id.class,
      'Total Students': stat.totalCount,
      'Events Only': stat.events,
      'Workshops Only': stat.workshops,
      'Both': stat.both,
      'Validated': stat.validated,
      'Total Amount': stat.totalAmount
    })));

    XLSX.utils.book_append_sheet(workbook, statsWorksheet, 'Class Stats');

    // Coordinator stats sheet
    const coordinatorStats = await OfflineRegistration.aggregate([
      {
        $group: {
          _id: '$receivedBy',
          totalAmount: { $sum: '$registrationFee' },
          totalCount: { $sum: 1 },
          events: {
            $sum: { $cond: [{ $eq: ['$registrationType', 'events'] }, 1, 0] }
          },
          workshops: {
            $sum: { $cond: [{ $eq: ['$registrationType', 'workshop'] }, 1, 0] }
          },
          both: {
            $sum: { $cond: [{ $eq: ['$registrationType', 'both'] }, 1, 0] }
          }
        }
      }
    ]);

    const coordWorksheet = XLSX.utils.json_to_sheet(coordinatorStats.map(stat => ({
      'Coordinator': stat._id,
      'Total Registrations': stat.totalCount,
      'Events Only': stat.events,
      'Workshops Only': stat.workshops,
      'Both': stat.both,
      'Total Amount': stat.totalAmount
    })));

    XLSX.utils.book_append_sheet(workbook, coordWorksheet, 'Coordinator Stats');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=techniverse_registrations.xlsx');
    res.send(buffer);

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single registration details
router.get('/:id', authenticateCoordinator, async (req, res) => {
  try {
    const registration = await OfflineRegistration.findOne({
      $or: [
        { receiptNumber: new RegExp('^' + req.params.id + ' ', 'i') },
        { studentId: new RegExp('^' + req.params.id.replace(/D$/, '') + '', 'i') }
      ]
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }

    res.json({
      success: true,
      registration
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Update registration event/workshop selections
router.put('/:receiptNumber/selections', authenticateCoordinator, async (req, res) => {
  try {
    const { selectedEvents, selectedWorkshops } = req.body;
    const registration = await OfflineRegistration.findOne({
      receiptNumber: req.params.receiptNumber
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }

    // Update selections
    if (selectedEvents) {
      registration.selectedEvents = selectedEvents;
    }
    if (selectedWorkshops) {
      registration.selectedWorkshops = selectedWorkshops;
    }

    // Regenerate QR code with new selections
    const qrCode = await generateQRCode({
      userId: registration._id,
      registrationType: registration.registrationType,
      selectedEvents: registration.selectedEvents,
      selectedWorkshops: registration.selectedWorkshops
    });

    registration.qrCode = qrCode;
    await registration.save();

    // Send updated QR code via email
    await sendConfirmationEmail(registration.email, qrCode, {
      name: registration.name,
      receiptNumber: registration.receiptNumber,
      registrationType: registration.registrationType,
      amount: registration.registrationFee,
      isUpdate: true
    });

    res.json({
      success: true,
      registration
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;