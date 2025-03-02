// routes/paymentRoutes.js
import express from 'express';
import Razorpay from 'razorpay';
import { Student } from '../Models/StudentSchema.js';
import { Registration } from '../Models/RegistrationSchema.js';
import Event from '../Models/eventModel.js';
import Workshop from '../Models/workShopModel.js';
import dotenv from 'dotenv';
import { generateQRCode } from './QRRoutes.js';
import { sendConfirmationEmail } from '../index.js';
import crypto from 'crypto';
import mongoose from 'mongoose'
dotenv.config();

const router = express.Router();

const validateEnvironment = () => {
  if (!process.env.RAZORPAY_SECRET_KEY) {
    throw new Error('Missing required environment variable: RAZORPAY_SECRET_KEY');
  }
};

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY
});

// Package configuration remains the same
const PACKAGES = {
    'rgukt-workshop': { price: 199, type: 'rgukt' },
    'rgukt-all-events': { price: 199, type: 'rgukt' },
    'rgukt-combo': { price: 299, type: 'rgukt' },
    'guest-workshop': { price: 499, type: 'guest' },
    'guest-all-events': { price: 499, type: 'guest' },
    'guest-combo': { price: 599, type: 'guest' }
};

// Helper function to verify Razorpay signature
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
      .update(body)
      .digest('hex');
  
  // Add debugging for signature verification
  console.log('Verifying signature:');
  console.log('Order ID:', orderId);
  console.log('Payment ID:', paymentId);
  console.log('Received signature:', signature);
  console.log('Expected signature:', expectedSignature);
  
  return expectedSignature === signature;
};

// Tampering detection middleware remains mostly the same
const detectTampering = async (req, res, next) => {
    try {
        const { cartItems = [], combo, kindeId, workshops = [] } = req.body;

        // Timestamp verification
        const timestamp = Date.now();
        const maxAge = 5 * 60 * 1000; // 5 minutes
        if (timestamp - req.body.timestamp > maxAge) {
            throw new Error('Request expired');
        }

        // Generate request signature
        const requestSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
            .update(`${kindeId}:${combo.id}:${timestamp}`)
            .digest('base64');

        req.requestSignature = requestSignature;

        // 1. Verify student exists
        const student = await Student.findOne({ kindeId });
        if (!student) {
            throw new Error('Student not found');
        }

        // 2. Verify active combo
        if (!student.activeCombo || student.activeCombo.id !== combo.id) {
            console.error('Package tampering detected:', {
                requestedCombo: combo.id,
                activeCombo: student.activeCombo?.id,
                kindeId
            });
            throw new Error('Invalid package selection');
        }

        // 3. Price verification
        const packageConfig = PACKAGES[combo.id];
        if (packageConfig.price !== student.activeCombo.price) {
            console.error('Price mismatch:', {
                storedPrice: student.activeCombo.price,
                packagePrice: packageConfig.price
            });
            throw new Error('Invalid package price');
        }

        // 4. Cart verification
        const dbCartIds = student.cart.map(item => item.eventId.toString()).sort();
        const requestCartIds = cartItems.map(item => (item.id || item.eventId || '').toString()).sort();

        if (JSON.stringify(dbCartIds) !== JSON.stringify(requestCartIds)) {
            console.error('Cart tampering detected:', {
                storedCart: dbCartIds,
                requestCart: requestCartIds,
                kindeId
            });
            throw new Error('Cart verification failed');
        }

        // 5. Institution verification
        const studentEmail = (student.email || '').toLowerCase().trim();
        const rguktRegex = /@(rguktsklm|rguktn|rguktrkv|rguktong)\.ac\.in$/i;
        const isRGUKTStudent = rguktRegex.test(studentEmail);
        const comboId = (combo.id || '').trim();
        const validPrefix = isRGUKTStudent ? 'rgukt-' : 'guest-';

        if (!comboId.startsWith(validPrefix)) {
            console.error('Institution type mismatch:', {
                studentEmail,
                attemptedCombo: comboId,
                kindeId,
                isRGUKTStudent,
                validPrefix
            });
            throw new Error('Invalid package for your institution');
        }

        // 6. Package type validation
        const dbWorkshops = student.workshops || [];
        if (combo.id.includes('all-events')) {
            if (dbWorkshops.length > 0 || workshops.length > 0) {
                throw new Error('Events package cannot include workshops');
            }
        } 
        else if (combo.id.includes('workshop') && !combo.id.includes('combo')) {
            if (student.cart.length > 0 || cartItems.length > 0) {
                throw new Error('Workshop package cannot include events');
            }
            if (dbWorkshops.length !== 1 || workshops.length !== 1) {
                throw new Error('Workshop package requires exactly one workshop');
            }
        }
        else if (combo.id.includes('combo')) {
            if (dbWorkshops.length !== 1 || workshops.length !== 1) {
                throw new Error('Combo package requires exactly one workshop');
            }
            if (student.cart.length === 0 || cartItems.length === 0) {
                throw new Error('Combo package requires at least one event');
            }
        }

        // 7. Attach validated data
        req.validatedData = {
            student,
            packageConfig,
            verifiedPrice: packageConfig.price,
            cartValidation: {
                eventsCount: student.cart.length,
                workshopsCount: dbWorkshops.length,
                studentType: validPrefix.slice(0, -1),
                originalCombo: student.activeCombo
            }
        };

        next();
    } catch (error) {
        console.error('Payment validation failed:', error);
        res.status(400).json({
            success: false,
            error: 'Payment validation failed'
        });
    }
};

// Transaction wrapper function
const withTransaction = async (operations) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
      const result = await operations(session);
      await session.commitTransaction();
      return result;
  } catch (error) {
      await session.abortTransaction();
      throw error;
  } finally {
      session.endSession();
  }
};


const validateSlotAvailability = async (cartItems = [], workshops = [], session) => {
  const validationErrors = [];
  
  // Validate event slots
  if (cartItems.length > 0) {
    const eventIds = cartItems.map(item => item.eventId || item.id);
    
    // Fetch current event registration counts and status - update fields being fetched
    const events = await Event.find({ 
      _id: { $in: eventIds } 
    }, 'eventInfo.title maxRegistrations registrationCount registrationEndTime status').session(session);
    
    // Check each event's availability
    for (const event of events) {
      const now = new Date();
      
      // Check if registration is closed
      if (event.status === 'cancelled' || 
          event.status === 'completed' || 
          now > new Date(event.registrationEndTime)) {
        validationErrors.push({
          type: 'event',
          id: event._id,
          name: event.eventInfo?.title || 'Event',
          error: 'Registration closed',
          reason: 'closed'
        });
      }
      // Then check if slots are available - use maxRegistrations instead of registration.totalSlots
      else if (event.registrationCount >= event.maxRegistrations) {
        validationErrors.push({
          type: 'event',
          id: event._id,
          name: event.eventInfo?.title || 'Event',
          error: 'No slots available',
          reason: 'sold_out'
        });
      }
    }
  }
  
  // Validate workshop slots and status - This part is correct
  if (workshops.length > 0) {
    const workshopIds = workshops.map(workshop => workshop.id || workshop.workshopId);
    
    // Fetch current workshop data
    const workshopsData = await Workshop.find({
      _id: { $in: workshopIds }
    }, 'title registration.totalSlots registration.registeredCount registrationEndTime status').session(session);
    
    // Check each workshop's availability
    for (const workshop of workshopsData) {
      const now = new Date();
      
      // Check if registration is closed
      if (workshop.status === 'cancelled' || 
          workshop.status === 'completed' || 
          now > new Date(workshop.registrationEndTime)) {
        validationErrors.push({
          type: 'workshop',
          id: workshop._id,
          name: workshop.title || 'Workshop',
          error: 'Registration closed',
          reason: 'closed'
        });
      }
      // Then check if slots are available
      else if (workshop.registration.registeredCount >= workshop.registration.totalSlots) {
        validationErrors.push({
          type: 'workshop',
          id: workshop._id,
          name: workshop.title || 'Workshop',
          error: 'No slots available',
          reason: 'sold_out'
        });
      }
    }
  }
  
  return validationErrors;
};  

const checkAvailabilityBeforePayment = async (req, res, next) => {
  try {
    const { cartItems = [], workshops = [] } = req.body;
    
    if (cartItems.length === 0 && workshops.length === 0) {
      throw new Error('Cart is empty');
    }
    
    // Perform quick availability check before entering transaction
    const validationErrors = await validateSlotAvailability(cartItems, workshops);
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Some items in your cart are no longer available',
        validationErrors
      });
    }
    
    next();
  } catch (error) {
    console.error('Pre-payment availability check failed:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Payment validation failed'
    });
  }
};


// Payment initiation route
router.post('/payment/initiate', detectTampering, checkAvailabilityBeforePayment, async (req, res) => {
  try {
    const { student, packageConfig, verifiedPrice, cartValidation } = req.validatedData;
    const { workshops = [], platformFee = 0, totalAmount = 0 } = req.body;

    // Validate platform fee calculation (should be approximately 2% of baseAmount)
    const expectedPlatformFee = Math.ceil(verifiedPrice * 0.02); // 2% rounded up
    
    // Use the platform fee from the request if it's close to the expected value
    // Otherwise use our server-calculated value for security
    const finalPlatformFee = Math.abs(platformFee - expectedPlatformFee) <= 1 ? 
                             platformFee : expectedPlatformFee;

    // Calculate the final total amount
    const finalTotalAmount = verifiedPrice + finalPlatformFee;
    
    console.log('Payment initiation with frontend workshops and fees:', {
        workshops,
        baseAmount: verifiedPrice,
        requestPlatformFee: platformFee,
        finalPlatformFee,
        finalTotalAmount
    });

    const result = await withTransaction(async (session) => {
        // Double-check availability within transaction to prevent race conditions
        const validationErrors = await validateSlotAvailability(student.cart, workshops, session);
        
        if (validationErrors.length > 0) {
          // If validation fails inside transaction, throw error
          throw new Error(JSON.stringify({
            message: 'Some items in your cart are no longer available',
            validationErrors
          }));
        }
        
        const timestamp = Date.now().toString(36);
        const userIdSuffix = student.kindeId.slice(-4);
        const orderId = `ord_${timestamp}_${userIdSuffix}`;

        // Use workshops from the request body
        const selectedWorkshops = workshops.map(workshop => ({
          workshopId: workshop.id || workshop.workshopId, // Accept either format
          workshopName: workshop.title || workshop.workshopName || 'Workshop',
          status: 'pending'
        }));

        // Create registration record with platform fee details
        const registration = await Registration.create([{
            student: student._id,
            kindeId: student.kindeId,
            selectedEvents: student.cart.map(item => ({
                eventId: item.eventId,
                eventName: item.title || '',
                status: 'pending',
                registrationType: 'individual',
                maxTeamSize: 1
            })),
            selectedWorkshops: selectedWorkshops,
            amount: verifiedPrice, // Base package price
            platformFee: finalPlatformFee, // Store platform fee separately
            totalAmount: finalTotalAmount, // Total including platform fee
            paymentStatus: 'pending',
            paymentInitiatedAt: new Date(),
            paymentDetails: {
                orderId,
                customerDetails: {
                    name: student.name,
                    email: student.email,
                    phone: student.mobileNumber
                },
                merchantParams: {
                    comboId: cartValidation.originalCombo.id,
                    comboName: cartValidation.originalCombo.name,
                    verificationData: cartValidation,
                    selectedWorkshopIds: selectedWorkshops.map(w => w.workshopId),
                    baseAmount: verifiedPrice,
                    platformFee: finalPlatformFee
                }
            }
        }], { session });

        // Create Razorpay order with total amount (base price + platform fee)
        const razorpayOrder = await razorpay.orders.create({
            amount: finalTotalAmount * 100, // Convert to paise
            currency: 'INR',
            receipt: orderId.slice(0, 40),
            notes: {
                kindeId: student.kindeId,
                packageId: packageConfig.id,
                email: student.email,
                workshops: JSON.stringify(selectedWorkshops.map(w => w.workshopId)),
                baseAmount: verifiedPrice,
                platformFee: finalPlatformFee
            }
        });

        // Update registration with Razorpay order ID
        const updatedRegistration = await Registration.findByIdAndUpdate(
            registration[0]._id,
            { 'paymentDetails.razorpayOrderId': razorpayOrder.id },
            { session, new: true }
        );

        return { registration: updatedRegistration, razorpayOrder };
    });

    res.json({
        success: true,
        registration: {
            ...result.registration.toObject(),
            paymentDetails: {
                ...result.registration.paymentDetails,
                razorpayDetails: {
                    orderId: result.razorpayOrder.id
                }
            }
        }
    });

  } catch (error) {
    console.error('Payment initiation failed:', error);
    
    // Check if error is from our validation
    let   errorResponse = {
        success: false,
        error: error.message || 'Failed to initiate payment'
    };
    
    // Parse JSON error message if it's our validation error
    try {
      const parsedError = JSON.parse(error.message);
      if (parsedError.validationErrors) {
        errorResponse = {
          success: false,
          error: parsedError.message,
          validationErrors: parsedError.validationErrors
        };
      }
    } catch (e) {
      // Not a JSON string, use original error
    }
    
    res.status(500).json(errorResponse);
  }
});
// Get payment status with enhanced details
router.get('/payment/status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        const registration = await Registration.findOne({
            'paymentDetails.orderId': orderId
        }).populate('student');

        if (!registration) {
            throw new Error('Registration not found');
        }

        // For Razorpay orders, fetch the latest status
        if (registration.paymentDetails.razorpayOrderId) {
            try {
                const razorpayOrder = await razorpay.orders.fetch(
                    registration.paymentDetails.razorpayOrderId
                );
                
                // If payment is completed but our status isn't updated
                if (razorpayOrder.status === 'paid' && registration.paymentStatus !== 'completed') {
                    registration.paymentStatus = 'completed';
                    await registration.save();
                }
            } catch (error) {
                console.error('Razorpay order fetch failed:', error);
            }
        }

        res.json({
            success: true,
            status: registration.paymentStatus,
            registrationId: registration._id,
            orderDetails: {
                orderId: registration.paymentDetails.orderId,
                amount: registration.amount,
                name: registration.student.name,
                email: registration.student.email,
                razorpayOrderId: registration.paymentDetails.razorpayOrderId,
                razorpayPaymentId: registration.paymentDetails.razorpayPaymentId,
                paymentMethod: registration.paymentDetails.paymentMethod,
                timestamp: registration.paymentCompletedAt || registration.updatedAt
            }
        });

    } catch (error) {
        console.error('Payment status check failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Refund route (if needed)
router.post('/payment/refund/:orderId', async (req, res) => {
  try {
      const { orderId } = req.params;
      const { reason } = req.body;

      const result = await withTransaction(async (session) => {
          // Find registration within transaction scope
          const registration = await Registration.findOne({
              'paymentDetails.orderId': orderId
          }).populate('student').session(session);

          if (!registration || !registration.paymentDetails.razorpayPaymentId) {
              throw new Error('Invalid registration or payment details');
          }

          if (registration.paymentStatus !== 'completed') {
              throw new Error('Payment not completed, cannot refund');
          }

          if (registration.paymentStatus === 'refunded') {
              throw new Error('Payment already refunded');
          }

          // Create refund in Razorpay
          const refund = await razorpay.payments.refund(
              registration.paymentDetails.razorpayPaymentId,
              {
                  notes: {
                      reason: reason || 'Customer requested refund',
                      orderId: orderId,
                      studentId: registration.student.kindeId
                  }
              }
          );

          // Update registration status
          registration.paymentStatus = 'refunded';
          registration.paymentDetails.refund = {
              id: refund.id,
              amount: refund.amount / 100,
              status: refund.status,
              reason: reason,
              createdAt: new Date()
          };

          // Decrement event registration counts
          const eventUpdatePromises = registration.selectedEvents.map(event => {
              return Event.findByIdAndUpdate(
                  event.eventId,
                  {
                      $inc: { registrationCount: -1 },
                      $pull: { registeredStudents: registration.student._id }
                  },
                  { session }
              );
          });

          // Decrement workshop registration counts
          const workshopUpdatePromises = (registration.selectedWorkshops || []).map(workshop => {
              return Workshop.findByIdAndUpdate(
                  workshop.workshopId,
                  {
                      $inc: { registrationCount: -1 },
                      $pull: { registeredStudents: registration.student._id }
                  },
                  { session }
              );
          });

          // Update student record
          const studentUpdatePromise = Student.findByIdAndUpdate(
              registration.student._id,
              {
                  $pull: {
                      registrations: registration._id,
                      events: { $in: registration.selectedEvents.map(e => e.eventId) },
                      workshops: { $in: (registration.selectedWorkshops || []).map(w => w.workshopId) }
                  }
              },
              { session }
          );

          // Mark events and workshops as refunded in registration
          registration.selectedEvents.forEach(event => {
              event.status = 'refunded';
          });
          
          (registration.selectedWorkshops || []).forEach(workshop => {
              workshop.status = 'refunded';
          });

          // Execute all updates atomically
          await Promise.all([
              registration.save({ session }),
              ...eventUpdatePromises,
              ...workshopUpdatePromises,
              studentUpdatePromise
          ]);

          // Try to send refund confirmation email
          // try {
          //     // You can create a separate email template for refunds
          //     await sendConfirmationEmail(
          //         registration.student.email,
          //         null, // No QR code for refunds
          //         {
          //             name: registration.student.name,
          //             isRefund: true,
          //             amount: refund.amount / 100,
          //             reason: reason,
          //             transactionId: refund.id
          //         }
          //     );
          // } catch (emailError) {
          //     console.error('Failed to send refund confirmation email:', emailError);
          //     // Don't throw error here as refund is already processed
          // }

          return {
              refund,
              registration: {
                  orderId: registration.paymentDetails.orderId,
                  studentName: registration.student.name,
                  amount: refund.amount / 100
              }
          };
      });

      // Send success response
      res.json({
          success: true,
          refund: {
              id: result.refund.id,
              amount: result.refund.amount / 100,
              status: result.refund.status,
              orderId: result.registration.orderId,
              studentName: result.registration.studentName
          }
      });

  } catch (error) {
      console.error('Refund failed:', error);
      
      // Enhanced error response
      res.status(400).json({
          success: false,
          error: {
              message: error.message,
              code: error.code || 'REFUND_FAILED',
              details: error.response?.data || null
          }
      });
  }
});


// Payment verification route
// Payment verification route
router.post('/payment/verify', async (req, res) => {
  try {
      const {
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature
      } = req.body;

      console.log('Payment verification request received:', {
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature
      });

      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
          console.error('Missing required payment parameters:', req.body);
          throw new Error('Missing required payment parameters');
      }

      // Verify payment signature
      const isValidSignature = verifyPaymentSignature(
          razorpay_order_id, 
          razorpay_payment_id, 
          razorpay_signature
      );

      if (!isValidSignature) {
          console.error('Signature verification failed');
          // Before rejecting, try to fetch the payment from Razorpay to confirm status
          const payment = await razorpay.payments.fetch(razorpay_payment_id);
          
          if (payment.status !== 'captured') {
              throw new Error('Invalid payment signature and payment not captured');
          } else {
              console.log('Signature mismatch but payment is captured in Razorpay, proceeding...');
              // Continue with payment processing despite signature mismatch
          }
      }

      const result = await withTransaction(async (session) => {
          // Find registration within transaction
          const registration = await Registration.findOne({
              'paymentDetails.razorpayOrderId': razorpay_order_id
          }).populate('student').session(session);

          if (!registration) {
              throw new Error('Registration not found');
          }

          if (registration.paymentStatus === 'completed') {
              // Return success for already processed payments
              return registration;
          }
          
          // Retrieve original order to verify workshop and payment data
          const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
          console.log('Razorpay order:', {
              id: razorpay_order_id,
              notes: razorpayOrder.notes,
              amount: razorpayOrder.amount
          });
          
          // Handle workshop validation from order notes
          if (razorpayOrder.notes && razorpayOrder.notes.workshops) {
              try {
                  const workshopIdsFromNotes = JSON.parse(razorpayOrder.notes.workshops);
                  console.log('Workshops from order notes:', workshopIdsFromNotes);
                  
                  if (workshopIdsFromNotes && workshopIdsFromNotes.length > 0) {
                      const registrationWorkshopIds = registration.selectedWorkshops.map(w => 
                          w.workshopId.toString()
                      );
                      
                      // Check if there's a mismatch that needs correction
                      const needsCorrection = !arraysEqual(workshopIdsFromNotes, registrationWorkshopIds);
                      
                      if (needsCorrection) {
                          console.log('Correcting workshop registration mismatch');
                          
                          // Get workshop details from database
                          const correctWorkshops = await Workshop.find({
                              _id: { $in: workshopIdsFromNotes.map(id => 
                                  mongoose.Types.ObjectId(id)
                              )}
                          }).session(session);
                          
                          // Create corrected workshop entries
                          registration.selectedWorkshops = workshopIdsFromNotes.map(id => {
                              const workshop = correctWorkshops.find(w => 
                                  w._id.toString() === id
                              );
                              
                              return {
                                  workshopId: mongoose.Types.ObjectId(id),
                                  workshopName: workshop?.title || 'Workshop',
                                  status: 'pending'
                              };
                          });
                      }
                  }
              } catch (e) {
                  console.error('Error processing workshop IDs from order notes:', e);
                  // Continue even if workshop validation fails
              }
          }

          // Verify payment amount with platform fee
          const payment = await razorpay.payments.fetch(razorpay_payment_id);
          const paidAmount = payment.amount / 100; // Convert from paise to rupees
          
          // Get base amount and platform fee from registration or order notes
          const baseAmount = registration.amount;
          const platformFee = registration.platformFee || 
                             (razorpayOrder.notes && parseFloat(razorpayOrder.notes.platformFee)) || 
                             Math.ceil(baseAmount * 0.02);
          
          // Calculate expected total (with allowance for rounding)
          const expectedTotal = registration.totalAmount || (baseAmount + platformFee);
          
          // Log payment amount verification
          console.log('Payment amount verification:', {
              paidAmount,
              expectedTotal,
              baseAmount,
              platformFee
          });
          
          // Check if total amount is correct (with small tolerance)
          if (Math.abs(paidAmount - expectedTotal) > 1) {
              console.warn('Payment amount mismatch but continuing. Paid: ' + 
                          paidAmount + ', Expected: ' + expectedTotal);
          }

          // Generate QR code with platform fee information
          const qrCodeDataUrl = await generateQRCode({
              userId: registration.student.kindeId,
              selectedEvents: registration.selectedEvents,
              selectedWorkshops: registration.selectedWorkshops,
              orderId: razorpay_order_id,
              paymentId: razorpay_payment_id,
              amount: baseAmount,
              platformFee: platformFee,
              totalAmount: paidAmount
          });

          // Update registration within transaction
          registration.paymentStatus = 'completed';
          registration.paymentCompletedAt = new Date();
          registration.paymentDetails.razorpayPaymentId = razorpay_payment_id;
          registration.paymentDetails.razorpaySignature = razorpay_signature;
          registration.paymentDetails.paymentMethod = payment.method;
          registration.paymentDetails.status = 'completed';
          
          // Ensure platform fee fields are set correctly
          registration.platformFee = platformFee;
          registration.totalAmount = paidAmount;
          
          registration.qrCode = {
              dataUrl: qrCodeDataUrl,
              generatedAt: new Date(),
              validUntil: new Date('2025-04-09T23:59:59.999Z'),
              metadata: {
                  events: registration.selectedEvents.map(e => e.eventId.toString()),
                  workshops: (registration.selectedWorkshops || []).map(w => w.workshopId.toString()),
                  verificationData: {
                      baseAmount: baseAmount,
                      platformFee: platformFee,
                      totalAmount: paidAmount,
                      paymentId: razorpay_payment_id,
                      timestamp: new Date()
                  }
              }
          };

          // Update events atomically within transaction
          const eventUpdates = registration.selectedEvents.map(event => {
              event.status = 'completed';
              return Event.findByIdAndUpdate(
                  event.eventId,
                  { 
                    $inc: { registrationCount: 1 },
                    $addToSet: { registeredStudents: registration.student._id }
                  },
                  { session }
              );
          });

          // Update workshops atomically within transaction - FIX WORKSHOP REGISTRATION COUNT
          const workshopUpdatePromises = [];
          
          if (registration.selectedWorkshops && registration.selectedWorkshops.length > 0) {
              console.log('Processing workshop registrations:', registration.selectedWorkshops);
              
              for (const workshop of registration.selectedWorkshops) {
                  workshop.status = 'completed';
                  
                  // Ensure workshopId is correctly handled as ObjectId
                  const workshopId = typeof workshop.workshopId === 'object' 
                      ? workshop.workshopId 
                      : mongoose.Types.ObjectId(workshop.workshopId.toString());
                  
                  // Log the workshop update
                  console.log('Updating workshop registration count for:', workshopId);
                  
                  // Three updates for workshop:
                  // 1. Increment registrationCount
                  // 2. Increment registration.registeredCount
                  // 3. Add student to registeredStudents
                  const workshopUpdate = Workshop.findByIdAndUpdate(
                      workshopId,
                      { 
                          $inc: { 
                              registrationCount: 1,
                              'registration.registeredCount': 1
                          },
                          $addToSet: { registeredStudents: registration.student._id }
                      },
                      { session, new: true }
                  );
                  
                  workshopUpdatePromises.push(workshopUpdate);
              }
          }

          // Update student record within transaction
          await Student.findByIdAndUpdate(
              registration.student._id,
              {
                  $addToSet: { 
                    registrations: registration._id,
                    events: { $each: registration.selectedEvents.map(e => e.eventId) },
                    workshops: { $each: (registration.selectedWorkshops || []).map(w => ({
                        id: w.workshopId,
                        workshopId: w.workshopId,
                        title: w.workshopName
                    }))}
                  },
                  $set: { cart: [] }
              },
              { session }
          );

          // Execute all updates
          const updateResults = await Promise.all([
              registration.save({ session }),
              ...eventUpdates,
              ...workshopUpdatePromises
          ]);
          
          // Log update results for debugging
          console.log('Workshop update results:', updateResults.slice(eventUpdates.length + 1));

          return registration;
      });

      // Send confirmation email if needed
      // await sendConfirmationEmail(...);

      // Return success response with fee information
      res.json({
          success: true,
          registration: {
              orderId: result.paymentDetails.orderId,
              amount: result.amount,
              platformFee: result.platformFee,
              totalAmount: result.totalAmount,
              status: 'completed',
              name: result.student.name,
              email: result.student.email,
              qrCode: result.qrCode.dataUrl
          }
      });

  } catch (error) {
      console.error('Payment verification failed:', error);
      res.status(400).json({
          success: false,
          error: error.message
      });
  }
});

// Helper function to compare arrays
function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    // Convert all items to strings for consistent comparison
    const aStrings = a.map(item => item.toString());
    const bStrings = b.map(item => item.toString());
    
    // Sort before comparing for position-independent comparison
    aStrings.sort();
    bStrings.sort();

    for (let i = 0; i < aStrings.length; i++) {
        if (aStrings[i] !== bStrings[i]) return false;
    }
    return true;
}

// Webhook handler
router.post('/payment/webhook', express.json(), async (req, res) => {
  try {
    const webhookData = req.body;
    
    // Verify webhook signature for Razorpay
    const signature = req.headers['x-razorpay-signature'];
    const isValidWebhook = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(webhookData))
      .digest('hex');

    if (signature !== isValidWebhook) {
      throw new Error('Invalid webhook signature');
    }

    // Handle successful payment
    if (webhookData.event === 'payment.captured') {
      const orderData = webhookData.payload.payment.entity;
      
      await withTransaction(async (session) => {
        // Find registration within transaction scope
        const registration = await Registration.findOne({
          'paymentDetails.razorpayOrderId': orderData.order_id
        }).populate('student').session(session);

        if (!registration) {
          throw new Error('Registration not found');
        }

        // Skip if already processed
        if (registration.paymentStatus === 'completed' && registration.qrCode?.dataUrl) {
          return;
        }

        // Get the paid amount and calculate/set platform fee
        const paidAmount = orderData.amount / 100; // Convert from paise to rupees
        const baseAmount = registration.amount;
        const platformFee = registration.platformFee || Math.ceil(baseAmount * 0.02);
        
        // Update fee information
        registration.platformFee = platformFee;
        registration.totalAmount = paidAmount;

        // Generate QR code with platform fee information
        const qrCodeDataUrl = await generateQRCode({
          userId: registration.student.kindeId,
          selectedEvents: registration.selectedEvents,
          selectedWorkshops: registration.selectedWorkshops,
          orderId: orderData.order_id,
          paymentId: orderData.id,
          amount: baseAmount,
          platformFee: platformFee,
          totalAmount: paidAmount
        });

        // Store QR code
        registration.qrCode = {
          dataUrl: qrCodeDataUrl,
          generatedAt: new Date(),
          validUntil: new Date('2025-04-09T23:59:59.999Z'),
          metadata: {
            events: registration.selectedEvents.map(e => e.eventId.toString()),
            workshops: (registration.selectedWorkshops || []).map(w => w.workshopId.toString()),
            verificationData: {
              baseAmount: baseAmount,
              platformFee: platformFee,
              totalAmount: paidAmount,
              paymentId: orderData.id,
              timestamp: new Date()
            }
          }
        };

        // Update registration status
        registration.paymentStatus = 'completed';
        registration.paymentCompletedAt = new Date();
        registration.paymentDetails.razorpayPaymentId = orderData.id;
        registration.paymentDetails.paymentMethod = orderData.method;
        registration.paymentDetails.status = 'completed';

        // Update event statuses and counts atomically
        const eventUpdatePromises = registration.selectedEvents.map(event => {
          event.status = 'completed';
          return Event.findByIdAndUpdate(
            event.eventId,
            { 
              $inc: { registrationCount: 1 },
              $addToSet: { registeredStudents: registration.student._id }
            },
            { session, new: true }
          );
        });

        // Fix: Update workshop statuses and counts atomically
        const workshopUpdatePromises = [];
        
        if (registration.selectedWorkshops && registration.selectedWorkshops.length > 0) {
            console.log('Webhook processing workshop registrations:', registration.selectedWorkshops);
            
            for (const workshop of registration.selectedWorkshops) {
                workshop.status = 'completed';
                
                // Ensure workshopId is correctly handled as ObjectId
                const workshopId = typeof workshop.workshopId === 'object' 
                    ? workshop.workshopId 
                    : mongoose.Types.ObjectId(workshop.workshopId.toString());
                
                // Log the workshop update
                console.log('Webhook updating workshop registration count for:', workshopId);
                
                // Update both registrationCount and registration.registeredCount
                const workshopUpdate = Workshop.findByIdAndUpdate(
                    workshopId,
                    { 
                        $inc: { 
                            registrationCount: 1,
                            'registration.registeredCount': 1
                        },
                        $addToSet: { registeredStudents: registration.student._id }
                    },
                    { session, new: true }
                );
                
                workshopUpdatePromises.push(workshopUpdate);
            }
        }

        // Update student record atomically
        const studentUpdatePromise = Student.findByIdAndUpdate(
          registration.student._id,
          {
            $addToSet: { 
              registrations: registration._id,
              events: { $each: registration.selectedEvents.map(e => e.eventId) },
              workshops: { $each: (registration.selectedWorkshops || []).map(w => ({
                id: w.workshopId,
                workshopId: w.workshopId,
                title: w.workshopName
              }))}
            },
            $set: { cart: [] }
          },
          { session, new: true }
        );

        // Execute all updates atomically
        const updateResults = await Promise.all([
          registration.save({ session }),
          ...eventUpdatePromises,
          ...workshopUpdatePromises,
          studentUpdatePromise
        ]);
        
        // Log workshop update results for debugging
        console.log('Webhook workshop update results:', 
                    updateResults.slice(eventUpdatePromises.length + 1, 
                                       -1)); // Exclude the last one (student update)
      });
    }

    // Always return 200 for webhook
    res.json({ success: true });

  } catch (error) {
    console.error('Webhook handling failed:', error);
    // Log detailed error for debugging
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    // Always return 200 for webhooks, even on error
    res.status(200).json({ 
      success: false, 
      error: error.message,
      errorCode: error.code || 'WEBHOOK_PROCESSING_ERROR'
    });
  }
});
// Get registration details
router.get('/registrations/order/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        const registration = await Registration.findOne({
          'paymentDetails.orderId': orderId
      }).populate('student');
  
      if (!registration) {
          throw new Error('Registration not found');
      }
  
      // For Razorpay orders, fetch the latest payment status
      if (registration.paymentDetails.razorpayOrderId) {
          try {
              const razorpayOrder = await razorpay.orders.fetch(
                  registration.paymentDetails.razorpayOrderId
              );
  
              // If there's a payment ID, fetch payment details
              if (registration.paymentDetails.razorpayPaymentId) {
                  const payment = await razorpay.payments.fetch(
                      registration.paymentDetails.razorpayPaymentId
                  );
  
                  registration.paymentDetails.paymentMethod = payment.method;
                  registration.paymentDetails.status = payment.status;
              }
  
              // If payment is completed but our status isn't updated
              if (razorpayOrder.status === 'paid' && registration.paymentStatus !== 'completed') {
                  const payments = await razorpay.orders.fetchPayments(razorpayOrder.id);
                  const successfulPayment = payments.items.find(p => p.status === 'captured');
  
                  if (successfulPayment) {
                      await verifyAndProcessPayment(
                          registration,
                          razorpayOrder.id,
                          successfulPayment.id,
                          successfulPayment.razorpay_signature
                      );
                  }
              }
          } catch (error) {
              console.error('Error fetching Razorpay details:', error);
          }
      }
  
      // Return comprehensive registration details
      res.json({
          success: true,
          registration: {
              ...registration.toObject(),
              studentDetails: registration.student,
              paymentDetails: {
                  ...registration.paymentDetails,
                  amount: registration.amount,
                  status: registration.paymentStatus,
                  orderId: registration.paymentDetails.orderId,
                  razorpayOrderId: registration.paymentDetails.razorpayOrderId,
                  razorpayPaymentId: registration.paymentDetails.razorpayPaymentId,
                  customerDetails: registration.paymentDetails.customerDetails,
                  merchantParams: registration.paymentDetails.merchantParams,
                  paymentMethod: registration.paymentDetails.paymentMethod,
                  timestamp: registration.paymentCompletedAt || registration.updatedAt
              },
              selectedItems: {
                  events: registration.selectedEvents.map(event => ({
                      id: event.eventId,
                      name: event.eventName,
                      status: event.status
                  })),
                  workshops: registration.selectedWorkshops?.map(workshop => ({
                      id: workshop.workshopId,
                      name: workshop.workshopName,
                      status: workshop.status
                  })) || []
              },
              qrCode: registration.qrCode ? {
                  dataUrl: registration.qrCode.dataUrl,
                  generatedAt: registration.qrCode.generatedAt,
                  validUntil: registration.qrCode.validUntil
              } : null
          }
      });
  
  } catch (error) {
      console.error('Registration fetch failed:', error);
      res.status(500).json({
          success: false,
          error: error.message
      });
  }
});

router.get('/payment/status/:orderId', async (req, res) => {
  try {
  const { orderId } = req.params;
  const registration = await Registration.findOne({
    'paymentDetails.orderId': orderId
}).populate('student');

if (!registration) {
    throw new Error('Registration not found');
}

// For Razorpay orders, fetch the latest status
if (registration.paymentDetails.razorpayOrderId) {
    try {
        const razorpayOrder = await razorpay.orders.fetch(
            registration.paymentDetails.razorpayOrderId
        );
        
        // Check order status and update if needed
        if (razorpayOrder.status === 'paid' && registration.paymentStatus !== 'completed') {
            const payments = await razorpay.orders.fetchPayments(razorpayOrder.id);
            const successfulPayment = payments.items.find(p => p.status === 'captured');

            if (successfulPayment) {
                await verifyAndProcessPayment(
                    registration,
                    razorpayOrder.id,
                    successfulPayment.id,
                    successfulPayment.razorpay_signature
                );
            }
        }
    } catch (error) {
        console.error('Razorpay order fetch failed:', error);
    }
}

// Return comprehensive payment status
res.json({
    success: true,
    status: registration.paymentStatus,
    registrationId: registration._id,
    orderDetails: {
        orderId: registration.paymentDetails.orderId,
        amount: registration.amount,
        name: registration.student.name,
        email: registration.student.email,
        razorpayOrderId: registration.paymentDetails.razorpayOrderId,
        razorpayPaymentId: registration.paymentDetails.razorpayPaymentId,
        paymentMethod: registration.paymentDetails.paymentMethod,
        timestamp: registration.paymentCompletedAt || registration.updatedAt
    },
    items: {
        events: registration.selectedEvents.length,
        workshops: registration.selectedWorkshops?.length || 0
    }
});

} catch (error) {
console.error('Payment status check failed:', error);
res.status(500).json({
    success: false,
    error: error.message
});
}
});


router.post('/registration/update', async (req, res) => {
  try {
    const { kindeId, newEvents, newWorkshops } = req.body;
    console.log('Update request with data:', { kindeId, newEvents, newWorkshops });

    // Validate environment variables
    validateEnvironment();

    const result = await withTransaction(async (session) => {
      // Find existing registration with student populated
      const registration = await Registration.findOne({ 
        kindeId,
        paymentStatus: 'completed'
      }).populate('student').session(session);

      if (!registration) {
        throw new Error('No completed registration found');
      }

      console.log('Current events:', registration.selectedEvents.length);
      console.log('Current workshops:', registration.selectedWorkshops?.length || 0);

      // Get the package ID from the registration
      const packageId = registration.paymentDetails?.merchantParams?.comboId || '';
      console.log('User package type:', packageId);

      // Determine package type for permission checks
      const isWorkshopPackage = packageId.includes('workshop') && !packageId.includes('combo');
      const isEventPackage = packageId.includes('all-events');
      const isComboPackage = packageId.includes('combo');

      // Process new events based on package permissions
      if (newEvents && newEvents.length > 0) {
        // Check if the user can add events based on their package
        if (isWorkshopPackage && !isComboPackage) {
          throw new Error('Your workshop package does not allow adding events. Please upgrade to a combo package.');
        }

        const eventUpdates = newEvents.map(event => {
          const eventId = event.id;
          const eventName = event.eventInfo?.title || event.title || 'Event';
          
          console.log('Processing event:', { eventId, eventName });
          
          return {
            eventId: eventId,
            eventName: eventName,
            status: 'completed',
            registrationType: 'individual',
            maxTeamSize: 1
          };
        });

        // Improved duplicate checking
        const existingEventIds = new Set(
          registration.selectedEvents.map(e => e.eventId.toString())
        );

        const newEventUpdates = eventUpdates.filter(update => {
          const isNew = !existingEventIds.has(update.eventId.toString());
          console.log(`Event ${update.eventId} is new: ${isNew}`);
          return isNew;
        });

        console.log('New events to add:', newEventUpdates.length);

        if (newEventUpdates.length > 0) {
          // Update event counts
          const eventPromises = newEventUpdates.map(event => 
            Event.findByIdAndUpdate(
              event.eventId,
              { 
                $inc: { registrationCount: 1 },
                $addToSet: { registeredStudents: registration.student._id }
              },
              { session, new: true }
            ).exec()
          );

          // Add new events to registration
          registration.selectedEvents.push(...newEventUpdates);
          
          // Execute event updates
          await Promise.all(eventPromises);
        }
      }

      // Process new workshops with restrictions
      if (newWorkshops && newWorkshops.length > 0) {
        // Check if user can add workshops based on their package
        if (isEventPackage) {
          throw new Error('Your events package does not allow adding workshops. Please upgrade to a combo package.');
        }

        // Check if the user already has workshops in their registration
        const existingWorkshopCount = registration.selectedWorkshops?.length || 0;
        
        if (existingWorkshopCount > 0) {
          // Allow workshop changes only if this is a new workshop (replacement) for workshop-only packages
          if (isWorkshopPackage) {
            // Remove existing workshop first
            console.log('Replacing existing workshop for workshop-only package');

            // Get existing workshop ID
            const existingWorkshopId = registration.selectedWorkshops[0].workshopId;
            
            // Decrement registration count in workshop
            await Workshop.findByIdAndUpdate(
              existingWorkshopId,
              { 
                $inc: { 
                  registrationCount: -1,
                  'registration.registeredCount': -1 
                },
                $pull: { registeredStudents: registration.student._id }
              },
              { session }
            ).exec();
            
            // Remove from student record
            await Student.findByIdAndUpdate(
              registration.student._id,
              { 
                $pull: { 
                  workshops: { workshopId: existingWorkshopId } 
                } 
              },
              { session }
            ).exec();
            
            // Clear existing workshops
            registration.selectedWorkshops = [];
          } else {
            // For combo packages, don't allow changing workshops
            console.log('User already has workshops registered:', existingWorkshopCount);
            throw new Error('You already have a workshop registered. Cannot change workshops in a combo package.');
          }
        }
        
        // Allow only one workshop during registration update
        if (newWorkshops.length > 1) {
          console.log('Too many workshops in update request:', newWorkshops.length);
          throw new Error('Only one workshop is allowed per registration');
        }

        const workshopUpdates = newWorkshops.map(workshop => ({
          workshopId: workshop.id,
          workshopName: workshop.title || 'Workshop',
          status: 'completed'
        }));

        const existingWorkshopIds = new Set(
          (registration.selectedWorkshops || []).map(w => w.workshopId.toString())
        );

        const newWorkshopUpdates = workshopUpdates.filter(update => {
          const isNew = !existingWorkshopIds.has(update.workshopId.toString());
          console.log(`Workshop ${update.workshopId} is new: ${isNew}`);
          return isNew;
        });

        if (newWorkshopUpdates.length > 0) {
          // Update both registrationCount and registration.registeredCount
          const workshopPromises = newWorkshopUpdates.map(workshop => {
            const workshopId = mongoose.Types.ObjectId(workshop.workshopId);
            console.log('Updating workshop count for ID:', workshopId);
            
            return Workshop.findByIdAndUpdate(
              workshopId,
              { 
                $inc: { 
                  registrationCount: 1,
                  'registration.registeredCount': 1 
                },
                $addToSet: { registeredStudents: registration.student._id }
              },
              { session, new: true }
            ).exec();
          });

          // Initialize selectedWorkshops array if it doesn't exist
          if (!registration.selectedWorkshops) {
            registration.selectedWorkshops = [];
          }

          registration.selectedWorkshops.push(...newWorkshopUpdates);
          const workshopResults = await Promise.all(workshopPromises);
          console.log('Workshop update results:', workshopResults);
        }
      }

      // Update student record - Convert string IDs to ObjectIds for workshops
      if ((newEvents && newEvents.length > 0) || (newWorkshops && newWorkshops.length > 0)) {
        // For events
        const eventUpdates = newEvents && newEvents.length > 0 
          ? { $addToSet: { events: { $each: newEvents.map(e => e.id) } } }
          : {};
          
        // For workshops - Using mongoose.Types.ObjectId to convert string IDs
        const workshopUpdates = newWorkshops && newWorkshops.length > 0
          ? { $addToSet: { 
              workshops: { 
                $each: newWorkshops.map(w => ({
                  id: mongoose.Types.ObjectId(w.id),
                  workshopId: mongoose.Types.ObjectId(w.id),
                  title: w.title || 'Workshop'
                }))
              } 
            }}
          : {};

        await Student.findByIdAndUpdate(
          registration.student._id,
          {
            ...eventUpdates,
            ...workshopUpdates
          },
          { session }
        ).exec();
      }

      // Generate new QR code using the existing generateQRCode function
      const qrCodeDataUrl = await generateQRCode({
        userId: registration.student.kindeId,
        selectedEvents: registration.selectedEvents,
        selectedWorkshops: registration.selectedWorkshops || [],
        orderId: registration.paymentDetails.razorpayOrderId,
        paymentId: registration.paymentDetails.razorpayPaymentId,
        amount: registration.amount,
        platformFee: registration.platformFee || Math.ceil(registration.amount * 0.02),
        totalAmount: registration.totalAmount || (registration.amount + (registration.platformFee || Math.ceil(registration.amount * 0.02)))
      });

      // Update QR code in registration
      registration.qrCode = {
        dataUrl: qrCodeDataUrl,
        generatedAt: new Date(),
        validUntil: new Date('2025-04-09T23:59:59.999Z'),
        metadata: {
          events: registration.selectedEvents.map(e => e.eventId.toString()),
          workshops: (registration.selectedWorkshops || []).map(w => w.workshopId.toString()),
          verificationData: {
            baseAmount: registration.amount,
            platformFee: registration.platformFee || Math.ceil(registration.amount * 0.02),
            totalAmount: registration.totalAmount || (registration.amount + (registration.platformFee || Math.ceil(registration.amount * 0.02))),
            orderId: registration.paymentDetails.razorpayOrderId,
            paymentId: registration.paymentDetails.razorpayPaymentId,
            timestamp: new Date()
          }
        }
      };

      // Save registration with new QR code
      await registration.save({ session });

      console.log('Final events count:', registration.selectedEvents.length);
      console.log('Final workshops count:', registration.selectedWorkshops?.length || 0);
      
      return registration;
    });

    // Send detailed response
    res.json({ 
      success: true,
      registration: {
        eventsCount: result.selectedEvents.length,
        workshopsCount: result.selectedWorkshops?.length || 0,
        updatedAt: result.updatedAt,
        events: result.selectedEvents.map(e => ({
          id: e.eventId,
          name: e.eventName,
          status: e.status
        })),
        workshops: (result.selectedWorkshops || []).map(w => ({
          id: w.workshopId,
          name: w.workshopName,
          status: w.status
        })),
        totalEvents: result.selectedEvents.length,
        qrCode: result.qrCode.dataUrl
      }
    });

  } catch (error) {
    console.error('Registration update failed:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message,
      details: error.stack
    });
  }
});

router.get('/registration/status/:kindeId', async (req, res) => {
  try {
    const registration = await Registration.findOne({
      kindeId: req.params.kindeId,
      paymentStatus: 'completed'
    });

    res.json({
      hasCompletedRegistration: !!registration,
      registrationDetails: registration
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});


router.get('/shipping-policy', (req, res) => {
  res.render('policy', { content: shippingPolicy });
});

router.get('/cancellation-policy', (req, res) => {
  res.render('policy', { content: cancellationPolicy });
});

router.get('/privacy-policy', (req, res) => {
  res.render('policy', { content: privacyPolicy });
});



export default router;