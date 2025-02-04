import express from 'express';
import { Registration } from '../Models/RegistrationSchema.js';
import * as XLSX from 'xlsx';

const router = express.Router();

// Helper function to safely access combo name
const getPackageName = (combo) => {
  try {
    if (!combo) return 'N/A';
    // Access the name directly from the object
    return combo.name || 'N/A';
  } catch (error) {
    console.error('Error accessing package name:', error);
    return 'N/A';
  }
};

router.get('/registration-stats', async (req, res) => {
    try {
      // Get all necessary stats in a single aggregation pipeline
      const stats = await Registration.aggregate([
        {
          $facet: {
            'totalRegistrations': [
              { $count: 'count' }
            ],
            'totalRevenue': [
              { $group: { _id: null, total: { $sum: '$amount' } } }
            ],
            'paymentStats': [
              {
                $group: {
                  _id: '$paymentStatus',
                  count: { $sum: 1 }
                }
              }
            ],
            'packageDistribution': [
              {
                $group: {
                  _id: '$combo.name',
                  count: { $sum: 1 },
                  revenue: { $sum: '$amount' }
                }
              }
            ],
            'recentRegistrations': [
              { $sort: { createdAt: -1 } },
              { $limit: 5 },
              {
                $lookup: {
                  from: 'students',
                  localField: 'student',
                  foreignField: '_id',
                  as: 'studentDetails'
                }
              }
            ]
          }
        }
      ]);
  
      // Format the stats for frontend
      const formattedStats = {
        totalRegistrations: stats[0].totalRegistrations[0]?.count || 0,
        totalRevenue: stats[0].totalRevenue[0]?.total || 0,
        completedPayments: stats[0].paymentStats.find(s => s._id === 'completed')?.count || 0,
        pendingPayments: stats[0].paymentStats.find(s => s._id === 'pending')?.count || 0,
        packageDistribution: stats[0].packageDistribution,
        recentRegistrations: stats[0].recentRegistrations
      };
  
      res.json({ success: true, stats: formattedStats });
    } catch (error) {
      console.error('Stats Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/registrations-preview', async (req, res) => {
    try {
      const { 
        page = 1, 
        pageSize = 50,
        search = '', 
        sortBy = 'createdAt', // Default sort field
        sortOrder = 'desc',
        paymentStatus = '',
        package: selectedPackage = '',
        branch = ''
      } = req.query;
  
      console.log('Received query params:', { 
        page, pageSize, search, sortBy, sortOrder, 
        paymentStatus, selectedPackage, branch 
      });
  
      // Build base query
      let query = {};
  
      // Add filters to query
      if (paymentStatus) {
        query.paymentStatus = paymentStatus;
      }
  
      if (selectedPackage) {
        query['combo.name'] = selectedPackage;
      }
  
      // Add search conditions if search term exists
      if (search) {
        query.$or = [
          { 'student.name': { $regex: search, $options: 'i' } },
          { 'student.email': { $regex: search, $options: 'i' } },
          { transactionId: { $regex: search, $options: 'i' } }
        ];
      }
  
      // Map frontend sort fields to database fields
      const sortFieldMap = {
        'date': 'createdAt',
        'amount': 'amount',
        'name': 'student.name',
        'status': 'paymentStatus',
        'package': 'combo.name'
      };
  
      // Build sort object
      let sortOptions = {};
      if (sortBy && sortFieldMap[sortBy]) {
        sortOptions[sortFieldMap[sortBy]] = sortOrder === 'desc' ? -1 : 1;
      } else {
        // Default sort by creation date if no valid sort field
        sortOptions.createdAt = -1;
      }
  
      console.log('Sort options:', sortOptions);
  
      // Get total count
      const total = await Registration.countDocuments(query);
  
      // Fetch paginated data
      const registrations = await Registration.find(query)
        .populate('student', 'name email collegeId branch collegeName')
        .sort(sortOptions)
        .skip((parseInt(page) - 1) * parseInt(pageSize))
        .limit(parseInt(pageSize))
        .lean();
  
      // Apply branch filter after population if needed
      const filteredRegistrations = branch 
        ? registrations.filter(reg => 
            reg.student?.branch?.toLowerCase().includes(branch.toLowerCase())
          )
        : registrations;
  
      console.log(`Found ${filteredRegistrations.length} registrations`);
  
      // Send response
      res.json({
        success: true,
        data: {
          registrations: filteredRegistrations,
          pagination: {
            total,
            totalPages: Math.ceil(total / parseInt(pageSize)),
            currentPage: parseInt(page),
            pageSize: parseInt(pageSize)
          }
        }
      });
  
    } catch (error) {
      console.error('Preview Error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

// API endpoint to download registration data as Excel
// Update the export-registrations route to handle columns
router.get('/export-registrations', async (req, res) => {
    try {
      console.log('Starting export...');
      
      // Get selected columns from query params
      const selectedColumns = req.query.columns ? JSON.parse(req.query.columns) : null;
      
      // Fetch all registrations with populated student data
      const registrations = await Registration.find()
        .populate('student', 'email name collegeId branch collegeName')
        .lean();
  
      console.log(`Found ${registrations.length} registrations`);
  
      // Transform data for Excel format
      const excelData = registrations.map((reg, index) => {
        try {
          const baseData = {
            'S.No': index + 1
          };
  
          // If selectedColumns is provided, only include those columns
          if (selectedColumns && selectedColumns.length > 0) {
            selectedColumns.forEach(column => {
              switch (column) {
                case 'Transaction ID':
                  baseData[column] = reg.transactionId || 'N/A';
                  break;
                case 'Student Name':
                  baseData[column] = reg.student?.name || 'N/A';
                  break;
                case 'Email':
                  baseData[column] = reg.student?.email || 'N/A';
                  break;
                case 'College ID':
                  baseData[column] = reg.student?.collegeId || 'N/A';
                  break;
                case 'Branch':
                  baseData[column] = reg.student?.branch || 'N/A';
                  break;
                case 'College Name':
                  baseData[column] = reg.student?.collegeName || 'N/A';
                  break;
                case 'Package':
                  baseData[column] = getPackageName(reg.combo);
                  break;
                case 'Amount':
                  baseData[column] = reg.amount || 0;
                  break;
                case 'Payment Status':
                  baseData[column] = reg.paymentStatus || 'N/A';
                  break;
                case 'Events':
                  baseData[column] = Array.isArray(reg.selectedEvents) 
                    ? reg.selectedEvents.map(e => e.eventName || 'N/A').join(', ') 
                    : 'N/A';
                  break;
                case 'Workshops':
                  baseData[column] = Array.isArray(reg.selectedWorkshops) 
                    ? reg.selectedWorkshops.map(w => w.workshopName || 'N/A').join(', ') 
                    : 'N/A';
                  break;
                case 'Registration Date':
                  baseData[column] = reg.createdAt 
                    ? new Date(reg.createdAt).toLocaleDateString() 
                    : 'N/A';
                  break;
                case 'Last Updated':
                  baseData[column] = reg.updatedAt 
                    ? new Date(reg.updatedAt).toLocaleDateString() 
                    : 'N/A';
                  break;
              }
            });
            return baseData;
          }
  
          // If no columns specified, return all columns
          return {
            'S.No': index + 1,
            'Transaction ID': reg.transactionId || 'N/A',
            'Student Name': reg.student?.name || 'N/A',
            'Email': reg.student?.email || 'N/A',
            'College ID': reg.student?.collegeId || 'N/A',
            'Branch': reg.student?.branch || 'N/A',
            'College Name': reg.student?.collegeName || 'N/A',
            'Package': getPackageName(reg.combo),
            'Amount': reg.amount || 0,
            'Payment Status': reg.paymentStatus || 'N/A',
            'Events': Array.isArray(reg.selectedEvents) 
              ? reg.selectedEvents.map(e => e.eventName || 'N/A').join(', ') 
              : 'N/A',
            'Workshops': Array.isArray(reg.selectedWorkshops) 
              ? reg.selectedWorkshops.map(w => w.workshopName || 'N/A').join(', ') 
              : 'N/A',
            'Registration Date': reg.createdAt 
              ? new Date(reg.createdAt).toLocaleDateString() 
              : 'N/A',
            'Last Updated': reg.updatedAt 
              ? new Date(reg.updatedAt).toLocaleDateString() 
              : 'N/A'
          };
        } catch (error) {
          console.error('Error processing registration:', error);
          return {
            'S.No': index + 1,
            'Error': 'Failed to process registration'
          };
        }
      });
  
      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);
  
      // Set column widths
      const colWidths = Object.keys(excelData[0] || {}).map(key => ({
        wch: getColumnWidth(key)
      }));
      worksheet['!cols'] = colWidths;
  
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');
  
      // Generate buffer
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'buffer' 
      });
  
      // Set response headers
      res.setHeader(
        'Content-Type', 
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition', 
        `attachment; filename=Techniverse_Registrations_${new Date().toISOString().split('T')[0]}.xlsx`
      );
  
      // Send the file
      res.send(excelBuffer);
  
    } catch (error) {
      console.error('Excel Export Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export registrations: ' + error.message
      });
    }
  });

// API endpoint to download filtered registrations
router.post('/export-filtered-registrations', async (req, res) => {
    try {
      const {
        startDate,
        endDate,
        paymentStatus,
        package: selectedPackage,
        branch,
        searchTerm,
        sortBy,
        sortOrder,
        selectedColumns
      } = req.body;
  
      // Build query
      let query = {};
  
      // Date range filter
      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
  
      // Payment status filter
      if (paymentStatus) {
        query.paymentStatus = paymentStatus;
      }
  
      // Package filter
      if (selectedPackage) {
        query['combo.name'] = selectedPackage;
      }
  
      // Search term
      if (searchTerm) {
        query.$or = [
          { 'student.name': { $regex: searchTerm, $options: 'i' } },
          { 'student.email': { $regex: searchTerm, $options: 'i' } },
          { transactionId: { $regex: searchTerm, $options: 'i' } }
        ];
      }
  
      // Fetch filtered registrations
      let registrations = await Registration.find(query)
        .populate('student', 'name email collegeId branch collegeName')
        .sort(sortBy ? { [sortBy]: sortOrder === 'desc' ? -1 : 1 } : {})
        .lean();
  
      // Apply branch filter if needed
      if (branch) {
        registrations = registrations.filter(reg => 
          reg.student?.branch?.toLowerCase().includes(branch.toLowerCase())
        );
      }
  
      // Transform data for Excel
      const excelData = registrations.map((reg, index) => {
        const rowData = {
          'S.No': index + 1
        };
  
        // Add selected columns
        selectedColumns.forEach(column => {
          rowData[column] = getColumnValue(reg, column);
        });
  
        return rowData;
      });
  
      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);
  
      // Set column widths
      const colWidths = [{ wch: 5 }]; // For S.No
      selectedColumns.forEach(column => {
        colWidths.push({ wch: getColumnWidth(column) });
      });
      worksheet['!cols'] = colWidths;
  
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Filtered_Registrations');
  
      // Generate Excel buffer
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'buffer' 
      });
  
      // Set headers and send response
      res.setHeader(
        'Content-Type', 
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition', 
        `attachment; filename=Techniverse_Filtered_Registrations_${new Date().toISOString().split('T')[0]}.xlsx`
      );
  
      res.send(excelBuffer);
  
    } catch (error) {
      console.error('Filtered Export Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

// Add this helper function at the top with your other helper functions
const getColumnValue = (reg, column) => {
    switch (column) {
      case 'Transaction ID':
        return reg.transactionId || 'N/A';
      case 'Student Name':
        return reg.student?.name || 'N/A';
      case 'Email':
        return reg.student?.email || 'N/A';
      case 'College ID':
        return reg.student?.collegeId || 'N/A';
      case 'Branch':
        return reg.student?.branch || 'N/A';
      case 'College Name':
        return reg.student?.collegeName || 'N/A';
      case 'Package':
        return getPackageName(reg.combo);
      case 'Amount':
        return reg.amount || 0;
      case 'Payment Status':
        return reg.paymentStatus || 'N/A';
      case 'Events':
        return Array.isArray(reg.selectedEvents) 
          ? reg.selectedEvents.map(e => e.eventName || 'N/A').join(', ') 
          : 'N/A';
      case 'Workshops':
        return Array.isArray(reg.selectedWorkshops) 
          ? reg.selectedWorkshops.map(w => w.workshopName || 'N/A').join(', ') 
          : 'N/A';
      case 'Registration Date':
        return reg.createdAt 
          ? new Date(reg.createdAt).toLocaleDateString() 
          : 'N/A';
      case 'Last Updated':
        return reg.updatedAt 
          ? new Date(reg.updatedAt).toLocaleDateString() 
          : 'N/A';
      default:
        return 'N/A';
    }
  };

// Helper function for column width
const getColumnWidth = (column) => {
  const widths = {
    'S.No': 5,
    'Transaction ID': 20,
    'Student Name': 20,
    'Email': 25,
    'College ID': 15,
    'Branch': 15,
    'College Name': 30,
    'Package': 15,
    'Amount': 10,
    'Payment Status': 15,
    'Events': 40,
    'Workshops': 40,
    'Registration Date': 15,
    'Last Updated': 15
  };
  return widths[column] || 15;
};

export default router;