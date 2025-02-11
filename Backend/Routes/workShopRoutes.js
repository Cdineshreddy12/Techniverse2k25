import express from 'express';
import Workshop from '../Models/workshopModel.js';
import { Department } from '../Models/DepartmentModel.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to determine registration status
function getRegistrationStatus(workshop) {
  const now = new Date();
  
  if (!workshop.registration.isOpen) {
    return 'closed';
  }
  
  if (now < new Date(workshop.registration.startTime)) {
    return 'upcoming';
  }
  
  if (now > new Date(workshop.registration.endTime)) {
    return 'ended';
  }
  
  if (workshop.registration.registeredCount >= workshop.registration.totalSlots) {
    return 'full';
  }
  
  return 'open';
}


// Configure multer with improved error handling
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).fields([
  { name: 'bannerDesktop', maxCount: 1 },
  { name: 'bannerMobile', maxCount: 1 },
  { name: 'lecturerPhoto', maxCount: 1 }
]);

// Enhanced error handling middleware
const handleUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        error: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
    next();
  });
};

// Improved Cloudinary upload with better error handling
const uploadToCloudinary = async (file, folder = 'workshops') => {
  if (!file) return null;
  
  try {
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: folder,
      resource_type: 'auto'
    });
    
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

// Validation middleware
const validateWorkshopData = (req, res, next) => {
  try {
    const workshopData = JSON.parse(req.body.workshopData);
    
    // Required fields validation
    const requiredFields = ['title', 'description', 'departments'];
    const missingFields = requiredFields.filter(field => !workshopData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate registration data
    if (workshopData.registration) {
      const { startTime, endTime, totalSlots } = workshopData.registration;
      
      if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
        return res.status(400).json({
          success: false,
          error: 'Registration end time must be after start time'
        });
      }

      if (totalSlots && (totalSlots < 1 || !Number.isInteger(totalSlots))) {
        return res.status(400).json({
          success: false,
          error: 'Total slots must be a positive integer'
        });
      }
    }

    // Validate duration
    if (workshopData.duration) {
      const { total, unit } = workshopData.duration;
      if (total && (total < 1 || !Number.isInteger(total))) {
        return res.status(400).json({
          success: false,
          error: 'Duration total must be a positive integer'
        });
      }
      if (unit && !['hours', 'days'].includes(unit)) {
        return res.status(400).json({
          success: false,
          error: 'Duration unit must be either "hours" or "days"'
        });
      }
    }

    // Validate price
    if (workshopData.price && workshopData.price < 0) {
      return res.status(400).json({
        success: false,
        error: 'Price cannot be negative'
      });
    }

    req.workshopData = workshopData;
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: 'Invalid workshop data format'
    });
  }
};

// Get overall workshop stats with improved error handling
router.get('/workshops/stats/overall', async (req, res) => {
  try {
    const workshops = await Workshop.find().lean();
    const now = new Date();

    const stats = {
      totalWorkshops: workshops.length,
      totalRegistrations: workshops.reduce((sum, workshop) => 
        sum + (workshop.registration?.registeredCount || 0), 0),
      totalRevenue: workshops.reduce((sum, workshop) => 
        sum + ((workshop.price || 0) * (workshop.registration?.registeredCount || 0)), 0),
      totalLearningHours: workshops.reduce((sum, workshop) => {
        const hours = workshop.duration?.unit === 'days' 
          ? (workshop.duration.total || 0) * 24 
          : (workshop.duration?.total || 0);
        return sum + hours;
      }, 0),
      activeWorkshops: workshops.filter(workshop => 
        workshop.status === 'upcoming' && 
        workshop.registration?.isOpen &&
        new Date(workshop.registration?.endTime) > now
      ).length,
      workshopsByStatus: {
        upcoming: workshops.filter(w => w.status === 'upcoming').length,
        ongoing: workshops.filter(w => w.status === 'ongoing').length,
        completed: workshops.filter(w => w.status === 'completed').length,
        cancelled: workshops.filter(w => w.status === 'cancelled').length
      },
      registrationStats: {
        openRegistrations: workshops.filter(w => 
          w.registration?.isOpen && 
          (w.registration?.registeredCount || 0) < (w.registration?.totalSlots || 0)
        ).length,
        fullWorkshops: workshops.filter(w => 
          (w.registration?.registeredCount || 0) >= (w.registration?.totalSlots || 0)
        ).length,
        totalSlots: workshops.reduce((sum, w) => sum + (w.registration?.totalSlots || 0), 0),
        filledSlots: workshops.reduce((sum, w) => sum + (w.registration?.registeredCount || 0), 0)
      }
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Get overall stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch overall statistics'
    });
  }
});

router.get('/departments/:departmentId/workshops', async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { status, page = 1, limit = 10, search } = req.query;

    // Build query
    const query = { departments: departmentId };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch workshops with pagination and populated fields
    const workshops = await Workshop.find(query)
      .populate({
        path: 'departments',
        select: 'name shortName color activeEventCount'
      })
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Workshop.countDocuments(query);

    // Add virtual fields and format response
    const formattedWorkshops = workshops.map(workshop => {
      const workshopObj = workshop.toObject({ virtuals: true });
      return {
        ...workshopObj,
        totalLearningHours: workshop.duration.unit === 'days' 
          ? workshop.duration.total * 24 
          : workshop.duration.total,
        availableSlots: Math.max(0, workshop.registration.totalSlots - workshop.registration.registeredCount),
        registrationStatus: getRegistrationStatus(workshop)
      };
    });

    res.json({
      success: true,
      workshops: formattedWorkshops,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get department workshops error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch department workshops'
    });
  }
});

// Get specific workshop in a department
router.get('/departments/:departmentId/workshops/:workshopId', async (req, res) => {
  try {
    const { departmentId, workshopId } = req.params;

    // Find workshop and populate necessary fields
    const workshop = await Workshop.findOne({
      _id: workshopId,
      departments: departmentId
    }).populate('departments', 'name shortName color activeEventCount');

    if (!workshop) {
      return res.status(404).json({
        success: false,
        error: 'Workshop not found in this department'
      });
    }

    // Convert to object to add virtual fields
    const workshopObj = workshop.toObject({ virtuals: true });

    // Add computed fields
    const response = {
      ...workshopObj,
      totalLearningHours: workshop.duration.unit === 'days' 
        ? workshop.duration.total * 24 
        : workshop.duration.total,
      availableSlots: Math.max(0, workshop.registration.totalSlots - workshop.registration.registeredCount),
      registrationStatus: getRegistrationStatus(workshop)
    };

    res.json({
      success: true,
      workshop: response
    });
  } catch (error) {
    console.error('Get department workshop details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workshop details'
    });
  }
});

// Create new workshop with improved validation and error handling
router.post('/workshops', handleUpload, validateWorkshopData, async (req, res) => {
  try {
    const workshopData = req.workshopData;
    
    // Handle image uploads
    const [bannerDesktopUrl, bannerMobileUrl, lecturerPhotoUrl] = await Promise.all([
      req.files?.bannerDesktop ? uploadToCloudinary(req.files.bannerDesktop[0], 'workshops/desktop') : null,
      req.files?.bannerMobile ? uploadToCloudinary(req.files.bannerMobile[0], 'workshops/mobile') : null,
      req.files?.lecturerPhoto ? uploadToCloudinary(req.files.lecturerPhoto[0], 'workshops/lecturers') : null
    ]);

    // Create workshop with validated data
    const workshop = new Workshop({
      ...workshopData,
      bannerDesktop: bannerDesktopUrl,
      bannerMobile: bannerMobileUrl,
      lecturer: {
        ...workshopData.lecturer,
        photo: lecturerPhotoUrl
      },
      registration: {
        ...workshopData.registration,
        registeredCount: 0,
        isOpen: workshopData.registration?.isOpen || false
      },
      price: workshopData.price || 0,
      duration: {
        total: workshopData.duration?.total || 1,
        unit: workshopData.duration?.unit || 'hours'
      },
      status: 'upcoming'
    });

    await workshop.save();

    // Update department references
    if (workshopData.departments?.length > 0) {
      await Department.updateMany(
        { _id: { $in: workshopData.departments } },
        { $addToSet: { workshops: workshop._id } }
      );
    }

    const populatedWorkshop = await Workshop.findById(workshop._id)
      .populate('departments', 'name shortName')
      .lean();

    res.status(201).json({
      success: true,
      workshop: populatedWorkshop
    });
  } catch (error) {
    console.error('Create workshop error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to create workshop: ' + error.message
    });
  }
});

router.put('/workshops/:workshopId', handleUpload, validateWorkshopData, async (req, res) => {
  try {
    const { workshopId } = req.params;
    const workshopData = req.workshopData;

    // Get existing workshop
    const existingWorkshop = await Workshop.findById(workshopId);
    if (!existingWorkshop) {
      return res.status(404).json({
        success: false,
        error: 'Workshop not found'
      });
    }

    // Handle image uploads and cleanup old images
    const [bannerDesktopUrl, bannerMobileUrl, lecturerPhotoUrl] = await Promise.all([
      req.files?.bannerDesktop ? uploadToCloudinary(req.files.bannerDesktop[0], 'workshops/desktop') : workshopData.bannerDesktop || existingWorkshop.bannerDesktop,
      req.files?.bannerMobile ? uploadToCloudinary(req.files.bannerMobile[0], 'workshops/mobile') : workshopData.bannerMobile || existingWorkshop.bannerMobile,
      req.files?.lecturerPhoto ? uploadToCloudinary(req.files.lecturerPhoto[0], 'workshops/lecturers') : workshopData.lecturer?.photo || existingWorkshop.lecturer?.photo
    ]);

    // Create update data with all fields
    const updateData = {
      title: workshopData.title,
      description: workshopData.description,
      departments: workshopData.departments,
      price: workshopData.price || existingWorkshop.price || 0,
      duration: {
        total: workshopData.duration?.total || existingWorkshop.duration?.total || 1,
        unit: workshopData.duration?.unit || existingWorkshop.duration?.unit || 'hours'
      },
      registration: {
        isOpen: workshopData.registration?.isOpen ?? existingWorkshop.registration?.isOpen ?? false,
        totalSlots: workshopData.registration?.totalSlots || existingWorkshop.registration?.totalSlots || 30,
        registeredCount: existingWorkshop.registration?.registeredCount || 0,
        startTime: workshopData.registration?.startTime || existingWorkshop.registration?.startTime,
        endTime: workshopData.registration?.endTime || existingWorkshop.registration?.endTime
      },
      registrationEndTime: workshopData.registration?.endTime || existingWorkshop.registrationEndTime,
      lecturer: {
        name: workshopData.lecturer?.name,
        title: workshopData.lecturer?.title,
        photo: lecturerPhotoUrl,
        specifications: workshopData.lecturer?.specifications || []
      },
      schedule: workshopData.schedule || [],
      prerequisites: workshopData.prerequisites || [],
      outcomes: workshopData.outcomes || [],
      status: workshopData.status || 'upcoming',
      bannerDesktop: bannerDesktopUrl,
      bannerMobile: bannerMobileUrl
    };

    // Update workshop and ensure all fields are returned
    const updatedWorkshop = await Workshop.findByIdAndUpdate(
      workshopId,
      updateData,
      { 
        new: true,
        runValidators: true
      }
    ).populate('departments', 'name shortName');

    // Update department references
    if (workshopData.departments?.length > 0) {
      await Promise.all([
        Department.updateMany(
          { workshops: workshopId },
          { $pull: { workshops: workshopId } }
        ),
        Department.updateMany(
          { _id: { $in: workshopData.departments } },
          { $addToSet: { workshops: workshopId } }
        )
      ]);
    }

    // Convert to plain object and ensure all fields are included
    const response = {
      ...updatedWorkshop.toObject(),
      price: updateData.price,
      duration: updateData.duration,
      registration: updateData.registration,
      registrationEndTime: updateData.registrationEndTime
    };

    console.log('response',response);
    res.json({
      success: true,
      workshop: response
    });
  } catch (error) {
    console.error('Update workshop error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to update workshop: ' + error.message
    });
  }
});
// Delete workshop with improved cleanup
router.delete('/workshops/:workshopId', async (req, res) => {
  try {
    const { workshopId } = req.params;
    const workshop = await Workshop.findById(workshopId);
    
    if (!workshop) {
      return res.status(404).json({
        success: false,
        error: 'Workshop not found'
      });
    }

    // Delete images from Cloudinary
    const deletePromises = [];
    if (workshop.bannerDesktop) {
      const publicId = workshop.bannerDesktop.split('/').pop().split('.')[0];
      deletePromises.push(cloudinary.uploader.destroy(publicId));
    }
    if (workshop.bannerMobile) {
      const publicId = workshop.bannerMobile.split('/').pop().split('.')[0];
      deletePromises.push(cloudinary.uploader.destroy(publicId));
    }
    if (workshop.lecturer?.photo) {
      const publicId = workshop.lecturer.photo.split('/').pop().split('.')[0];
      deletePromises.push(cloudinary.uploader.destroy(publicId));
    }

    await Promise.all([
      ...deletePromises,
      Department.updateMany(
        { workshops: workshopId },
        { $pull: { workshops: workshopId } }
      ),
      workshop.deleteOne()
    ]);

    res.json({
      success: true,
      message: 'Workshop deleted successfully'
    });
  } catch (error) {
    console.error('Delete workshop error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete workshop: ' + error.message
    });
  }
});

export default router;