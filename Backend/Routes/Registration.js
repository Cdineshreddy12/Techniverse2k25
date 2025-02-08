import express from 'express';
import { kindeMiddleware } from '../KindeAuth.js';
import { Student } from '../Models/StudentSchema.js';

const router = express.Router();

// Validation middleware
const validateRegistrationData = (req, res, next) => {
    const { 
        kindeId, 
        name, 
        email, 
        mobileNumber,
        registrationType
    } = req.body;

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
router.post('/register', 
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

            if (verifiedKindeId !== req.body.kindeId) {
                return res.status(403).json({ 
                    error: 'Unauthorized: KindeID mismatch',
                    details: 'The provided KindeID does not match the authenticated user'
                });
            }

            const registrationData = {
                kindeId: req.body.kindeId,
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
                { kindeId: req.body.kindeId },
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

// Enhanced user fetch endpoint
router.get('/user/:kindeId', kindeMiddleware, async (req, res) => {
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