// routes/offlineRegistration.js
import express from 'express';
import { OfflineRegistration } from '../models/OfflineRegistration.js';
import { kindeMiddleware } from '../KindeAuth.js';
import XLSX from 'xlsx';

const router = express.Router();

// Create new registration
router.post('/offline-registration', kindeMiddleware, async (req, res) => {
  try {
    // Format incoming data
    const formattedData = {
      ...req.body,
      studentId: req.body.studentId.toUpperCase(),
      branch: req.body.branch.toUpperCase(),
      class: req.body.class.toUpperCase()
    };

    // Check for existing registration
    const existingRegistration = await OfflineRegistration.findOne({
      studentId: formattedData.studentId,
      registrationType: formattedData.registrationType,
      validated: false
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        error: 'Student already has a pending registration for this type'
      });
    }

    // Create registration
    const registration = new OfflineRegistration(formattedData);
    
    // Save with retry logic
    let savedRegistration;
    let retries = 3;
    
    while (retries > 0) {
      try {
        savedRegistration = await registration.save();
        break;
      } catch (err) {
        if (err.code === 11000 && err.keyPattern?.receiptNumber) {
          registration.receiptNumber = 'PENDING';
          retries--;
          continue;
        }
        throw err;
      }
    }

    if (!savedRegistration) {
      throw new Error('Failed to generate unique receipt number');
    }

    res.status(201).json({
      success: true,
      registration: savedRegistration
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ 
      success: false,
      error: error.message,
      details: error.code === 11000 ? 'Duplicate entry found' : undefined
    });
  }
});

// Validate registration
router.post('/validateOffline', kindeMiddleware, async (req, res) => {
    try {
      const { receiptNumber, studentId, validatedBy, eventName } = req.body;
      
      if (!receiptNumber && !studentId) {
        return res.status(400).json({
          success: false,
          error: 'Either receipt number or student ID is required'
        });
      }
  
      if (!validatedBy) {
        return res.status(400).json({
          success: false,
          error: 'Validator name is required'
        });
      }
  
      if (!eventName) {
        return res.status(400).json({
          success: false,
          error: 'Event name is required for attendance tracking'
        });
      }
  
      // Clean studentId - remove any trailing 'D'
      const cleanStudentId = studentId ? studentId.replace(/D$/, '').toUpperCase() : null;
  
      // Find registration
      const registration = await OfflineRegistration.findOne({
        $or: [
          { receiptNumber: receiptNumber?.toUpperCase() },
          { studentId: cleanStudentId }
        ]
      });
  
      if (!registration) {
        return res.status(404).json({
          success: false,
          error: 'Registration not found'
        });
      }
  
      // Check payment status
      if (registration.paymentStatus !== 'PAID') {
        return res.status(400).json({
          success: false,
          error: 'Payment pending for this registration'
        });
      }
  
      // Check if already attended this event
      const existingAttendance = registration.eventAttendance.find(
        a => a.eventName === eventName
      );
  
      if (existingAttendance) {
        return res.status(400).json({
          success: false,
          error: 'Student has already attended this event'
        });
      }
  
      // For workshop registrations, check if the event is a workshop
      if (registration.registrationType === 'workshop' && !eventName.toLowerCase().includes('workshop')) {
        return res.status(400).json({
          success: false,
          error: 'Student is registered for workshops only'
        });
      }
  
      // For events-only registrations, check if the event is not a workshop
      if (registration.registrationType === 'events' && eventName.toLowerCase().includes('workshop')) {
        return res.status(400).json({
          success: false,
          error: 'Student is registered for events only'
        });
      }
  
      // Add event attendance
      await registration.addEventAttendance(eventName, validatedBy);
  
      res.json({
        success: true,
        message: 'Attendance marked successfully',
        registration: {
          studentId: registration.studentId,
          name: registration.name,
          registrationType: registration.registrationType,
          paymentStatus: registration.paymentStatus,
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
  
// Get stats
router.get('/registration-stats-offline', kindeMiddleware, async (req, res) => {
    try {
      // Get class-wise stats with more details
      const classWiseStats = await OfflineRegistration.aggregate([
        {
          $group: {
            _id: {
              branch: '$branch',
              class: '$class'
            },
            totalAmount: { $sum: '$registrationFee' },
            count: { $sum: 1 },
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
        },
        {
          $sort: { 
            '_id.branch': 1, 
            '_id.class': 1 
          }
        }
      ]);
  
      // Get coordinator-wise stats
      const receiverStats = await OfflineRegistration.aggregate([
        {
          $group: {
            _id: '$receivedBy',
            totalAmount: { $sum: '$registrationFee' },
            count: { $sum: 1 },
            events: {
              $sum: { $cond: [{ $eq: ['$registrationType', 'events'] }, 1, 0] }
            },
            workshops: {
              $sum: { $cond: [{ $eq: ['$registrationType', 'workshop'] }, 1, 0] }
            },
            both: {
              $sum: { $cond: [{ $eq: ['$registrationType', 'both'] }, 1, 0] }
            },
            // Track payment status
            paidCount: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'PAID'] }, 1, 0] }
            }
          }
        },
        {
          $sort: { totalAmount: -1 }
        }
      ]);
  
      // Get overall summary
      const summary = await OfflineRegistration.aggregate([
        {
          $group: {
            _id: null,
            totalRegistrations: { $sum: 1 },
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
            // Payment status summary
            paidRegistrations: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'PAID'] }, 1, 0] }
            },
            pendingRegistrations: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'PENDING'] }, 1, 0] }
            }
          }
        }
      ]);
  
      // Get branch-wise totals
      const branchStats = await OfflineRegistration.aggregate([
        {
          $group: {
            _id: '$branch',
            totalStudents: { $sum: 1 },
            totalAmount: { $sum: '$registrationFee' },
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
        },
        {
          $sort: { _id: 1 }
        }
      ]);
  
      res.json({
        success: true,
        stats: {
          classWiseStats,
          receiverStats,
          branchStats,
          summary: summary[0] || {
            totalRegistrations: 0,
            totalAmount: 0,
            events: 0,
            workshops: 0,
            both: 0,
            paidRegistrations: 0,
            pendingRegistrations: 0
          }
        }
      });
    } catch (error) {
      console.error('Stats aggregation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch registration statistics'
      });
    }
  });

// Export to Excel
router.get('/export-excel', kindeMiddleware, async (req, res) => {
  try {
    const registrations = await OfflineRegistration.find({})
      .sort({ createdAt: -1 })
      .lean();

    const workbook = XLSX.utils.book_new();
    
    // Registration Sheet with detailed information
    const registrationWorksheet = XLSX.utils.json_to_sheet(registrations.map(reg => ({
      'Receipt No': reg.receiptNumber,
      'Student ID': reg.studentId,
      'Name': reg.name,
      'Branch': reg.branch,
      'Class': reg.class,
      'Mobile': reg.mobileNo,
      'Registration Type': reg.registrationType,
      'Amount': reg.registrationFee,
      'Status': reg.validated ? 'Validated' : 'Pending',
      'Received By': reg.receivedBy,
      'Registration Date': new Date(reg.createdAt).toLocaleDateString(),
      'Registration Time': new Date(reg.createdAt).toLocaleTimeString(),
      'Validated': reg.validated ? 'Yes' : 'No',
      'Validated By': reg.validatedBy || '-',
      'Validated At': reg.validatedAt ? new Date(reg.validatedAt).toLocaleDateString() : '-'
    })));

    XLSX.utils.book_append_sheet(workbook, registrationWorksheet, 'Registrations');

    // Branch & Class-wise Stats Sheet
    const stats = await OfflineRegistration.aggregate([
      {
        $group: {
          _id: {
            branch: '$branch',
            class: '$class'
          },
          totalAmount: { $sum: '$registrationFee' },
          totalCount: { $sum: 1 },
          eventsCount: {
            $sum: { $cond: [{ $eq: ['$registrationType', 'events'] }, 1, 0] }
          },
          workshopsCount: {
            $sum: { $cond: [{ $eq: ['$registrationType', 'workshop'] }, 1, 0] }
          },
          bothCount: {
            $sum: { $cond: [{ $eq: ['$registrationType', 'both'] }, 1, 0] }
          },
          validatedCount: {
            $sum: { $cond: [{ $eq: ['$validated', true] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.branch': 1, '_id.class': 1 } }
    ]);

    const statsWorksheet = XLSX.utils.json_to_sheet(stats.map(stat => ({
      'Branch': stat._id.branch,
      'Class': stat._id.class,
      'Total Students': stat.totalCount,
      'Events Only': stat.eventsCount,
      'Workshops Only': stat.workshopsCount,
      'Both': stat.bothCount,
      'Validated': stat.validatedCount,
      'Total Amount': stat.totalAmount
    })));

    XLSX.utils.book_append_sheet(workbook, statsWorksheet, 'Class Stats');

    // Receiver Stats Sheet
    const receiverStats = await OfflineRegistration.aggregate([
      {
        $group: {
          _id: '$receivedBy',
          totalAmount: { $sum: '$registrationFee' },
          totalCount: { $sum: 1 },
          eventsCount: {
            $sum: { $cond: [{ $eq: ['$registrationType', 'events'] }, 1, 0] }
          },
          workshopsCount: {
            $sum: { $cond: [{ $eq: ['$registrationType', 'workshop'] }, 1, 0] }
          },
          bothCount: {
            $sum: { $cond: [{ $eq: ['$registrationType', 'both'] }, 1, 0] }
          }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    const receiverWorksheet = XLSX.utils.json_to_sheet(receiverStats.map(stat => ({
      'Received By': stat._id,
      'Total Registrations': stat.totalCount,
      'Events Only': stat.eventsCount,
      'Workshops Only': stat.workshopsCount,
      'Both': stat.bothCount,
      'Total Amount': stat.totalAmount
    })));

    XLSX.utils.book_append_sheet(workbook, receiverWorksheet, 'Receiver Stats');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=techniverse_registrations.xlsx');
    res.send(excelBuffer);

  } catch (error) {
    console.error('Excel export error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get registration by receipt number or student ID
// routes/offlineRegistration.js
router.get('/offlineregistration/:id', kindeMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
  
      console.log('Searching for registration:', id); // Debug log
  
      const registration = await OfflineRegistration.findOne({
        $or: [
          { receiptNumber: new RegExp('^' + id + '$', 'i') },
        ]
      });
  
      if (!registration) {
        console.log('No registration found for:',id); // Debug log
        return res.status(404).json({
          success: false,
          error: 'Registration not found'
        });
      }
  
      console.log('Found registration:', registration.receiptNumber); // Debug log
  
      res.json({
        success: true,
        registration
      });
    } catch (error) {
      console.error('Registration fetch error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

export default router;
