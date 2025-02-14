import express from 'express';
import { kindeMiddleware } from '../KindeAuth.js';
import { Student } from '../Models/StudentSchema.js';
import { Registration } from '../Models/RegistrationSchema.js';
const router = express.Router();

// Validation middleware
const validateRegistrationData = (req, res, next) => {
    const { 
        name,  // Add name validation
        email, 
        mobileNumber,
        registrationType
    } = req.body;

    // Name validation
    if (!name || name.trim().length < 2) {
        return res.status(400).json({
            error: 'Name is required and must be at least 2 characters'
        });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({
            error: 'Invalid email format'
        });
    }

    // Mobile number validation
    const mobileRegex = /^\+?[\d\s-]{10,}$/;
    if (!mobileNumber || !mobileRegex.test(mobileNumber)) {
        return res.status(400).json({
            error: 'Invalid mobile number format'
        });
    }

    // Registration type validation
    const validTypes = ['student', 'other'];
    if (!registrationType || !validTypes.includes(registrationType)) {
        return res.status(400).json({
            error: 'Invalid registration type'
        });
    }

    next();
};

// Enhanced registration endpoint
router.post('/users/register', 
    kindeMiddleware, 
    validateRegistrationData,
    async (req, res) => {
        try {
            const verifiedKindeId = req.user.id;
            const requestTime = new Date().toISOString();
            
            console.log('Registration attempt:', {
                timestamp: requestTime,
                verifiedId: verifiedKindeId,
                requestBody: {
                    ...req.body,
                    // Exclude sensitive fields from logging
                    mobileNumber: '[REDACTED]',
                    email: '[REDACTED]'
                }
            });

            // Use the verified Kinde ID instead of expecting it in the request
            const registrationData = {
                kindeId: verifiedKindeId, // Use the verified ID from the token
                name: req.body.name.trim(),
                email: req.body.email.toLowerCase().trim(),
                mobileNumber: req.body.mobileNumber,
                registrationType: req.body.registrationType,
                registrationComplete: true, 
                lastUpdated: new Date(),
                ...(req.body.registrationType === 'student' 
                    ? { 
                        collegeId: req.body.collegeId?.trim(),
                        branch: req.body.branch?.trim(),
                        collegeName: undefined
                    }
                    : { 
                        collegeName: req.body.collegeName?.trim(),
                        collegeId: undefined,
                        branch: undefined
                    }
                )
            };

            const user = await Student.findOneAndUpdate(
                { kindeId: verifiedKindeId }, // Use verified ID here
                registrationData,
                { 
                    upsert: true, 
                    new: true,
                    runValidators: true,
                    setDefaultsOnInsert: true
                }
            );

            console.log('Registration successful:', {
                timestamp: new Date().toISOString(),
                kindeId: user.kindeId,
                registrationType: user.registrationType
            });

            res.json({
                success: true,
                user: {
                    kindeId: user.kindeId,
                    name: user.name,
                    email: user.email,
                    registrationType: user.registrationType,
                    ...(user.registrationType === 'student' 
                        ? { 
                            collegeId: user.collegeId,
                            branch: user.branch
                        }
                        : { 
                            collegeName: user.collegeName
                        }
                    )
                }
            });
        } catch (error) {
            console.error('Registration error:', {
                timestamp: new Date().toISOString(),
                error: error.message,
                stack: error.stack
            });

            // Handle specific MongoDB errors
            if (error.code === 11000) {
                return res.status(409).json({
                    error: 'User already exists',
                    details: 'A user with this KindeID is already registered'
                });
            }

            res.status(500).json({ 
                error: 'Registration failed',
                details: process.env.NODE_ENV === 'development' 
                    ? error.message 
                    : 'An unexpected error occurred'
            });
        }
    }
);

// Get latest registration for a user
router.get('/users/:kindeId/registrations/latest', kindeMiddleware, async (req, res) => {
    try {
        const verifiedKindeId = req.user.id;

        // Verify user authorization
        if (verifiedKindeId !== req.params.kindeId) {
            return res.status(403).json({ 
                error: 'Unauthorized access',
                details: 'You can only access your own registration data'
            });
        }

        // Find the student first
        const student = await Student.findOne({ kindeId: verifiedKindeId });
        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }

        // Find latest registration with expanded event details
        const registration = await Registration.findOne({ 
            student: student._id 
        })
        .sort({ createdAt: -1 })
        .populate([
            {
                path: 'selectedEvents.eventId',
                model: 'Event',
                select: 'title tag description venue startTime registrationEndTime duration details rounds status'
            },
            {
                path: 'selectedWorkshops.workshopId',
                model: 'Workshop',
                select: 'name description venue workshopDate price instructor'
            }
        ]);

        if (!registration) {
            return res.status(404).json({
                success: false,
                error: 'No registration found'
            });
        }

        // Transform data with complete event information
        const transformedRegistration = {
            ...registration.toObject(),
            student: {
                name: student.name,
                email: student.email,
                collegeId: student.collegeId,
                branch: student.branch,
                collegeName: student.collegeName,
                registrationType: student.registrationType
            },
            selectedEvents: registration.selectedEvents.map(event => ({
                eventId: event.eventId._id,
                eventName: event.eventId.title,
                type: event.eventId.tag,
                status: event.status,
                venue: event.eventId.venue,
                eventDate: event.eventId.startTime,
                description: event.eventId.description,
                duration: event.eventId.duration,
                details: event.eventId.details,
                rounds: event.eventId.rounds
            })),
            selectedWorkshops: registration.selectedWorkshops.map(workshop => ({
                workshopId: workshop.workshopId._id,
                workshopName: workshop.workshopId.name,
                status: workshop.status,
                venue: workshop.workshopId.venue,
                workshopDate: workshop.workshopId.workshopDate,
                price: workshop.workshopId.price,
                instructor: workshop.workshopId.instructor,
                description: workshop.workshopId.description
            }))
        };

        res.json({
            success: true,
            registration: transformedRegistration
        });

    } catch (error) {
        console.error('Error fetching registration:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch registration details'
        });
    }
});

// Get specific registration by orderId
router.get('/registration/:orderId', kindeMiddleware, async (req, res) => {
    try {
        const verifiedKindeId = req.user.id;

        // Find registration and populate related data with expanded selection
        const registration = await Registration.findOne({ 
            'paymentDetails.orderId': req.params.orderId 
        })
        .populate([
            {
                path: 'student',
                model: 'Student',
                select: 'kindeId name email collegeId branch collegeName registrationType'
            },
            {
                path: 'selectedEvents.eventId',
                model: 'Event',
                select: 'title tag description venue startTime registrationEndTime duration details rounds status'
            },
            {
                path: 'selectedWorkshops.workshopId',
                model: 'Workshop',
                select: 'name description venue workshopDate price instructor'
            }
        ]);

        if (!registration) {
            return res.status(404).json({
                success: false,
                error: 'Registration not found'
            });
        }

        // Verify user authorization
        if (registration.student.kindeId !== verifiedKindeId) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized access'
            });
        }

        // Transform data for frontend with more complete event details
        const transformedRegistration = {
            _id: registration._id,
            orderId: registration.paymentDetails.orderId,
            createdAt: registration.createdAt,
            paymentStatus: registration.paymentStatus,
            paymentCompletedAt: registration.paymentCompletedAt,
            amount: registration.amount,
            qrCode: registration.qrCode,
            combo: registration.combo,
            student: {
                name: registration.student.name,
                email: registration.student.email,
                collegeId: registration.student.collegeId,
                branch: registration.student.branch,
                collegeName: registration.student.collegeName,
                registrationType: registration.student.registrationType
            },
            selectedEvents: registration.selectedEvents.map(event => ({
                eventId: event.eventId._id,
                eventName: event.eventId.title, // Using title from the event
                type: event.eventId.tag,
                status: event.status,
                venue: event.eventId.venue,
                eventDate: event.eventId.startTime,
                description: event.eventId.description,
                duration: event.eventId.duration,
                details: event.eventId.details,
                rounds: event.eventId.rounds
            })),
            selectedWorkshops: registration.selectedWorkshops.map(workshop => ({
                workshopId: workshop.workshopId._id,
                workshopName: workshop.workshopId.name,
                status: workshop.status,
                venue: workshop.workshopId.venue,
                workshopDate: workshop.workshopId.workshopDate,
                price: workshop.workshopId.price,
                instructor: workshop.workshopId.instructor,
                description: workshop.workshopId.description
            })),
            paymentDetails: {
                ...registration.paymentDetails,
                customerDetails: registration.paymentDetails.customerDetails || {}
            }
        };

        res.json({
            success: true,
            registration: transformedRegistration
        });

    } catch (error) {
        console.error('Error fetching registration:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch registration details'
        });
    }
});


// Get all registrations for a user
router.get('/users/:kindeId/registrations', kindeMiddleware, async (req, res) => {
    try {
        const verifiedKindeId = req.user.id;

        // Verify user authorization
        if (verifiedKindeId !== req.params.kindeId) {
            return res.status(403).json({ 
                error: 'Unauthorized access',
                details: 'You can only access your own registrations'
            });
        }

        // Find the student first
        const student = await Student.findOne({ kindeId: verifiedKindeId });
        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }

        // Find all registrations for the user
        const registrations = await Registration.find({ 
            student: student._id 
        })
        .sort({ createdAt: -1 })
        .populate([
            {
                path: 'selectedEvents.eventId',
                model: 'Event',
                select: 'name description venue eventDate price'
            },
            {
                path: 'selectedWorkshops.workshopId',
                model: 'Workshop',
                select: 'name description venue workshopDate price instructor'
            }
        ]);

        const transformedRegistrations = registrations.map(reg => ({
            _id: reg._id,
            createdAt: reg.createdAt,
            paymentStatus: reg.paymentStatus,
            amount: reg.amount,
            qrCode: reg.qrCode,
            combo: reg.combo,
            selectedEvents: reg.selectedEvents.map(event => ({
                eventId: event.eventId._id,
                eventName: event.eventId.name,
                status: event.status,
                eventDate: event.eventId.eventDate
            })),
            selectedWorkshops: reg.selectedWorkshops.map(workshop => ({
                workshopId: workshop.workshopId._id,
                workshopName: workshop.workshopId.name,
                status: workshop.status,
                workshopDate: workshop.workshopId.workshopDate
            }))
        }));

        res.json({
            success: true,
            registrations: transformedRegistrations
        });

    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch registrations'
        });
    }
});


  
// Enhanced user fetch endpoint
router.get('/users/:kindeId', kindeMiddleware, async (req, res) => {
  try {
      const verifiedKindeId = req.user.id;
      const requestTime = new Date().toISOString();

      if (verifiedKindeId !== req.params.kindeId) {
          return res.status(403).json({ 
              error: 'Unauthorized access',
              details: 'You can only access your own user data'
          });
      }

      // Try to find existing user
      let user = await Student.findOne({ kindeId: req.params.kindeId })
          .select('-__v -_id');

      // If user doesn't exist, create initial record
      if (!user) {
          user = await Student.create({
              kindeId: verifiedKindeId,
              registrationComplete: false
          });
          
          console.log('Created initial user record:', {
              timestamp: new Date().toISOString(),
              kindeId: verifiedKindeId
          });

          return res.status(202).json({
              needsRegistration: true,
              user: {
                  kindeId: user.kindeId,
                  registrationComplete: false
              }
          });
      }

      // Check if registration is complete
      const isRegistrationComplete = user.name && user.email && user.mobileNumber;
      if (!isRegistrationComplete) {
          return res.status(202).json({
              needsRegistration: true,
              user: {
                  kindeId: user.kindeId,
                  registrationComplete: false
              }
          });
      }

      // Return complete user data
      res.json({
          success: true,
          user: {
              kindeId: user.kindeId,
              name: user.name,
              email: user.email,
              registrationType: user.registrationType,
              ...(user.registrationType === 'student' 
                  ? { 
                      collegeId: user.collegeId,
                      branch: user.branch
                  }
                  : { 
                      collegeName: user.collegeName
                  }
              )
          }
      });
  } catch (error) {
      console.error('User fetch error:', {
          timestamp: new Date().toISOString(),
          error: error.message,
          stack: error.stack
      });

      res.status(500).json({ 
          error: 'Failed to fetch user'
      });
  }
});

export default router;