import express from 'express';
import Event from '../Models/eventModel.js';
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

// Configure multer for temporary storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

// Upload multiple images
const uploadImages = upload.fields([
  { name: 'bannerDesktop', maxCount: 1 },
  { name: 'bannerMobile', maxCount: 1 }
]);

// Function to upload to Cloudinary
const uploadToCloudinary = async (file, folder = 'events') => {
  try {
    // Convert buffer to base64
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: folder,
      resource_type: 'auto'
    });
    
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Image upload failed');
  }
};

// Get overall stats
router.get('/departments/stats/overall', async (req, res) => {
  try {
    const events = await Event.find();
    const now = new Date();

    const stats = {
      totalEvents: events.length,
      totalRegistrations: events.reduce((sum, event) => sum + (event.registrationCount || 0), 0),
      totalRevenue: events.reduce((sum, event) => 
        sum + ((event.registrationCount || 0) * (parseFloat(event.registrationFee) || 0)), 0),
      totalPrizeMoney: events.reduce((sum, event) => {
        return sum + (event.details?.prizeStructure?.reduce((prizeSum, prize) => 
          prizeSum + (parseFloat(prize.amount) || 0), 0) || 0);
      }, 0),
      activeEvents: events.filter(event => 
        event.status === 'published' && 
        new Date(event.registrationEndTime) > now
      ).length,
      upcomingEvents: events.filter(event => new Date(event.startTime) > now).length,
      completedEvents: events.filter(event => event.status === 'completed').length,
      eventsByStatus: {
        draft: events.filter(event => event.status === 'draft').length,
        published: events.filter(event => event.status === 'published').length,
        completed: events.filter(event => event.status === 'completed').length,
        cancelled: events.filter(event => event.status === 'cancelled').length
      },
      registrationTypes: {
        individual: events.filter(event => event.registrationType === 'individual').length,
        team: events.filter(event => event.registrationType === 'team').length
      }
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get overall stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch overall statistics'
    });
  }
});

// Get all department stats
router.get('/departments/stats', async (req, res) => {
  try {
    const departments = await Department.find().populate('events');
    const now = new Date();

    const departmentStats = await Promise.all(departments.map(async (dept) => {
      const events = dept.events || [];
      
      const stats = {
        totalEvents: events.length,
        totalRegistrations: events.reduce((sum, event) => 
          sum + (event.registrationCount || 0), 0),
        totalRevenue: events.reduce((sum, event) => 
          sum + ((event.registrationCount || 0) * (parseFloat(event.registrationFee) || 0)), 0),
        totalPrizeMoney: events.reduce((sum, event) => {
          return sum + (event.details?.prizeStructure?.reduce((prizeSum, prize) => 
            prizeSum + (parseFloat(prize.amount) || 0), 0) || 0);
        }, 0),
        activeEvents: events.filter(event => 
          event.status === 'published' && 
          new Date(event.registrationEndTime) > now
        ).length,
        upcomingEvents: events.filter(event => 
          new Date(event.startTime) > now
        ).length,
        eventsByStatus: {
          draft: events.filter(event => event.status === 'draft').length,
          published: events.filter(event => event.status === 'published').length,
          completed: events.filter(event => event.status === 'completed').length,
          cancelled: events.filter(event => event.status === 'cancelled').length
        }
      };

      // Update department stats in database
      await Department.findByIdAndUpdate(dept._id, { stats });

      return {
        _id: dept._id,
        name: dept.name,
        shortName: dept.shortName,
        icon: dept.icon,
        color: dept.color,
        stats
      };
    }));

    res.json({
      success: true,
      departments: departmentStats
    });
  } catch (error) {
    console.error('Get department stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch department statistics'
    });
  }
});


const updateDepartmentStats = async (departmentId) => {
  try {
    const department = await Department.findById(departmentId).populate('events');
    if (!department) return;

    const now = new Date();
    const events = department.events;

    const stats = {
      totalRegistrations: events.reduce((sum, event) => sum + (event.registrationCount || 0), 0),
      totalPrizeMoney: events.reduce((sum, event) => {
        return sum + (event.details?.prizeStructure?.reduce((prizeSum, prize) => 
          prizeSum + (parseFloat(prize.amount) || 0), 0) || 0);
      }, 0),
      activeEvents: events.filter(event => 
        event.status === 'published' && 
        new Date(event.registrationEndTime) > now
      ).length,
      completedEvents: events.filter(event => event.status === 'completed').length
    };

    await Department.findByIdAndUpdate(departmentId, { 
      stats,
      totalEvents: events.length
    });
  } catch (error) {
    console.error('Error updating department stats:', error);
  }
};


// Get all events with stats
router.get('/departments/all/events', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('departments', 'name shortName')
      .sort('-createdAt');

    const stats = {
      totalEvents: events.length,
      totalRegistrations: events.reduce((sum, event) => sum + (event.registrationCount || 0), 0),
      totalRevenue: events.reduce((sum, event) => 
        sum + ((event.registrationCount || 0) * (parseFloat(event.registrationFee) || 0)), 0),
      activeEvents: events.filter(event => event.status === 'published').length
    };

    res.json({
      success: true,
      events,
      stats
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events'
    });
  }
});

// Get department-wise events and stats
router.get('/departments/:departmentId/events', async (req, res) => {
  try {
    const { departmentId } = req.params;
    
    // Handle 'all' departments case
    if (departmentId === 'all') {
      const events = await Event.find()
        .populate('departments', 'name shortName')
        .sort('-createdAt');

      const stats = {
        totalEvents: events.length,
        totalRegistrations: events.reduce((sum, event) => sum + (event.registrationCount || 0), 0),
        totalRevenue: events.reduce((sum, event) => 
          sum + ((event.registrationCount || 0) * (parseFloat(event.registrationFee) || 0)), 0),
        activeEvents: events.filter(event => event.status === 'published').length,
        eventsByStatus: {
          draft: events.filter(event => event.status === 'draft').length,
          published: events.filter(event => event.status === 'published').length,
          completed: events.filter(event => event.status === 'completed').length,
          cancelled: events.filter(event => event.status === 'cancelled').length
        },
        upcomingEvents: events.filter(event => new Date(event.startTime) > new Date()).length
      };

      return res.json({
        success: true,
        events,
        stats
      });
    }

    // For specific department
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    const events = await Event.find({ departments: departmentId })
      .populate('departments', 'name shortName')
      .sort('-createdAt');

    const now = new Date();
    
    const stats = {
      totalEvents: events.length,
      totalRegistrations: events.reduce((sum, event) => sum + (event.registrationCount || 0), 0),
      totalPrizeMoney: events.reduce((sum, event) => {
        return sum + (event.details?.prizeStructure?.reduce((prizeSum, prize) => 
          prizeSum + (parseFloat(prize.amount) || 0), 0) || 0);
      }, 0),
      totalRevenue: events.reduce((sum, event) => 
        sum + ((event.registrationCount || 0) * (parseFloat(event.registrationFee) || 0)), 0),
      activeEvents: events.filter(event => 
        event.status === 'published' && 
        new Date(event.registrationEndTime) > now
      ).length,
      eventsByStatus: {
        draft: events.filter(event => event.status === 'draft').length,
        published: events.filter(event => event.status === 'published').length,
        completed: events.filter(event => event.status === 'completed').length,
        cancelled: events.filter(event => event.status === 'cancelled').length
      },
      upcomingEvents: events.filter(event => new Date(event.startTime) > now).length,
      registrationTypes: {
        individual: events.filter(event => event.registrationType === 'individual').length,
        team: events.filter(event => event.registrationType === 'team').length
      },
      averageRegistrationFee: events.length ? 
        events.reduce((sum, event) => sum + (parseFloat(event.registrationFee) || 0), 0) / events.length 
        : 0
    };

    res.json({
      success: true,
      departmentName: department.name,
      events,
      stats
    });
  } catch (error) {
    console.error('Get department events error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch department events'
    });
  }
});

// Get single event details for users
router.get('/departments/:departmentId/events/:eventId', async (req, res) => {
  try {
    const { departmentId, eventId } = req.params;
    const now = new Date();

    const event = await Event.findOne({
      _id: eventId,
      departments: departmentId,
      status: 'published'
    }).populate('departments', 'name shortName icon color');

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    const formattedEvent = {
      eventInfo: {
        id: event._id,
        title: event.title,
        tag: event.tag,
        description: event.details.description,
        department: {
          name: event.departments[0].name,
          shortName: event.departments[0].shortName,
          icon: event.departments[0].icon,
          color: event.departments[0].color
        }
      },
      schedule: {
        startTime: event.startTime,
        duration: event.duration,
        venue: event.details.venue
      },
      registration: {
        type: event.registrationType,
        fee: event.registrationFee,
        endTime: event.registrationEndTime,
        maxTeamSize: event.details.maxTeamSize,
        totalSlots: event.maxRegistrations,
        registeredCount: event.registrationCount,
        remainingSlots: event.maxRegistrations - event.registrationCount,
        status: event.registrationStatus,
        isRegistrationOpen: now <= new Date(event.registrationEndTime) && 
          event.registrationCount < event.maxRegistrations
      },
      rounds: event.rounds.map(round => ({
        number: round.roundNumber,
        name: round.name,
        description: round.description,
        duration: round.duration,
        startTime: round.startTime,
        endTime: round.endTime,
        venue: round.venue,
        sections: round.sections.map(section => ({
          name: section.name,
          description: section.description,
          duration: section.duration,
          requirements: section.requirements
        })),
        requirements: round.requirements,
        specialRules: round.specialRules,
        qualificationCriteria: round.qualificationCriteria,
        status: round.status
      })),
      prizes: {
        totalPrizeMoney: event.details.totalPrizeMoney,
        structure: event.details.prizeStructure.map(prize => ({
          position: prize.position,
          amount: prize.amount,
          description: prize.description
        }))
      },
      coordinators: event.coordinators.map(coord => ({
        name: coord.name,
        email: coord.email,
        phone: coord.phone,
        photo: coord.photo,
        studentId: coord.studentId,
        department: coord.department,
        class: coord.class
      })),
      media: {
        bannerDesktop: event.bannerDesktop || null,
        bannerMobile: event.bannerMobile || null
      }
    };

    res.json({
      success: true,
      event: formattedEvent
    });

  } catch (error) {
    console.error('Get event details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event details'
    });
  }
});


// Create new event
router.post('/departments/:departmentId/events', uploadImages, async (req, res) => {
  try {
    const { departmentId } = req.params;
    const department = await Department.findById(departmentId);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }

    // Upload images to Cloudinary if they exist
    let bannerDesktopUrl = null;
    let bannerMobileUrl = null;

    if (req.files) {
      if (req.files.bannerDesktop) {
        bannerDesktopUrl = await uploadToCloudinary(
          req.files.bannerDesktop[0], 
          'events/desktop'
        );
      }
      if (req.files.bannerMobile) {
        bannerMobileUrl = await uploadToCloudinary(
          req.files.bannerMobile[0], 
          'events/mobile'
        );
      }
    }

    // Parse the event data
    const eventData = JSON.parse(req.body.eventData);

    // Process rounds data with sections
    const processedRounds = eventData.rounds.map(round => ({
      ...round,
      sections: round.sections.map(section => ({
        ...section,
        requirements: Array.isArray(section.requirements) ? section.requirements : []
      })),
      requirements: Array.isArray(round.requirements) ? round.requirements : [],
      specialRules: Array.isArray(round.specialRules) ? round.specialRules : []
    }));

    // Create new event
    const event = new Event({
      ...eventData,
      departments: [departmentId],
      bannerDesktop: bannerDesktopUrl,
      bannerMobile: bannerMobileUrl,
      registrationCount: 0,
      registrationFee: parseFloat(eventData.registrationFee) || 0,
      maxRegistrations: parseFloat(eventData.maxRegistrations) || null,
      rounds: processedRounds,
      details: {
        ...eventData.details,
        maxTeamSize: parseFloat(eventData.details?.maxTeamSize) || 1,
        prizeStructure: eventData.details?.prizeStructure?.map(prize => ({
          ...prize,
          amount: parseFloat(prize.amount) || 0,
          position: parseFloat(prize.position) || 0
        })) || []
      },
      status: eventData.status || 'draft'
    });

    await event.save();

    // Update department events array
    department.events.push(event._id);
    await department.save();
    
    // Update department stats
    await updateDepartmentStats(departmentId);

    const populatedEvent = await Event.findById(event._id)
      .populate('departments', 'name shortName');

    res.status(201).json({
      success: true,
      event: populatedEvent
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to create event: ' + error.message
    });
  }
});

// Update event
router.put('/departments/:departmentId/events/:eventId', uploadImages, async (req, res) => {
  try {
    const { departmentId, eventId } = req.params;

    // Get existing event
    const existingEvent = await Event.findOne({ 
      _id: eventId, 
      departments: departmentId 
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Handle image uploads
    let bannerDesktopUrl = existingEvent.bannerDesktop;
    let bannerMobileUrl = existingEvent.bannerMobile;

    if (req.files) {
      if (req.files.bannerDesktop) {
        // Delete old desktop banner if it exists
        if (existingEvent.bannerDesktop) {
          const publicId = existingEvent.bannerDesktop.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        }
        bannerDesktopUrl = await uploadToCloudinary(
          req.files.bannerDesktop[0], 
          'events/desktop'
        );
      }
      if (req.files.bannerMobile) {
        // Delete old mobile banner if it exists
        if (existingEvent.bannerMobile) {
          const publicId = existingEvent.bannerMobile.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        }
        bannerMobileUrl = await uploadToCloudinary(
          req.files.bannerMobile[0], 
          'events/mobile'
        );
      }
    }

    // Parse event data
    const eventData = JSON.parse(req.body.eventData);

    // Process rounds data with sections
    const processedRounds = eventData.rounds.map(round => ({
      ...round,
      sections: round.sections.map(section => ({
        ...section,
        requirements: Array.isArray(section.requirements) ? section.requirements : []
      })),
      requirements: Array.isArray(round.requirements) ? round.requirements : [],
      specialRules: Array.isArray(round.specialRules) ? round.specialRules : []
    }));

    // Update event
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, departments: departmentId },
      {
        ...eventData,
        bannerDesktop: bannerDesktopUrl,
        bannerMobile: bannerMobileUrl,
        rounds: processedRounds,
        details: {
          ...eventData.details,
          maxTeamSize: parseFloat(eventData.details?.maxTeamSize) || 1,
          prizeStructure: eventData.details?.prizeStructure?.map(prize => ({
            ...prize,
            amount: parseFloat(prize.amount) || 0,
            position: parseFloat(prize.position) || 0
          })) || []
        }
      },
      { new: true, runValidators: true }
    ).populate('departments', 'name shortName');

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Update department stats
    await updateDepartmentStats(departmentId);

    res.json({
      success: true,
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to update event: ' + error.message
    });
  }
});

// Delete event
router.delete('/departments/:departmentId/events/:eventId', async (req, res) => {
  try {
    const { departmentId, eventId } = req.params;

    // Handle the "All Departments" case
    let department;
    if (departmentId === 'All Departments') {
      // Find the event first
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found'
        });
      }

      // Update all departments that reference this event
      const departments = await Department.find({ events: eventId });
      await Promise.all(departments.map(async (dept) => {
        dept.events.pull(eventId);
        await dept.save();
        await updateDepartmentStats(dept._id);
      }));

      // Delete the event
      await event.deleteOne();

      return res.json({
        success: true,
        message: 'Event deleted successfully from all departments'
      });
    }

    // Regular single department case
    department = await Department.findById(departmentId);
    const event = await Event.findOne({ 
      _id: eventId, 
      departments: departmentId 
    });

    if (!department || !event) {
      return res.status(404).json({
        success: false,
        error: department ? 'Event not found' : 'Department not found'
      });
    }

    // Remove event reference from department
    department.events.pull(eventId);
    await department.save();

    // Delete the event
    await event.deleteOne();

    // Update department stats
    await updateDepartmentStats(departmentId);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete event: ' + error.message
    });
  }
});

export default router;