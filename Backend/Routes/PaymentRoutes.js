// routes/paymentRoutes.js
import express from 'express';
import { Student } from '../Models/StudentSchema.js';
import { Registration } from '../Models/RegistrationSchema.js';
import Event from '../Models/eventModel.js';
import Workshop from '../Models/workShopModel.js';
import PaymentSecurityService from '../PaymentSecurity.js';
import dotenv from 'dotenv';
import { generateQRCode } from './QRRoutes.js';
import { sendConfirmationEmail } from '../index.js';
import initializeJuspay from '../config/justpayconfig.js';
import crypto from 'crypto';
dotenv.config();

const router = express.Router();
const paymentSecurity = new PaymentSecurityService(process.env.HDFC_RESPONSE_KEY);

// Initialize Juspay
let juspay;
try {
    juspay = initializeJuspay();
} catch (error) {
    console.error('Failed to initialize Juspay:', error);
    process.exit(1); // Exit if Juspay initialization fails
}

  


  // Helper function to secure response data
// Helper function to secure response data
const secureResponseData = async (data) => {
  try {
    const crypto = await import('crypto');
    const dataString = new URLSearchParams(data).toString();
    const signature = crypto.createHmac('sha256', process.env.HDFC_RESPONSE_KEY)
      .update(dataString)
      .digest('base64');

    return { ...data, signature };
  } catch (error) {
    console.error('Error generating secure response:', error);
    return data;
  }
};
// Payment initiation
// Payment initiation
// First, define package config at top level
const PACKAGES = {
  'rgukt-workshop': { price: 199, type: 'rgukt' },
  'rgukt-all-events': { price: 199, type: 'rgukt' },
  'rgukt-combo': { price: 299, type: 'rgukt' },
  'guest-workshop': { price: 499, type: 'guest' },
  'guest-all-events': { price: 499, type: 'guest' },
  'guest-combo': { price: 599, type: 'guest' }
};

const detectTampering = async (req, res, next) => {
  try {
    const { cartItems = [], combo, kindeId, workshops = [] } = req.body;

      // Add timestamp verification
      const timestamp = Date.now();
      const maxAge = 5 * 60 * 1000; // 5 minutes
      if (timestamp - req.body.timestamp > maxAge) {
        throw new Error('Request expired');
      }
  
  // Generate request signature
  const requestSignature = crypto
  .createHmac('sha256', process.env.HDFC_RESPONSE_KEY)
  .update(`${kindeId}:${combo.id}:${timestamp}`)
  .digest('base64');

   // Add this to sessionData later
   req.requestSignature = requestSignature;

    // 1. Verify student exists and get actual data
    const student = await Student.findOne({ kindeId });
    if (!student) {
      throw new Error('Student not found');
    }

    // 2. Verify active combo matches and was actually selected
    if (!student.activeCombo || student.activeCombo.id !== combo.id) {
      console.error('Package tampering detected:', {
        requestedCombo: combo.id,
        activeCombo: student.activeCombo?.id,
        kindeId
      });
      throw new Error('Invalid package selection');
    }

    // 3. Get server-side package config
    // Add price verification
    const packageConfig = PACKAGES[combo.id];
    if (packageConfig.price !== student.activeCombo.price) {
      console.error('Price mismatch:', {
        storedPrice: student.activeCombo.price,
        packagePrice: packageConfig.price
      });
      throw new Error('Invalid package price');
    }
    // 4. Verify cart matches database exactly
    const dbCartIds = student.cart.map(item => item.eventId.toString()).sort();
    const requestCartIds = cartItems.map(item => item.id.toString()).sort();

    if (JSON.stringify(dbCartIds) !== JSON.stringify(requestCartIds)) {
      console.error('Cart tampering detected:', {
        storedCart: dbCartIds,
        requestCart: requestCartIds,
        kindeId
      });
      throw new Error('Cart verification failed');
    }

    const studentEmail = (student.email || '').toLowerCase().trim();
    const rguktsklmRegex = /@rguktsklm\.ac\.in$/i;
    const isRGUKTStudent = rguktsklmRegex.test(studentEmail);
    const comboId = (combo.id || '').trim();
    const validPrefix = isRGUKTStudent ? 'rgukt-' : 'guest-';
    
    console.log('Package validation (regex):', {
      studentEmail,
      isRGUKTStudent,
      comboId,
      validPrefix,
      startsWithPrefix: comboId.startsWith(validPrefix)
    });
    
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

    // 6. Validate cart contents against package type
    const dbWorkshops = student.workshops || [];
    if (combo.id.includes('all-events')) {
      if (dbWorkshops.length > 0 || workshops.length > 0) {
        console.error('Invalid workshop in events package:', {
          comboId: combo.id,
          workshopCount: dbWorkshops.length,
          kindeId
        });
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

    // 7. Attach validated data to request
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

    // 8. Log validation success
    console.log('Payment validation passed:', {
      kindeId,
      comboId: combo.id,
      eventCount: student.cart.length,
      workshopCount: dbWorkshops.length,
      price: packageConfig.price
    });

    next();
  } catch (error) {
    // Log detailed error for monitoring
    console.error('Payment validation failed:', {
      error: error.message,
      request: {
        combo: req.body.combo,
        cartSize: req.body.cartItems?.length,
        workshopSize: req.body.workshops?.length,
        kindeId: req.body.kindeId
      }
    });

    // Send generic error to client
    res.status(400).json({
      success: false,
      error: 'Payment validation failed'
    });
  }
};

router.post('/payment/initiate', detectTampering,async (req, res) => {
  try {

   // Use validated data from middleware
   const { student, packageConfig, verifiedPrice, cartValidation } = req.validatedData;

    
    // 6. Create registration with verified details
    const registration = await Registration.create({
      student: student._id,
      kindeId: student.kindeId,
      selectedEvents: student.cart.map(item => ({
        eventId: item.eventId,
        eventName: item.title || '',
        status: 'pending',
        registrationType: 'individual',
        maxTeamSize: 1
      })),
      selectedWorkshops: (student.workshops || []).map(workshop => ({
        workshopId: workshop.id,
        workshopName: workshop.title,
        status: 'pending'
      })),
      amount: verifiedPrice, // Use verified server-side price
      paymentStatus: 'pending',
      paymentInitiatedAt: new Date(),
      paymentDetails: {
        customerDetails: {
          name: student.name,
          email: student.email,
          phone: student.mobileNumber
        },
        merchantParams: {
          comboId: cartValidation.originalCombo.id,
          comboName: cartValidation.originalCombo.name,
          verificationData: cartValidation
        },
        orderId: `order_${Date.now()}_${student.kindeId}`
      }
    });

    // 7. Create payment session with verified price
    const sessionData = {
      order_id: registration.paymentDetails.orderId,
      amount: packageConfig.price, // Use server-side price
      payment_page_client_id: process.env.HDFC_PAYMENT_PAGE_CLIENT_ID,
      customer_id: student.kindeId,
      action: 'paymentPage',
      return_url: `${process.env.BASE_URL}/api/payment/handleResponse`,
      webhook_url: `${process.env.BASE_URL}/api/payment/webhook`,
      currency: 'INR',
      customer_email: student.email,
      customer_phone: student.mobileNumber,
      customer_name: student.name,
      timestamp: new Date().toISOString()
    };

    const sessionResponse = await juspay.orderSession.create(sessionData);

    res.json({
      success: true,
      sessionData: sessionResponse
    });

  } catch (error) {
    console.error('Payment initiation failed:', error);
    res.status(400).json({ // Use 400 for validation errors
      success: false,
      error: error.message
    });
  }
});

router.all('/payment/handleResponse', async (req, res) => {
  let redirectUrl;

  try {
    const responseData = { ...req.body, ...req.query };
    const { order_id } = responseData;

    if (!order_id) {
      throw new Error('order_id not present or cannot be empty');
    }

    // 1. Get payment status directly from Juspay for verification
    const statusResponse = await juspay.order.status(order_id);
    const orderStatus = statusResponse.status;
    const paidAmount = parseFloat(statusResponse.amount);

    // 2. Find registration and verify details
    const registration = await Registration.findOne({
      'paymentDetails.orderId': order_id
    }).populate('student');

    if (!registration) {
      throw new Error('Registration not found');
    }

   

    // 3. Verify user type matches package type
    const studentEmail = (registration.student.email || '').toLowerCase().trim();
    const rguktsklmRegex = /@rguktsklm\.ac\.in$/i;
    const isRGUKTStudent = rguktsklmRegex.test(studentEmail);
    const expectedPrefix = isRGUKTStudent ? 'rgukt-' : 'guest-';
    
    // Add debug logging
    console.log('Payment verification check:', {
      studentEmail,
      isRGUKTStudent,
      comboId: registration.paymentDetails.merchantParams.comboId,
      expectedPrefix,
      startsWithPrefix: registration.paymentDetails.merchantParams.comboId.startsWith(expectedPrefix)
    });
    
    if (!registration.paymentDetails.merchantParams.comboId.startsWith(expectedPrefix)) {
      console.error('Institution type mismatch:', {
        studentEmail,
        comboId: registration.paymentDetails.merchantParams.comboId,
        orderId: order_id,
        isRGUKTStudent,
        expectedPrefix
      });
      throw new Error('Package verification failed');
    }

     // 4. Verify payment amount against original package price
     const originalPackage = PACKAGES[registration.paymentDetails.merchantParams.comboId];
     if (!originalPackage || originalPackage.price !== paidAmount) {
       console.error('Payment amount mismatch:', {
         orderId: order_id,
         expectedAmount: originalPackage?.price,
         paidAmount,
         comboId: registration.paymentDetails.merchantParams.comboId
       });
       throw new Error('Payment verification failed');
     }

    switch (orderStatus) {
      case "CHARGED":
        try {
          if (!registration.qrCode?.dataUrl) {
            // Verify transaction hasn't been processed before
            if (registration.paymentStatus === 'completed') {
              throw new Error('Payment already processed');
            }

            // Update registration
            registration.paymentStatus = 'completed';
            registration.paymentCompletedAt = new Date();
            registration.paymentDetails.transactionId = statusResponse.txn_id;
            registration.paymentDetails.paymentMethod = statusResponse.payment_method;
            registration.paymentDetails.verificationData = {
              originalAmount: originalPackage.price,
              paidAmount,
              verifiedAt: new Date()
            };

            // Generate QR code with verified data
            const qrCodeDataUrl = await generateQRCode({
              userId: registration.student.kindeId,
              selectedEvents: registration.selectedEvents,
              selectedWorkshops: registration.selectedWorkshops || [],
              verificationHash: crypto
                .createHmac('sha256', process.env.HDFC_RESPONSE_KEY)
                .update(`${registration.student.kindeId}:${order_id}:${paidAmount}`)
                .digest('base64')
            });

            // Store QR code with verification
            registration.qrCode = {
              dataUrl: qrCodeDataUrl,
              generatedAt: new Date(),
              metadata: {
                events: registration.selectedEvents.map(e => e.eventId.toString()),
                workshops: (registration.selectedWorkshops || []).map(w => w.workshopId.toString()),
                verificationData: {
                  amount: paidAmount,
                  transactionId: statusResponse.txn_id,
                  timestamp: new Date()
                }
              }
            };

            // Update event statuses atomically
            const eventUpdates = registration.selectedEvents.map(event => 
              Event.findByIdAndUpdate(event.eventId, {
                $inc: { registrationCount: 1 }
              })
            );
            await Promise.all(eventUpdates);

            // Update workshop statuses atomically
            if (registration.selectedWorkshops?.length) {
              const workshopUpdates = registration.selectedWorkshops.map(workshop =>
                Workshop.findByIdAndUpdate(workshop.workshopId, {
                  $inc: { registrationCount: 1 }
                })
              );
              await Promise.all(workshopUpdates);
            }

            await registration.save();

            // Update student record
            await Student.findByIdAndUpdate(registration.student._id, {
              $addToSet: { registrations: registration._id },
              $set: { cart: [] }
            });
          }

          // Generate signed success params
          const successData = {
            order_id,
            status: 'success',
            amount: paidAmount,
            name: registration.student.name,
            email: registration.student.email,
            timestamp: new Date().toISOString()
          };

          const signature = crypto
            .createHmac('sha256', process.env.HDFC_RESPONSE_KEY)
            .update(JSON.stringify(successData))
            .digest('base64');

          successData.signature = signature;
          
          const successParams = new URLSearchParams(successData).toString();
          redirectUrl = `${process.env.FRONTEND_URL}/payment/success?${successParams}`;

        } catch (error) {
          console.error('Post-payment processing error:', error);
          const errorParams = new URLSearchParams({
            order_id,
            error: error.message,
            timestamp: new Date().toISOString()
          }).toString();
          redirectUrl = `${process.env.FRONTEND_URL}/payment/failure?${errorParams}`;
        }
        break;

      case "PENDING":
      case "PENDING_VBV":
        const pendingParams = new URLSearchParams({
          order_id,
          status: 'pending',
          timestamp: new Date().toISOString()
        }).toString();
        redirectUrl = `${process.env.FRONTEND_URL}/payment/pending?${pendingParams}`;
        break;

      default:
        const failureParams = new URLSearchParams({
          order_id,
          status: 'failed',
          error: responseData.error_message || 'Payment failed',
          timestamp: new Date().toISOString()
        }).toString();
        redirectUrl = `${process.env.FRONTEND_URL}/payment/failure?${failureParams}`;
        break;
    }

    res.redirect(redirectUrl);

  } catch (error) {
    console.error('Payment validation failed:', error);
    
    const errorParams = new URLSearchParams({
      status: 'error',
      message: 'Payment verification failed',  // Generic error for security
      timestamp: new Date().toISOString()
    }).toString();

    redirectUrl = `${process.env.FRONTEND_URL}/payment/failure?${errorParams}`;
    res.redirect(redirectUrl);
  }
});

  // Add this new route to handle payment verification
// In your payment routes
router.all('/payment/verify', async (req, res) => {
    try {
      // Get parameters from either query or body
      const orderId = req.query.order_id || req.body.order_id;
      const status = req.query.status || req.body.status;
      const signature = req.query.signature || req.body.signature;
  
      console.log('Payment verification received:', { orderId, status });
  
      if (status === 'CHARGED') {
        // Get order status from Juspay
        const statusResponse = await juspay.order.status(orderId);
        
        if (statusResponse.status === 'CHARGED') {
          // Find and update registration
          const registration = await Registration.findOne({
            'paymentDetails.orderId': orderId
          });
  
          if (registration) {
            // Update registration status
            registration.paymentStatus = 'completed';
            registration.paymentCompletedAt = new Date();
            
            // Update event statuses
            for (const event of registration.selectedEvents) {
              event.status = 'confirmed';
              await Event.findByIdAndUpdate(event.eventId, {
                $inc: { registrationCount: 1 }
              });
            }
  
            await registration.save();
  
            // Update student record
            await Student.findByIdAndUpdate(registration.student, {
              $addToSet: { registrations: registration._id },
              $set: { cart: [] }
            });
          }
        }
  
        // Redirect to success page with parameters
        res.redirect(`${process.env.FRONTEND_URL}/payment/success?order_id=${orderId}&status=${status}&signature=${signature}`);
      } else {
        // Redirect to failure page with error information
        res.redirect(`${process.env.FRONTEND_URL}/payment/failure?order_id=${orderId}&status=${status}`);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/payment/failure`);
    }
  });
  


  router.post('/payment/webhook', express.json(), async (req, res) => {
    try {
      const webhookData = req.body;
      console.log('Webhook received:', webhookData);
  
      // For Juspay webhooks
      if (webhookData.event_name === 'ORDER_SUCCEEDED') {
        const orderData = webhookData.content.order;
        const orderId = orderData.order_id;
  
        const registration = await Registration.findOne({
          'paymentDetails.orderId': orderId
        }).populate('student');
  
        if (registration && !registration.qrCode?.dataUrl) {
          try {
            // Validate payment data
            await paymentSecurity.validatePaymentResponse(webhookData, registration);
  
            // Store transaction data
            registration.paymentDetails.transactionId = orderData.txn_id;
            registration.paymentDetails.paymentMethod = orderData.payment_method;
            registration.paymentStatus = 'completed';
            registration.paymentCompletedAt = new Date();
  
            // Generate QR code
            const qrCodeDataUrl = await generateQRCode({
              userId: registration.student.kindeId,
              selectedEvents: registration.selectedEvents,
              selectedWorkshops: registration.selectedWorkshops || []
            });
  
            // Store QR code data
            registration.qrCode = {
              dataUrl: qrCodeDataUrl,
              generatedAt: new Date(),
              metadata: {
                events: registration.selectedEvents.map(e => e.eventId.toString()),
                workshops: (registration.selectedWorkshops || []).map(w => w.workshopId.toString())
              }
            };
  
            // Update event statuses
            for (const event of registration.selectedEvents) {
              event.status = 'confirmed';
              await Event.findByIdAndUpdate(event.eventId, {
                $inc: { registrationCount: 1 }
              });
            }
  
            // Update workshop statuses
            if (registration.selectedWorkshops?.length) {
              for (const workshop of registration.selectedWorkshops) {
                workshop.status = 'confirmed';
                await Workshop.findByIdAndUpdate(workshop.workshopId, {
                  $inc: { registrationCount: 1 }
                });
              }
            }
  
            await registration.save();
  
            // Update student record
            await Student.findByIdAndUpdate(registration.student._id, {
              $addToSet: { registrations: registration._id },
              $set: { cart: [] }
            });
  
            // Send confirmation email
            // if (!registration.emailNotification?.confirmationSent) {
            //   await sendConfirmationEmail(
            //     registration.student.email,
            //     registration.qrCode.dataUrl,
            //     {
            //       name: registration.student.name,
            //       combo: registration.paymentDetails.merchantParams || {},
            //       amount: registration.amount,
            //       transactionId: orderId
            //     }
            //   );
  
            //   registration.emailNotification = {
            //     confirmationSent: true,
            //     attempts: (registration.emailNotification?.attempts || 0) + 1
            //   };
            //   await registration.save();
            // }
          } catch (error) {
            console.error('Payment processing error:', error);
          }
        }
      }
  
      // Always acknowledge webhook
      res.status(200).json({
        success: true,
        message: 'Webhook processed successfully'
      });
  
    } catch (error) {
      console.error('Webhook handling error:', error);
      res.status(200).json({
        success: false,
        error: error.message
      });
    }
  });


// Add payment verification endpoint
// In your payment routes file
router.post('/payment/verify', async (req, res) => {
    try {
      const { orderId, status, signature } = req.body;
  
      // Get Juspay status
      const statusResponse = await juspay.order.status(orderId);
  
      if (statusResponse.status === 'CHARGED') {
        // Find registration
        const registration = await Registration.findOne({
          'paymentDetails.orderId': orderId
        });
  
        if (registration) {
          // Update registration status
          registration.paymentStatus = 'completed';
          registration.paymentCompletedAt = new Date();
          
          // Update event statuses
          for (const event of registration.selectedEvents) {
            event.status = 'confirmed';
            await Event.findByIdAndUpdate(event.eventId, {
              $inc: { registrationCount: 1 }
            });
          }
  
          await registration.save();
  
          // Update student record
          await Student.findByIdAndUpdate(registration.student, {
            $addToSet: { registrations: registration._id },
            $set: { cart: [] }
          });
        }
  
        res.json({
          success: true,
          message: 'Payment verified successfully'
        });
      } else {
        throw new Error('Payment not successful');
      }
  
    } catch (error) {
      console.error('Payment verification failed:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });

 


  
// Get registration details with security verification
router.get('/registrations/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const registration = await Registration.findOne({
      'paymentDetails.orderId': orderId
    }).populate('student');

    if (!registration) {
      throw new Error('Registration not found');
    }

    // Return complete payment details
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
          customerDetails: registration.paymentDetails.customerDetails,
          merchantParams: registration.paymentDetails.merchantParams
        }
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


// not only the  payment status ,but also the order id ,name ,amount should be sent
  router.get('/payment/status/:orderId', async (req, res) => {
    try {
      const { orderId } = req.params;
  
      const registration = await Registration.findOne({
        'paymentDetails.orderId': orderId
      });
  
      if (!registration) {
        throw new Error('Registration not found');
      }
  
      res.json({
        success: true,
        status: registration.paymentStatus,
        registrationId: registration._id
      });
  
    } catch (error) {
      console.error('Payment status check failed:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

export default router;