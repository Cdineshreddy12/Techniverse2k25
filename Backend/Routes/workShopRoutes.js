import express from 'express';
import Workshop from '../Models/workShopModel.js';
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
function getRegistrationStatus(workshop = {}) {
  if (!workshop || !workshop.registration) {
    return 'closed';
  }

  const now = new Date();
  const registration = workshop.registration;
  
  // If registration is explicitly closed
  if (!registration.isOpen) {
    return 'closed';
  }
  
  // Check date conditions if dates are provided
  if (registration.startTime && now < new Date(registration.startTime)) {
    return 'upcoming';
  }
  
  if (registration.endTime && now > new Date(registration.endTime)) {
    return 'ended';
  }
  
  // Check capacity
  const registeredCount = registration.registeredCount || 0;
  const totalSlots = registration.totalSlots || 0;
  
  if (registeredCount >= totalSlots) {
    return 'full';
  }
  
  return 'open';
}

// Get all workshops with pagination and search
router.get('/workshops', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch workshops with populated departments
    const workshops = await Workshop.find(query)
      .populate('departments', 'name shortName color activeEventCount')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Workshop.countDocuments(query);

    // Add computed fields to each workshop with null checks
    const formattedWorkshops = workshops.map(workshop => {
      // Ensure workshop has all required properties with defaults
      const formattedWorkshop = {
        ...workshop,
        registration: {
          isOpen: false,
          totalSlots: 0,
          registeredCount: 0,
          startTime: null,
          endTime: null,
          ...workshop.registration
        },
        duration: {
          total: 0,
          unit: 'hours',
          ...workshop.duration
        },
        price: workshop.price || 0,
        status: workshop.status || 'upcoming',
        departments: workshop.departments || []
      };

      // Calculate derived fields
      return {
        ...formattedWorkshop,
        totalLearningHours: formattedWorkshop.duration.unit === 'days' 
          ? (formattedWorkshop.duration.total || 0) * 24 
          : (formattedWorkshop.duration.total || 0),
        availableSlots: Math.max(
          0, 
          (formattedWorkshop.registration.totalSlots || 0) - 
          (formattedWorkshop.registration.registeredCount || 0)
        ),
        registrationStatus: getRegistrationStatus(formattedWorkshop)
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
    console.error('Get workshops error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workshops'
    });
  }
});


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
  { name: 'lecturerPhoto_0', maxCount: 1 },
  { name: 'lecturerPhoto_1', maxCount: 1 },
  { name: 'lecturerPhoto_2', maxCount: 1 },
  { name: 'lecturerPhoto_3', maxCount: 1 },
  { name: 'lecturerPhoto_4', maxCount: 1 }
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
const validateWorkshopData = (workshopData) => {
  const errors = [];

  // Validate banner fields
  if (!workshopData.bannerDesktop?.url) {
    errors.push('Desktop banner URL is required');
  } else if (typeof workshopData.bannerDesktop.url !== 'string') {
    errors.push('Desktop banner URL must be a string');
  }

  if (!workshopData.bannerMobile?.url) {
    errors.push('Mobile banner URL is required');
  } else if (typeof workshopData.bannerMobile.url !== 'string') {
    errors.push('Mobile banner URL must be a string');
  }

  // Validate basic fields
  if (!workshopData.title?.trim()) {
    errors.push('Title is required');
  }

  if (!workshopData.description?.trim()) {
    errors.push('Description is required');
  }

  // Validate departments
  if (!Array.isArray(workshopData.departments) || workshopData.departments.length === 0) {
    errors.push('At least one department is required');
  }

  // Validate lecturers
  if (!Array.isArray(workshopData.lecturers) || workshopData.lecturers.length === 0) {
    errors.push('At least one lecturer is required');
  } else {
    workshopData.lecturers.forEach((lecturer, index) => {
      if (!lecturer.name?.trim()) {
        errors.push(`Lecturer ${index + 1} name is required`);
      }
      if (!lecturer.title?.trim()) {
        errors.push(`Lecturer ${index + 1} title is required`);
      }
      if (!lecturer.role?.trim()) {
        errors.push(`Lecturer ${index + 1} role is required`);
      }
      if (!lecturer.photo) {
        errors.push(`Lecturer ${index + 1} photo is required`);
      }
    });
  }

  // Validate price and duration
  if (typeof workshopData.price !== 'number' || workshopData.price < 0) {
    errors.push('Price must be a non-negative number');
  }

  if (!workshopData.duration?.total || !workshopData.duration?.unit) {
    errors.push('Duration total and unit are required');
  }

  // Validate registration details
  if (!workshopData.registration?.startTime || !workshopData.registration?.endTime) {
    errors.push('Registration start and end times are required');
  }

  if (typeof workshopData.registration?.totalSlots !== 'number' || workshopData.registration.totalSlots <= 0) {
    errors.push('Total slots must be a positive number');
  }

  // Return validation result
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Get overall workshop stats with improved error handling
router.get('/workshops/stats/overall', async (req, res) => {
  try {
    const workshops = await Workshop.find().lean();
    const now = new Date();

    const stats = {
      totalWorkshops: workshops.length,
      totalRegistrations: workshops.reduce((sum, workshop) => 
        sum + ((workshop.registration?.registeredCount || 0)), 0),
      totalRevenue: workshops.reduce((sum, workshop) => 
        sum + ((workshop.price || 0) * (workshop.registration?.registeredCount || 0)), 0),
      totalLearningHours: workshops.reduce((sum, workshop) => {
        const duration = workshop.duration || { total: 0, unit: 'hours' };
        const hours = duration.unit === 'days' 
          ? (duration.total || 0) * 24 
          : (duration.total || 0);
        return sum + hours;
      }, 0),
      activeWorkshops: workshops.filter(workshop => {
        const registration = workshop.registration || {};
        return workshop.status === 'upcoming' && 
               registration.isOpen &&
               registration.endTime &&
               new Date(registration.endTime) > now;
      }).length,
      workshopsByStatus: {
        upcoming: workshops.filter(w => w.status === 'upcoming').length,
        ongoing: workshops.filter(w => w.status === 'ongoing').length,
        completed: workshops.filter(w => w.status === 'completed').length,
        cancelled: workshops.filter(w => w.status === 'cancelled').length
      },
      registrationStats: {
        openRegistrations: workshops.filter(w => {
          const registration = w.registration || {};
          return registration.isOpen && 
                 (registration.registeredCount || 0) < (registration.totalSlots || 0);
        }).length,
        fullWorkshops: workshops.filter(w => {
          const registration = w.registration || {};
          return (registration.registeredCount || 0) >= (registration.totalSlots || 0);
        }).length,
        totalSlots: workshops.reduce((sum, w) => 
          sum + (w.registration?.totalSlots || 0), 0),
        filledSlots: workshops.reduce((sum, w) => 
          sum + (w.registration?.registeredCount || 0), 0)
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

router.get('/workshops', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch workshops with populated departments
    const workshops = await Workshop.find(query)
      .populate('departments', 'name shortName color activeEventCount')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Workshop.countDocuments(query);

    // Add computed fields to each workshop with null checks
    const formattedWorkshops = workshops.map(workshop => {
      // Default values for registration and duration if they don't exist
      const registration = workshop.registration || {
        totalSlots: 0,
        registeredCount: 0,
        isOpen: false
      };

      const duration = workshop.duration || {
        total: 0,
        unit: 'hours'
      };

      return {
        ...workshop,
        registration,
        duration,
        totalLearningHours: duration.unit === 'days' 
          ? (duration.total || 0) * 24 
          : (duration.total || 0),
        availableSlots: Math.max(0, registration.totalSlots - registration.registeredCount),
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
    console.error('Get workshops error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workshops'
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

const parseWorkshopData = (req, res, next) => {
  try {
    // Check if workshopData exists in the request body
    if (!req.body.workshopData) {
      return res.status(400).json({
        success: false,
        error: 'Workshop data is required'
      });
    }

    // Parse the workshop data
    const workshopData = typeof req.body.workshopData === 'string' 
      ? JSON.parse(req.body.workshopData)
      : req.body.workshopData;

    // Basic validation
    if (!workshopData.title || !workshopData.description || !workshopData.departments) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    req.workshopData = workshopData;
    next();
  } catch (error) {
    console.error('Parse workshop data error:', error);
    return res.status(400).json({
      success: false,
      error: 'Invalid workshop data format'
    });
  }
};



// Create new workshop with improved validation and error handling
// Update the create workshop route
router.post('/workshops', 
  (req, res, next) => {
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
  },
  parseWorkshopData,
  async (req, res) => {
    try {
      const workshopData = req.workshopData;
      
      // Handle image uploads
      const [bannerDesktopUrl, bannerMobileUrl] = await Promise.all([
        req.files?.bannerDesktop ? uploadToCloudinary(req.files.bannerDesktop[0], 'workshops/desktop') : null,
        req.files?.bannerMobile ? uploadToCloudinary(req.files.bannerMobile[0], 'workshops/mobile') : null
      ]);

      // Handle lecturer photos
      const lecturerPhotos = await Promise.all(
        (workshopData.lecturers || []).map(async (lecturer, index) => {
          const photoFile = req.files[`lecturerPhoto_${index}`]?.[0];
          if (photoFile) {
            return uploadToCloudinary(photoFile, 'workshops/lecturers');
          }
          return null;
        })
      );

      // Create workshop
      const workshop = new Workshop({
        ...workshopData,
        bannerDesktop: bannerDesktopUrl,
        bannerMobile: bannerMobileUrl,
        lecturers: workshopData.lecturers.map((lecturer, index) => ({
          ...lecturer,
          photo: lecturerPhotos[index] || lecturer.photo || null
        })),
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
  }
);

router.put('/workshops/:workshopId', handleUpload, parseWorkshopData, async (req, res) => {
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

    // Handle banner images
    const [bannerDesktopUrl, bannerMobileUrl] = await Promise.all([
      req.files?.bannerDesktop ? uploadToCloudinary(req.files.bannerDesktop[0], 'workshops/desktop') : workshopData.bannerDesktop || existingWorkshop.bannerDesktop,
      req.files?.bannerMobile ? uploadToCloudinary(req.files.bannerMobile[0], 'workshops/mobile') : workshopData.bannerMobile || existingWorkshop.bannerMobile,
    ]);

    // Handle lecturer photos and process lecturers
    const lecturers = await Promise.all(
      workshopData.lecturers.map(async (lecturer, index) => {
        const photoFile = req.files[`lecturerPhoto_${index}`]?.[0];
        let photoUrl;

        if (photoFile) {
          // New photo uploaded
          photoUrl = await uploadToCloudinary(photoFile, 'workshops/lecturers');
        } else if (lecturer.photo?.url) {
          // Existing photo URL in object format
          photoUrl = lecturer.photo.url;
        } else if (typeof lecturer.photo === 'string') {
          // Existing photo URL in string format
          photoUrl = lecturer.photo;
        } else {
          // No photo
          photoUrl = null;
        }

        return {
          name: lecturer.name,
          title: lecturer.title,
          role: lecturer.role,
          photo: photoUrl, // Store as string
          specifications: lecturer.specifications || [],
          order: lecturer.order || 0
        };
      })
    );

    // Create update data
    const updateData = {
      ...workshopData,
      bannerDesktop: bannerDesktopUrl,
      bannerMobile: bannerMobileUrl,
      lecturers, // Now properly formatted
      registration: {
        ...workshopData.registration,
        registeredCount: existingWorkshop.registration?.registeredCount || 0,
      },
      price: workshopData.price || 0,
      duration: {
        total: workshopData.duration?.total || 1,
        unit: workshopData.duration?.unit || 'hours'
      }
    };

    // Update workshop with proper options
    const updatedWorkshop = await Workshop.findByIdAndUpdate(
      workshopId,
      updateData,
      { 
        new: true,
        runValidators: true,
        overwrite: false
      }
    ).populate('departments', 'name shortName');

    // Handle department references
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

    res.json({
      success: true,
      workshop: updatedWorkshop.toObject()
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