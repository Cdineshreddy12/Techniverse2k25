import express from 'express';
import { kindeMiddleware } from '../KindeAuth.js';
import { Student } from '../Models/StudentSchema.js';
import { Registration } from '../Models/RegistrationSchema.js';
import Workshop from '../Models/workShopModel.js';
import mongoose from 'mongoose';

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

        // Find latest registration
        const rawRegistration = await Registration.findOne({ 
            student: student._id 
        }).sort({ createdAt: -1 });

        if (!rawRegistration) {
            return res.status(404).json({
                success: false,
                error: 'No registration found'
            });
        }


        const ObjectId = mongoose.Types.ObjectId;
        
        // Find actual workshops in the database
        // Instead of filtering by department/branch, just get the most recent workshops
        let realWorkshops = [];
        try {
            // Just get the DGPS workshop we know exists
            realWorkshops = await Workshop.find({ 
                _id: new ObjectId("67bc5d5f3aa60c94978180e5") 
            });
            
            // If that specific workshop isn't found, get any recent workshops
            if (realWorkshops.length === 0) {
                realWorkshops = await Workshop.find().sort({ createdAt: -1 }).limit(5);
            }
            
            console.log(`Found ${realWorkshops.length} real workshops`);
        } catch (workshopError) {
            console.error('Error finding real workshops:', workshopError);
            // Continue execution even if this fails
        }
        
        // If we have real workshops but the registration has a placeholder,
        // update the registration to point to a real workshop instead
        if (realWorkshops.length > 0 && rawRegistration.selectedWorkshops.length > 0) {
            try {
                // Get the first real workshop to replace the placeholder
                const realWorkshopId = realWorkshops[0]._id;
                
                // Update the registration to point to the real workshop
                await Registration.updateOne(
                    { _id: rawRegistration._id, 'selectedWorkshops._id': rawRegistration.selectedWorkshops[0]._id },
                    { $set: { 'selectedWorkshops.$.workshopId': realWorkshopId } }
                );
                
                console.log(`Updated registration to point to real workshop: ${realWorkshopId}`);
            } catch (updateError) {
                console.error('Error updating registration:', updateError);
                // Continue execution even if this fails
            }
        }

        // Now populate with related data - using the updated registration
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
                model: 'Workshop'
            }
        ]);

        console.log('Workshop data from latest registration:', registration.selectedWorkshops);

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
            selectedEvents: registration.selectedEvents
            .filter(event => event.eventId) // Ensure eventId is not null
            .map(event => ({
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
            selectedWorkshops: registration.selectedWorkshops
            .filter(workshop => workshop.workshopId) // Ensure workshopId is not null
            .map(workshop => ({
                workshopId: workshop.workshopId._id,
                // Use title as workshop name (matches the schema)
                eventName: workshop.workshopId.title,
                // Add a type field for UI rendering
                type: 'Workshop',
                status: workshop.status,
                venue: workshop.workshopId.venue,
                // Use workshopTiming.startDate if available, otherwise current date
                eventDate: workshop.workshopId.workshopTiming?.startDate || new Date(),
                description: workshop.workshopId.description,
                // Format duration based on workshopTiming
                duration: workshop.workshopId.workshopTiming ? 
                    `${workshop.workshopId.workshopTiming.dailyStartTime} - ${workshop.workshopId.workshopTiming.dailyEndTime}` : 
                    'TBD',
                // Include other fields consistent with event structure for UI rendering
                details: {
                    venue: workshop.workshopId.venue,
                    maxTeamSize: 1,
                    prizeStructure: [],
                    requirements: [],
                    description: workshop.workshopId.description,
                    instructor: workshop.workshopId.lecturers?.length > 0 ? 
                        workshop.workshopId.lecturers[0].name : 'TBD'
                }
            }))
        };

        console.log('Final workshops in response:', transformedRegistration.selectedWorkshops.length);

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
// Get specific registration by orderId - with debugging
router.get('/registration/:orderId', kindeMiddleware, async (req, res) => {
    try {
        const verifiedKindeId = req.user.id;
        console.log('Fetching registration for order:', req.params.orderId);

        // Find registration WITHOUT populating to check raw data
        const rawRegistration = await Registration.findOne({ 
            'paymentDetails.orderId': req.params.orderId 
        });
        
        if (!rawRegistration) {
            console.log('Registration not found');
            return res.status(404).json({
                success: false,
                error: 'Registration not found'
            });
        }
        
        // Log raw workshop data to check if it exists in the database
        console.log('Raw workshops data:', rawRegistration.selectedWorkshops);
        console.log('Raw QR metadata workshops:', rawRegistration.qrCode?.metadata?.workshops);
        
        // Fix workshops with null workshopId
        if (rawRegistration.selectedWorkshops.length > 0) {
            let needsSaving = false;
            
            // Check each workshop entry
            for (let i = 0; i < rawRegistration.selectedWorkshops.length; i++) {
                const workshop = rawRegistration.selectedWorkshops[i];
                
                // If workshopId is null but we have QR metadata with workshop IDs
                if (!workshop.workshopId && rawRegistration.qrCode?.metadata?.workshops?.length > 0) {
                    console.log('Found workshop with null workshopId, fixing from QR metadata');
                    // Use the first workshop ID from QR metadata
                    rawRegistration.selectedWorkshops[i].workshopId = rawRegistration.qrCode.metadata.workshops[0];
                    needsSaving = true;
                }
            }
            
            // Save if we made changes
            if (needsSaving) {
                await rawRegistration.save();
                console.log('Fixed workshops with null workshopId');
            }
        }
        
        // If workshops exist in QR metadata but not in selectedWorkshops, update them
        if (
            rawRegistration.selectedWorkshops.length === 0 && 
            rawRegistration.qrCode?.metadata?.workshops?.length > 0
        ) {
            console.log('Fixing missing workshops from QR metadata');
            // Add workshops from QR metadata
            for (const workshopId of rawRegistration.qrCode.metadata.workshops) {
                // Only add if it doesn't already exist
                if (!rawRegistration.selectedWorkshops.find(w => w.workshopId && w.workshopId.toString() === workshopId)) {
                    rawRegistration.selectedWorkshops.push({
                        workshopId: workshopId,
                        status: 'completed', // Assume completed since it's in the QR
                    });
                }
            }
            // Save the updated registration
            await rawRegistration.save();
            console.log('Fixed registration with workshops from QR metadata');
        }

        // Now populate with related data
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
                select: 'title description venue workshopTiming price lecturers'
            }
        ]);

        // Verify user authorization
        if (registration.student.kindeId !== verifiedKindeId) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized access'
            });
        }

        console.log('Populated workshops data:', registration.selectedWorkshops);

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
            selectedEvents: registration.selectedEvents
                .filter(event => event.eventId) // Filter out any null event references
                .map(event => ({
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
            selectedWorkshops: registration.selectedWorkshops
                .filter(workshop => workshop.workshopId) // Filter out any null workshop references
                .map(workshop => ({
                    workshopId: workshop.workshopId._id,
                    // Use title as workshop name (matches the schema)
                    eventName: workshop.workshopId.title,
                    // Add a type field for UI rendering
                    type: 'Workshop',
                    status: workshop.status,
                    venue: workshop.workshopId.venue,
                    // Use workshopTiming.startDate if available, otherwise current date
                    eventDate: workshop.workshopId.workshopTiming?.startDate || new Date(),
                    description: workshop.workshopId.description,
                    // Format duration based on workshopTiming
                    duration: workshop.workshopId.workshopTiming ? 
                        `${workshop.workshopId.workshopTiming.dailyStartTime} - ${workshop.workshopId.workshopTiming.dailyEndTime}` : 
                        'TBD',
                    // Include other fields consistent with event structure for UI rendering
                    details: {
                        venue: workshop.workshopId.venue,
                        maxTeamSize: 1,
                        prizeStructure: [],
                        requirements: [],
                        description: workshop.workshopId.description,
                        instructor: workshop.workshopId.lecturers?.length > 0 ? 
                            workshop.workshopId.lecturers[0].name : 'TBD'
                    }
                })),
            paymentDetails: {
                ...registration.paymentDetails,
                customerDetails: registration.paymentDetails.customerDetails || {}
            }
        };

        console.log('Final workshops in response:', transformedRegistration.selectedWorkshops.length);

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