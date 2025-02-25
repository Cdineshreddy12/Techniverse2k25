import express from 'express';
import XLSX from 'xlsx';
import { Student } from '../Models/StudentSchema.js';
import { Registration } from '../Models/RegistrationSchema.js';
import Event from '../Models/eventModel.js';
import Workshop from '../Models/workShopModel.js';
import mongoose from 'mongoose';

const router = express.Router();

// Helper function to format date
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString();
};

/**
 * Export all student registrations data
 * Includes personal information, events/workshops registered for, and payment details
 */
router.get('/export/students/all', async (req, res) => {
  try {
    // Get all students with registrations populated
    const students = await Student.find({ registrationComplete: true })
      .populate({
        path: 'registrations',
        populate: [{
          path: 'selectedEvents.eventId',
          model: 'Event'
        }, {
          path: 'selectedWorkshops.workshopId',
          model: 'Workshop'
        }]
      });

    if (!students || students.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No registered students found'
      });
    }

    // Prepare data for Excel
    const excelData = students.map(student => {
      // Get all registrations
      const registrations = student.registrations || [];
      
      // Get all events from all registrations
      const events = registrations.flatMap(reg => 
        (reg.selectedEvents || []).map(event => ({
          name: event.eventName,
          status: event.status,
          registrationType: event.registrationType,
          departmentName: event.eventId?.departments?.[0]?.name || 'N/A'
        }))
      );
      
      // Get all workshops from all registrations
      const workshops = registrations.flatMap(reg => 
        (reg.selectedWorkshops || []).map(workshop => ({
          name: workshop.workshopName,
          status: workshop.status,
          departmentName: workshop.workshopId?.departments?.[0]?.name || 'N/A'
        }))
      );
      
      // Payment details from most recent registration
      const latestRegistration = registrations.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      )[0] || {};
      
      return {
        'Student ID': student.kindeId,
        'Name': student.name,
        'Email': student.email,
        'Mobile': student.mobileNumber,
        'Registration Type': student.registrationType,
        'College': student.collegeName || 'N/A',
        'Branch': student.branch || 'N/A',
        'College ID': student.collegeId || 'N/A',
        'Registration Date': formatDate(student.createdAt),
        'Number of Events': events.length,
        'Events Registered': events.map(e => e.name).join(', '),
        'Number of Workshops': workshops.length,
        'Workshops Registered': workshops.map(w => w.name).join(', '),
        'Total Amount Paid': registrations.reduce((sum, reg) => sum + (reg.amount || 0), 0),
        'Payment Status': latestRegistration.paymentStatus || 'N/A',
        'Payment Method': latestRegistration.paymentDetails?.paymentMethod || 'N/A',
        'Payment Date': formatDate(latestRegistration.paymentCompletedAt)
      };
    });

    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'All Registrations');

    // Set column widths for better readability
    const colWidths = [
      { wch: 20 }, // Student ID
      { wch: 25 }, // Name
      { wch: 30 }, // Email
      { wch: 15 }, // Mobile
      { wch: 15 }, // Registration Type
      { wch: 30 }, // College
      { wch: 15 }, // Branch
      { wch: 15 }, // College ID
      { wch: 20 }, // Registration Date
      { wch: 15 }, // Number of Events
      { wch: 50 }, // Events Registered
      { wch: 15 }, // Number of Workshops
      { wch: 50 }, // Workshops Registered
      { wch: 15 }, // Total Amount Paid
      { wch: 15 }, // Payment Status
      { wch: 15 }, // Payment Method
      { wch: 20 }  // Payment Date
    ];
    worksheet['!cols'] = colWidths;

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Set response headers for file download - use simple filename to avoid encoding issues
    res.setHeader('Content-Disposition', 'attachment; filename=all_student_registrations.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    // Send the file
    res.send(excelBuffer);

  } catch (error) {
    console.error('Export all students error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export student data: ' + error.message
    });
  }
});

/**
 * Export registrations for a specific event
 */
router.get('/export/event/:eventId', async (req, res) => {
  let excelBuffer = null;
  
  try {
    const { eventId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID format'
      });
    }
    
    console.log(`Processing export request for event ID: ${eventId}`);

    // Get the event details first
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Convert eventId to ObjectId for proper comparison
    const eventObjectId = new mongoose.Types.ObjectId(eventId);
    
    // Find registrations that include this event
    const registrations = await Registration.find({
      'selectedEvents.eventId': eventObjectId,
      'paymentStatus': 'completed'
    }).populate('student');

    if (!registrations || registrations.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No registrations found for this event'
      });
    }

    console.log(`Found ${registrations.length} registrations for event: ${event.title}`);

    // Prepare data for Excel
    const excelData = registrations.map(registration => {
      const student = registration.student || {};
      
      // Find the specific event details within the registration
      let eventDetails = null;
      for (const e of registration.selectedEvents) {
        if (e.eventId.toString() === eventId) {
          eventDetails = e;
          break;
        }
      }
      
      if (!eventDetails) {
        console.log(`Warning: Event details not found in registration ${registration._id}`);
        eventDetails = {};
      }
      
      return {
        'Registration ID': registration._id.toString(),
        'Student ID': student.kindeId || 'N/A',
        'Name': student.name || 'N/A',
        'Email': student.email || 'N/A',
        'Mobile': student.mobileNumber || 'N/A',
        'College': student.collegeName || 'N/A',
        'Branch': student.branch || 'N/A',
        'College ID': student.collegeId || 'N/A',
        'Event Name': eventDetails.eventName || event.title,
        'Registration Type': eventDetails.registrationType || 'individual',
        'Registration Status': eventDetails.status || 'pending',
        'Payment Amount': registration.amount || 0,
        'Payment Status': registration.paymentStatus || 'pending',
        'Payment Method': registration.paymentDetails?.paymentMethod || 'N/A',
        'Payment ID': registration.paymentDetails?.razorpayPaymentId || 'N/A',
        'Payment Date': formatDate(registration.paymentCompletedAt),
        'Registration Date': formatDate(registration.createdAt)
      };
    });

    console.log(`Prepared ${excelData.length} rows for Excel export`);

    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, event.title || 'Event Registrations');

    // Set column widths
    const colWidths = [
      { wch: 24 }, // Registration ID
      { wch: 20 }, // Student ID
      { wch: 25 }, // Name
      { wch: 30 }, // Email
      { wch: 15 }, // Mobile
      { wch: 30 }, // College
      { wch: 15 }, // Branch
      { wch: 15 }, // College ID
      { wch: 30 }, // Event Name
      { wch: 18 }, // Registration Type
      { wch: 18 }, // Registration Status
      { wch: 15 }, // Payment Amount
      { wch: 15 }, // Payment Status
      { wch: 15 }, // Payment Method
      { wch: 24 }, // Payment ID
      { wch: 20 }, // Payment Date
      { wch: 20 }  // Registration Date
    ];
    worksheet['!cols'] = colWidths;

    // Generate buffer
    excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    console.log(`Generated Excel buffer of size: ${excelBuffer.length} bytes`);

    // Create a safe filename - very strict filtering
    const safeFilename = 'event_' + 
      eventId.toString().replace(/[^a-zA-Z0-9]/g, '') + 
      '_registrations.xlsx';
      
    console.log(`Using safe filename: ${safeFilename}`);

    // Set response headers for file download
    res.setHeader('Content-Disposition', `attachment; filename=${safeFilename}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    // Send the file
    res.send(excelBuffer);
    console.log('File sent successfully');

  } catch (error) {
    console.error('Export event registrations error:', error);
    
    // If we already generated the buffer but failed to set headers or send
    if (excelBuffer) {
      try {
        // Try with a very simple filename
        res.setHeader('Content-Disposition', 'attachment; filename=export.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        return res.send(excelBuffer);
      } catch (secondError) {
        console.error('Second attempt at sending file failed:', secondError);
      }
    }
    
    // If all else fails, send JSON error
    res.status(500).json({
      success: false,
      error: 'Failed to export event registrations: ' + error.message
    });
  }
});

/**
 * Export registrations for a specific workshop
 */
router.get('/export/workshop/:workshopId', async (req, res) => {
  try {
    const { workshopId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(workshopId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid workshop ID format'
      });
    }

    // Get the workshop details first
    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      return res.status(404).json({
        success: false,
        error: 'Workshop not found'
      });
    }

    // Find all registrations that include this workshop
    // Convert workshopId to ObjectId for proper comparison
    const workshopObjectId = new mongoose.Types.ObjectId(workshopId);
    
    const registrations = await Registration.find({
      'selectedWorkshops.workshopId': workshopObjectId,
      'paymentStatus': 'completed'
    }).populate('student');

    if (!registrations || registrations.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No registrations found for this workshop'
      });
    }

    // Prepare data for Excel
    const excelData = registrations.map(registration => {
      const student = registration.student || {};
      const workshopDetails = registration.selectedWorkshops.find(w => 
        w.workshopId.toString() === workshopId
      ) || {};
      
      return {
        'Registration ID': registration._id,
        'Student ID': student.kindeId || 'N/A',
        'Name': student.name || 'N/A',
        'Email': student.email || 'N/A',
        'Mobile': student.mobileNumber || 'N/A',
        'College': student.collegeName || 'N/A',
        'Branch': student.branch || 'N/A',
        'College ID': student.collegeId || 'N/A',
        'Workshop Name': workshopDetails.workshopName || workshop.title,
        'Workshop Status': workshopDetails.status || 'pending',
        'Payment Amount': registration.amount || 0,
        'Payment Status': registration.paymentStatus || 'pending',
        'Payment Method': registration.paymentDetails?.paymentMethod || 'N/A',
        'Payment ID': registration.paymentDetails?.razorpayPaymentId || 'N/A',
        'Payment Date': formatDate(registration.paymentCompletedAt),
        'Registration Date': formatDate(registration.createdAt)
      };
    });

    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, workshop.title || 'Workshop Registrations');

    // Set column widths
    const colWidths = [
      { wch: 24 }, // Registration ID
      { wch: 20 }, // Student ID
      { wch: 25 }, // Name
      { wch: 30 }, // Email
      { wch: 15 }, // Mobile
      { wch: 30 }, // College
      { wch: 15 }, // Branch
      { wch: 15 }, // College ID
      { wch: 30 }, // Workshop Name
      { wch: 18 }, // Workshop Status
      { wch: 15 }, // Payment Amount
      { wch: 15 }, // Payment Status
      { wch: 15 }, // Payment Method
      { wch: 24 }, // Payment ID
      { wch: 20 }, // Payment Date
      { wch: 20 }  // Registration Date
    ];
    worksheet['!cols'] = colWidths;

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Set response headers for file download - sanitize filename to prevent invalid characters
    const sanitizedFilename = workshop.title ? 
      workshop.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50) : 'workshop_registrations';
    res.setHeader('Content-Disposition', `attachment; filename=${sanitizedFilename}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    // Send the file
    res.send(excelBuffer);

  } catch (error) {
    console.error('Export workshop registrations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export workshop registrations: ' + error.message
    });
  }
});

/**
 * Export all registrations data with detailed financial information
 * For accounting/financial reporting purposes
 */
router.get('/export/registrations/financial', async (req, res) => {
  try {
    // Get all completed registrations
    const registrations = await Registration.find({
      paymentStatus: 'completed'
    }).populate('student');

    if (!registrations || registrations.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No completed registrations found'
      });
    }

    // Prepare data for Excel
    const excelData = registrations.map(registration => {
      const student = registration.student || {};
      
      return {
        'Registration ID': registration._id,
        'Order ID': registration.paymentDetails?.orderId || 'N/A',
        'Razorpay Order ID': registration.paymentDetails?.razorpayOrderId || 'N/A',
        'Razorpay Payment ID': registration.paymentDetails?.razorpayPaymentId || 'N/A',
        'Student Name': student.name || 'N/A',
        'Student Email': student.email || 'N/A',
        'Student Phone': student.mobileNumber || 'N/A',
        'Registration Type': student.registrationType || 'student',
        'Amount': registration.amount || 0,
        'Payment Method': registration.paymentDetails?.paymentMethod || 'N/A',
        'Payment Date': formatDate(registration.paymentCompletedAt),
        'Registration Date': formatDate(registration.createdAt),
        'Events Count': (registration.selectedEvents || []).length,
        'Workshops Count': (registration.selectedWorkshops || []).length,
        'Events': registration.selectedEvents.map(e => e.eventName).join(', '),
        'Workshops': registration.selectedWorkshops.map(w => w.workshopName).join(', '),
        'Package Name': registration.paymentDetails?.merchantParams?.comboName || 'N/A'
      };
    });

    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Financial Report');

    // Set column widths
    const colWidths = [
      { wch: 24 }, // Registration ID
      { wch: 20 }, // Order ID
      { wch: 24 }, // Razorpay Order ID
      { wch: 24 }, // Razorpay Payment ID
      { wch: 25 }, // Student Name
      { wch: 30 }, // Student Email
      { wch: 15 }, // Student Phone
      { wch: 18 }, // Registration Type
      { wch: 10 }, // Amount
      { wch: 15 }, // Payment Method
      { wch: 20 }, // Payment Date
      { wch: 20 }, // Registration Date
      { wch: 12 }, // Events Count
      { wch: 15 }, // Workshops Count
      { wch: 50 }, // Events
      { wch: 50 }, // Workshops
      { wch: 20 }  // Package Name
    ];
    worksheet['!cols'] = colWidths;

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Set response headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename=financial_report.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    // Send the file
    res.send(excelBuffer);

  } catch (error) {
    console.error('Export financial report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export financial report: ' + error.message
    });
  }
});

/**
 * Export detailed student information for a specific student
 */
router.get('/export/student/:kindeId', async (req, res) => {
  try {
    const { kindeId } = req.params;
    
    // Find the student with populated registrations
    const student = await Student.findOne({ kindeId })
      .populate({
        path: 'registrations',
        populate: [{
          path: 'selectedEvents.eventId',
          model: 'Event'
        }, {
          path: 'selectedWorkshops.workshopId',
          model: 'Workshop'
        }]
      });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Create workbook with multiple sheets
    const workbook = XLSX.utils.book_new();
    
    // Sheet 1: Student Details
    const studentData = [{
      'Student ID': student.kindeId,
      'Name': student.name,
      'Email': student.email,
      'Mobile': student.mobileNumber,
      'Registration Type': student.registrationType,
      'College': student.collegeName || 'N/A',
      'Branch': student.branch || 'N/A',
      'College ID': student.collegeId || 'N/A',
      'Registration Complete': student.registrationComplete ? 'Yes' : 'No',
      'Registration Date': formatDate(student.createdAt)
    }];
    
    const studentSheet = XLSX.utils.json_to_sheet(studentData);
    XLSX.utils.book_append_sheet(workbook, studentSheet, 'Student Details');

    // Sheet 2: Registrations
    const registrations = student.registrations || [];
    if (registrations.length > 0) {
      const registrationData = registrations.map(reg => ({
        'Registration ID': reg._id,
        'Date': formatDate(reg.createdAt),
        'Amount': reg.amount || 0,
        'Payment Status': reg.paymentStatus,
        'Payment Method': reg.paymentDetails?.paymentMethod || 'N/A',
        'Payment ID': reg.paymentDetails?.razorpayPaymentId || 'N/A',
        'Payment Date': formatDate(reg.paymentCompletedAt),
        'Events Count': (reg.selectedEvents || []).length,
        'Workshops Count': (reg.selectedWorkshops || []).length
      }));
      
      const registrationSheet = XLSX.utils.json_to_sheet(registrationData);
      XLSX.utils.book_append_sheet(workbook, registrationSheet, 'Registrations');
    }

    // Sheet 3: Events
    const allEvents = registrations.flatMap(reg => 
      (reg.selectedEvents || []).map(event => ({
        'Registration ID': reg._id,
        'Event ID': event.eventId?._id || event.eventId,
        'Event Name': event.eventName,
        'Status': event.status,
        'Registration Type': event.registrationType,
        'Department': event.eventId?.departments?.[0]?.name || 'N/A',
        'Payment Status': reg.paymentStatus,
        'Registration Date': formatDate(reg.createdAt)
      }))
    );
    
    if (allEvents.length > 0) {
      const eventsSheet = XLSX.utils.json_to_sheet(allEvents);
      XLSX.utils.book_append_sheet(workbook, eventsSheet, 'Events');
    }

    // Sheet 4: Workshops
    const allWorkshops = registrations.flatMap(reg => 
      (reg.selectedWorkshops || []).map(workshop => ({
        'Registration ID': reg._id,
        'Workshop ID': workshop.workshopId?._id || workshop.workshopId,
        'Workshop Name': workshop.workshopName,
        'Status': workshop.status,
        'Department': workshop.workshopId?.departments?.[0]?.name || 'N/A',
        'Payment Status': reg.paymentStatus,
        'Registration Date': formatDate(reg.createdAt)
      }))
    );
    
    if (allWorkshops.length > 0) {
      const workshopsSheet = XLSX.utils.json_to_sheet(allWorkshops);
      XLSX.utils.book_append_sheet(workbook, workshopsSheet, 'Workshops');
    }

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Set response headers for file download
    const sanitizedName = (student.name || 'student').replace(/\s+/g, '_');
    res.setHeader('Content-Disposition', `attachment; filename=${sanitizedName}_${student.kindeId}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    // Send the file
    res.send(excelBuffer);

  } catch (error) {
    console.error('Export student details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export student details: ' + error.message
    });
  }
});

/**
 * Export department-wise registration summary
 */
router.get('/export/departments/summary', async (req, res) => {
  try {
    // Get all events grouped by department
    const events = await Event.find().populate('departments', 'name shortName');
    
    // Get registration counts for events
    const eventCounts = await Registration.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $unwind: '$selectedEvents' },
      { $group: {
          _id: '$selectedEvents.eventId',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Create a map of event ID to count
    const eventCountMap = new Map();
    eventCounts.forEach(item => {
      eventCountMap.set(item._id.toString(), item.count);
    });
    
    // Get all workshops grouped by department
    const workshops = await Workshop.find().populate('departments', 'name shortName');
    
    // Get registration counts for workshops
    const workshopCounts = await Registration.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $unwind: '$selectedWorkshops' },
      { $group: {
          _id: '$selectedWorkshops.workshopId',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Create a map of workshop ID to count
    const workshopCountMap = new Map();
    workshopCounts.forEach(item => {
      workshopCountMap.set(item._id.toString(), item.count);
    });
    
    // Group data by department
    const departmentMap = new Map();
    
    // Process events
    events.forEach(event => {
      const departments = event.departments || [];
      departments.forEach(dept => {
        const deptId = dept._id.toString();
        if (!departmentMap.has(deptId)) {
          departmentMap.set(deptId, {
            name: dept.name,
            shortName: dept.shortName,
            events: [],
            workshops: [],
            totalEventRegistrations: 0,
            totalWorkshopRegistrations: 0,
            totalRevenue: 0
          });
        }
        
        const deptData = departmentMap.get(deptId);
        const registrationCount = eventCountMap.get(event._id.toString()) || 0;
        const revenue = registrationCount * (event.registrationFee || 0);
        
        deptData.events.push({
          id: event._id,
          name: event.title,
          registrationCount,
          fee: event.registrationFee || 0,
          revenue
        });
        
        deptData.totalEventRegistrations += registrationCount;
        deptData.totalRevenue += revenue;
      });
    });
    
    // Process workshops
    workshops.forEach(workshop => {
      const departments = workshop.departments || [];
      departments.forEach(dept => {
        const deptId = dept._id.toString();
        if (!departmentMap.has(deptId)) {
          departmentMap.set(deptId, {
            name: dept.name,
            shortName: dept.shortName,
            events: [],
            workshops: [],
            totalEventRegistrations: 0,
            totalWorkshopRegistrations: 0,
            totalRevenue: 0
          });
        }
        
        const deptData = departmentMap.get(deptId);
        const registrationCount = workshopCountMap.get(workshop._id.toString()) || 0;
        const revenue = registrationCount * (workshop.price || 0);
        
        deptData.workshops.push({
          id: workshop._id,
          name: workshop.title,
          registrationCount,
          fee: workshop.price || 0,
          revenue
        });
        
        deptData.totalWorkshopRegistrations += registrationCount;
        deptData.totalRevenue += revenue;
      });
    });
    
    // Create workbook with multiple sheets
    const workbook = XLSX.utils.book_new();
    
    // Sheet 1: Department Summary
    const summaryData = Array.from(departmentMap.values()).map(dept => ({
      'Department': dept.name,
      'Short Name': dept.shortName,
      'Events Count': dept.events.length,
      'Workshops Count': dept.workshops.length,
      'Event Registrations': dept.totalEventRegistrations,
      'Workshop Registrations': dept.totalWorkshopRegistrations,
      'Total Registrations': dept.totalEventRegistrations + dept.totalWorkshopRegistrations,
      'Total Revenue': dept.totalRevenue
    }));
    
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Department Summary');
    
    // Create a sheet for each department
    departmentMap.forEach((deptData, deptId) => {
      // Events data
      if (deptData.events.length > 0) {
        const eventData = deptData.events.map(event => ({
          'Event ID': event.id,
          'Event Name': event.name,
          'Registration Count': event.registrationCount,
          'Registration Fee': event.fee,
          'Revenue': event.revenue
        }));
        
        const eventSheet = XLSX.utils.json_to_sheet(eventData);
        XLSX.utils.book_append_sheet(workbook, eventSheet, `${deptData.shortName}-Events`);
      }
      
      // Workshops data
      if (deptData.workshops.length > 0) {
        const workshopData = deptData.workshops.map(workshop => ({
          'Workshop ID': workshop.id,
          'Workshop Name': workshop.name,
          'Registration Count': workshop.registrationCount,
          'Registration Fee': workshop.fee,
          'Revenue': workshop.revenue
        }));
        
        const workshopSheet = XLSX.utils.json_to_sheet(workshopData);
        XLSX.utils.book_append_sheet(workbook, workshopSheet, `${deptData.shortName}-Workshops`);
      }
    });
    
    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Set response headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename=department_summary.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    // Send the file
    res.send(excelBuffer);

  } catch (error) {
    console.error('Export department summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export department summary: ' + error.message
    });
  }
});

export default router;