import express from 'express';
import { OfflineUser, OfflineRegistration } from '../Models/OfflineModel.js';
import Event from '../Models/eventModel.js';
import Workshop from '../Models/workShopModel.js';
import { kindeMiddleware, requireCoordinator } from '../KindeAuth.js';
import XLSX from 'xlsx';

const router = express.Router();

// Error handling middleware
const errorHandler = (err, req, res) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
};

// Get registered students for a specific event
router.get('/event/:eventId', kindeMiddleware, requireCoordinator, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { class: studentClass, startDate, endDate, format = 'json' } = req.query;
    
    // Validate event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    // Build query
    const query = {
      'events.eventId': eventId
    };
    
    // Add date filter if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDateTime;
      }
    }
    
    // Get registrations with populated user data
    let registrations = await OfflineRegistration.find(query)
      .populate({
        path: 'userId',
        select: 'studentId name email branch class mobileNo'
      })
      .populate({
        path: 'events.eventId',
        select: 'title'
      })
      .sort('-createdAt');

      // Filter out registrations with deleted users
    registrations = registrations.filter(reg => reg.userId !== null);
    
    // Process registrations to extract event-specific data
    let registrationData = registrations.map(reg => {
      const eventRegistration = reg.events.find(e => e.eventId && e.eventId._id.toString() === eventId);
      
      if (!eventRegistration) return null;
      
      return {
        receiptNumber: reg.receiptNumber,
        studentId: reg.userId.studentId,
        name: reg.userId.name,
        email: reg.userId.email,
        branch: reg.userId.branch,
        class: reg.userId.class,
        mobileNo: reg.userId.mobileNo,
        registeredAt: eventRegistration.registeredAt,
        status: eventRegistration.status,
        attendedAt: eventRegistration.attendedAt,
        amount: reg.amount,
        eventName: eventRegistration.eventId ? eventRegistration.eventId.title : 'Unknown Event'
      };
    }).filter(Boolean);
    
    // Apply class filter if provided
    if (studentClass) {
      registrationData = registrationData.filter(reg => 
        reg.class.toUpperCase().includes(studentClass.toUpperCase())
      );
    }
    
    // Generate stats
    const stats = {
      totalRegistrations: registrationData.length,
      classBreakdown: {},
      statusBreakdown: {
        registered: 0,
        attended: 0,
        completed: 0
      }
    };
    
    // Calculate stats
    registrationData.forEach(reg => {
      // Class breakdown
      const className = reg.class.toUpperCase();
      if (!stats.classBreakdown[className]) {
        stats.classBreakdown[className] = {
          count: 0,
          attended: 0
        };
      }
      stats.classBreakdown[className].count++;
      
      if (reg.status === 'attended' || reg.status === 'completed') {
        stats.classBreakdown[className].attended++;
      }
      
      // Status breakdown
      stats.statusBreakdown[reg.status]++;
    });
    
    // Format response based on requested format
    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Receipt Number', 'Student ID', 'Name', 'Email', 'Branch', 'Class', 
        'Mobile', 'Registered At', 'Status', 'Attended At', 'Amount'
      ];
      
      const csvRows = registrationData.map(reg => [
        reg.receiptNumber,
        reg.studentId,
        reg.name,
        reg.email,
        reg.branch,
        reg.class,
        reg.mobileNo,
        reg.registeredAt ? new Date(reg.registeredAt).toISOString().split('T')[0] : '',
        reg.status,
        reg.attendedAt ? new Date(reg.attendedAt).toISOString().split('T')[0] : '',
        reg.amount.toString()
      ]);
      
      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
      ].join('\n');
      
      // Set headers for download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=event_${eventId}_registrations.csv`);
      return res.send(csvContent);
    } else if (format === 'excel') {
      // Generate Excel
      const worksheet = XLSX.utils.json_to_sheet(registrationData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');
      
      // Convert to buffer
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      // Set headers for download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=event_${eventId}_registrations.xlsx`);
      return res.send(excelBuffer);
    } else {
      // Return JSON
      return res.json({
        success: true,
        eventName: event.title,
        stats,
        registrations: registrationData
      });
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
});

// Get registered students for a specific workshop
router.get('/workshop/:workshopId', kindeMiddleware, requireCoordinator, async (req, res) => {
  try {
    const { workshopId } = req.params;
    const { class: studentClass, startDate, endDate, format = 'json' } = req.query;
    
    // Validate workshop exists
    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      return res.status(404).json({
        success: false,
        error: 'Workshop not found'
      });
    }
    
    // Build query
    const query = {
      'workshops.workshopId': workshopId
    };
    
    // Add date filter if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDateTime;
      }
    }
    
    // Get registrations with populated user data
    let registrations = await OfflineRegistration.find(query)
      .populate({
        path: 'userId',
        select: 'studentId name email branch class mobileNo'
      })
      .populate({
        path: 'workshops.workshopId',
        select: 'title'
      })
      .sort('-createdAt');
    

       // Filter out registrations with deleted users
    registrations = registrations.filter(reg => reg.userId !== null);
    
    // Process registrations to extract workshop-specific data
    let registrationData = registrations.map(reg => {
      const workshopRegistration = reg.workshops.find(w => w.workshopId && w.workshopId._id.toString() === workshopId);
      
      if (!workshopRegistration) return null;
      
      return {
        receiptNumber: reg.receiptNumber,
        studentId: reg.userId.studentId,
        name: reg.userId.name,
        email: reg.userId.email,
        branch: reg.userId.branch,
        class: reg.userId.class,
        mobileNo: reg.userId.mobileNo,
        registeredAt: workshopRegistration.registeredAt,
        status: workshopRegistration.status,
        attendedAt: workshopRegistration.attendedAt,
        amount: reg.amount,
        workshopName: workshopRegistration.workshopId ? workshopRegistration.workshopId.title : 'Unknown Workshop'
      };
    }).filter(Boolean);
    
    // Apply class filter if provided
    if (studentClass) {
      registrationData = registrationData.filter(reg => 
        reg.class.toUpperCase().includes(studentClass.toUpperCase())
      );
    }
    
    // Generate stats
    const stats = {
      totalRegistrations: registrationData.length,
      totalAmount: registrationData.reduce((sum, reg) => sum + reg.amount, 0),
      classBreakdown: {},
      statusBreakdown: {
        registered: 0,
        attended: 0,
        completed: 0
      }
    };
    
    // Calculate stats
    registrationData.forEach(reg => {
      // Class breakdown
      const className = reg.class.toUpperCase();
      if (!stats.classBreakdown[className]) {
        stats.classBreakdown[className] = {
          count: 0,
          amount: 0,
          attended: 0
        };
      }
      stats.classBreakdown[className].count++;
      stats.classBreakdown[className].amount += reg.amount;
      
      if (reg.status === 'attended' || reg.status === 'completed') {
        stats.classBreakdown[className].attended++;
      }
      
      // Status breakdown
      stats.statusBreakdown[reg.status]++;
    });
    
    // Format response based on requested format
    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Receipt Number', 'Student ID', 'Name', 'Email', 'Branch', 'Class', 
        'Mobile', 'Registered At', 'Status', 'Attended At', 'Amount'
      ];
      
      const csvRows = registrationData.map(reg => [
        reg.receiptNumber,
        reg.studentId,
        reg.name,
        reg.email,
        reg.branch,
        reg.class,
        reg.mobileNo,
        reg.registeredAt ? new Date(reg.registeredAt).toISOString().split('T')[0] : '',
        reg.status,
        reg.attendedAt ? new Date(reg.attendedAt).toISOString().split('T')[0] : '',
        reg.amount.toString()
      ]);
      
      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
      ].join('\n');
      
      // Set headers for download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=workshop_${workshopId}_registrations.csv`);
      return res.send(csvContent);
    } else if (format === 'excel') {
      // Generate Excel
      const worksheet = XLSX.utils.json_to_sheet(registrationData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');
      
      // Convert to buffer
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      // Set headers for download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=workshop_${workshopId}_registrations.xlsx`);
      return res.send(excelBuffer);
    } else {
      // Return JSON
      return res.json({
        success: true,
        workshopName: workshop.title,
        stats,
        registrations: registrationData
      });
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
});

// Get overall export statistics
router.get('/stats', kindeMiddleware, requireCoordinator, async (req, res) => {
  try {
    // Get all registrations
    const registrations = await OfflineRegistration.find()
      .populate('userId', 'class')
      .populate('events.eventId', 'title')
      .populate('workshops.workshopId', 'title');
    
    // Total counts and revenue
    const stats = {
      totalRegistrations: registrations.length,
      totalRevenue: registrations.reduce((sum, reg) => sum + (reg.amount || 0), 0),
      totalEventRegistrations: registrations.reduce((sum, reg) => sum + (reg.events?.length || 0), 0),
      totalWorkshopRegistrations: registrations.reduce((sum, reg) => sum + (reg.workshops?.length || 0), 0),
      registrationsByType: {
        events: registrations.filter(reg => reg.registrationType === 'events').length,
        workshop: registrations.filter(reg => reg.registrationType === 'workshop').length,
        both: registrations.filter(reg => reg.registrationType === 'both').length
      },
      classwiseStats: {},
      eventStats: {},
      workshopStats: {}
    };
    
    // Process class-wise statistics
    registrations.forEach(reg => {
      const className = (reg.userId?.class || 'UNKNOWN').toUpperCase();
      
      if (!stats.classwiseStats[className]) {
        stats.classwiseStats[className] = {
          count: 0,
          amount: 0,
          events: 0,
          workshops: 0
        };
      }
      
      stats.classwiseStats[className].count++;
      stats.classwiseStats[className].amount += (reg.amount || 0);
      stats.classwiseStats[className].events += (reg.events?.length || 0);
      stats.classwiseStats[className].workshops += (reg.workshops?.length || 0);
      
      // Process events
      (reg.events || []).forEach(eventReg => {
        if (!eventReg.eventId) return;
        
        const eventId = eventReg.eventId._id.toString();
        const eventTitle = eventReg.eventId.title;
        
        if (!stats.eventStats[eventId]) {
          stats.eventStats[eventId] = {
            title: eventTitle,
            totalRegistrations: 0,
            classwiseRegistrations: {},
            statusBreakdown: {
              registered: 0,
              attended: 0,
              completed: 0
            }
          };
        }
        
        stats.eventStats[eventId].totalRegistrations++;
        stats.eventStats[eventId].statusBreakdown[eventReg.status]++;
        
        if (!stats.eventStats[eventId].classwiseRegistrations[className]) {
          stats.eventStats[eventId].classwiseRegistrations[className] = 0;
        }
        stats.eventStats[eventId].classwiseRegistrations[className]++;
      });
      
      // Process workshops
      (reg.workshops || []).forEach(workshopReg => {
        if (!workshopReg.workshopId) return;
        
        const workshopId = workshopReg.workshopId._id.toString();
        const workshopTitle = workshopReg.workshopId.title;
        
        if (!stats.workshopStats[workshopId]) {
          stats.workshopStats[workshopId] = {
            title: workshopTitle,
            totalRegistrations: 0,
            classwiseRegistrations: {},
            statusBreakdown: {
              registered: 0,
              attended: 0,
              completed: 0
            }
          };
        }
        
        stats.workshopStats[workshopId].totalRegistrations++;
        stats.workshopStats[workshopId].statusBreakdown[workshopReg.status]++;
        
        if (!stats.workshopStats[workshopId].classwiseRegistrations[className]) {
          stats.workshopStats[workshopId].classwiseRegistrations[className] = 0;
        }
        stats.workshopStats[workshopId].classwiseRegistrations[className]++;
      });
    });
    
    // Daily registration stats (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    
    const dailyStats = await OfflineRegistration.aggregate([
      {
        $match: { createdAt: { $gte: thirtyDaysAgo } }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$amount' },
          eventRegistrations: { 
            $sum: { 
              $cond: [
                { $eq: ['$registrationType', 'events'] }, 
                1, 
                { $cond: [{ $eq: ['$registrationType', 'both'] }, 1, 0] }
              ] 
            } 
          },
          workshopRegistrations: { 
            $sum: { 
              $cond: [
                { $eq: ['$registrationType', 'workshop'] }, 
                1, 
                { $cond: [{ $eq: ['$registrationType', 'both'] }, 1, 0] }
              ] 
            } 
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Format the response
    res.json({
      success: true,
      stats: {
        ...stats,
        dailyStats
      }
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

// Get lists of all events and workshops for export selection
router.get('/list-items', kindeMiddleware, requireCoordinator, async (req, res) => {
  try {
    // Get all events with registrations
    const eventIds = await OfflineRegistration.distinct('events.eventId');
    const events = await Event.find({ _id: { $in: eventIds } })
      .select('_id title departments')
      .populate('departments', 'name shortName')
      .sort('title');
    
    // Get all workshops with registrations
    const workshopIds = await OfflineRegistration.distinct('workshops.workshopId');
    const workshops = await Workshop.find({ _id: { $in: workshopIds } })
      .select('_id title departments')
      .populate('departments', 'name shortName')
      .sort('title');
    
    // Get all unique classes
    const registrations = await OfflineRegistration.find().populate('userId', 'class');
    const classes = [...new Set(
      registrations
        .map(reg => reg.userId?.class?.toUpperCase())
        .filter(Boolean)
    )].sort();
    
    res.json({
      success: true,
      events: events.map(event => ({
        id: event._id,
        title: event.title,
        departments: event.departments.map(dept => dept.name)
      })),
      workshops: workshops.map(workshop => ({
        id: workshop._id,
        title: workshop.title,
        departments: workshop.departments.map(dept => dept.name)
      })),
      classes
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
});

export default router;