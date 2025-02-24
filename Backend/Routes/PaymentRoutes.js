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
        const requestCartIds = cartItems.map(item => item.id.toString()).sort();

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
        const rguktsklmRegex = /@rguktsklm\.ac\.in$/i;
        const isRGUKTStudent = rguktsklmRegex.test(studentEmail);
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


// Payment initiation route
router.post('/payment/initiate', detectTampering, async (req, res) => {
  try {
      const { student, packageConfig, verifiedPrice, cartValidation } = req.validatedData;

      const result = await withTransaction(async (session) => {
          const timestamp = Date.now().toString(36);
          const userIdSuffix = student.kindeId.slice(-4);
          const orderId = `ord_${timestamp}_${userIdSuffix}`;

          // Create registration record within transaction
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
              selectedWorkshops: (student.workshops || []).map(workshop => ({
                  workshopId: workshop.id,
                  workshopName: workshop.title,
                  status: 'pending'
              })),
              amount: verifiedPrice,
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
                      verificationData: cartValidation
                  }
              }
          }], { session });

          // Create Razorpay order
          const razorpayOrder = await razorpay.orders.create({
              amount: verifiedPrice * 100,
              currency: 'INR',
              receipt: orderId.slice(0, 40),
              notes: {
                  kindeId: student.kindeId,
                  packageId: packageConfig.id,
                  email: student.email
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
      res.status(500).json({
          success: false,
          error: error.message || 'Failed to initiate payment'
      });
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

      if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
          throw new Error('Invalid payment signature');
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
              throw new Error('Payment already processed');
          }

          // Verify payment amount
          const payment = await razorpay.payments.fetch(razorpay_payment_id);
          const paidAmount = payment.amount / 100;

          // Generate QR code
          const qrCodeDataUrl = await generateQRCode({
              userId: registration.student.kindeId,
              selectedEvents: registration.selectedEvents,
              selectedWorkshops: registration.selectedWorkshops,
              verificationHash: crypto
                  .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
                  .update(`${registration.student.kindeId}:${razorpay_order_id}:${paidAmount}`)
                  .digest('base64')
          });

          // Update registration within transaction
          registration.paymentStatus = 'completed';
          registration.paymentCompletedAt = new Date();
          registration.paymentDetails.razorpayPaymentId = razorpay_payment_id;
          registration.paymentDetails.razorpaySignature = razorpay_signature;
          registration.paymentDetails.paymentMethod = payment.method;
          registration.qrCode = {
              dataUrl: qrCodeDataUrl,
              generatedAt: new Date(),
              metadata: {
                  events: registration.selectedEvents.map(e => e.eventId.toString()),
                  workshops: (registration.selectedWorkshops || []).map(w => w.workshopId.toString()),
                  verificationData: {
                      amount: paidAmount,
                      paymentId: razorpay_payment_id,
                      timestamp: new Date()
                  }
              }
          };

          // Update events and workshops atomically within transaction
          const eventUpdates = registration.selectedEvents.map(event => {
              event.status = 'completed';
              return Event.findByIdAndUpdate(
                  event.eventId,
                  { $inc: { registrationCount: 1 } },
                  { session }
              );
          });

          const workshopUpdates = registration.selectedWorkshops?.map(workshop => {
              workshop.status = 'completed';
              return Workshop.findByIdAndUpdate(
                  workshop.workshopId,
                  { $inc: { registrationCount: 1 } },
                  { session }
              );
          }) || [];

          // Update student record within transaction
          await Student.findByIdAndUpdate(
              registration.student._id,
              {
                  $addToSet: { registrations: registration._id },
                  $set: { cart: [] }
              },
              { session }
          );

          // Execute all updates
          await Promise.all([
              registration.save({ session }),
              ...eventUpdates,
              ...workshopUpdates
          ]);

          return registration;
      });

      // Send confirmation email after transaction is committed
      // await sendConfirmationEmail(
      //     result.student.email,
      //     result.qrCode.dataUrl,
      //     {
      //         name: result.student.name,
      //         registrationType: result.paymentDetails.merchantParams.comboName,
      //         amount: result.amount,
      //         transactionId: result.paymentDetails.razorpayPaymentId
      //     }
      // );

      res.json({
          success: true,
          registration: {
              orderId: result.paymentDetails.orderId,
              amount: result.amount,
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

        // Generate QR code
        const qrCodeDataUrl = await generateQRCode({
          userId: registration.student.kindeId,
          selectedEvents: registration.selectedEvents,
          selectedWorkshops: registration.selectedWorkshops,
          verificationHash: crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
            .update(`${registration.student.kindeId}:${orderData.order_id}:${orderData.amount}`)
            .digest('base64')
        });

        // Store QR code
        registration.qrCode = {
          dataUrl: qrCodeDataUrl,
          generatedAt: new Date(),
          metadata: {
            events: registration.selectedEvents.map(e => e.eventId.toString()),
            workshops: (registration.selectedWorkshops || []).map(w => w.workshopId.toString()),
            verificationData: {
              amount: orderData.amount / 100, // Convert from paise to rupees
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

        // Update workshop statuses and counts atomically
        const workshopUpdatePromises = (registration.selectedWorkshops || []).map(workshop => {
          workshop.status = 'completed';
          return Workshop.findByIdAndUpdate(
            workshop.workshopId,
            {
              $inc: { registrationCount: 1 },
              $addToSet: { registeredStudents: registration.student._id }
            },
            { session, new: true }
          );
        });

        // Update student record atomically
        const studentUpdatePromise = Student.findByIdAndUpdate(
          registration.student._id,
          {
            $addToSet: { 
              registrations: registration._id,
              events: { $each: registration.selectedEvents.map(e => e.eventId) },
              workshops: { $each: (registration.selectedWorkshops || []).map(w => w.workshopId) }
            },
            $set: { cart: [] }
          },
          { session, new: true }
        );

        // Execute all updates atomically
        await Promise.all([
          registration.save({ session }),
          ...eventUpdatePromises,
          ...workshopUpdatePromises,
          studentUpdatePromise
        ]);

        // Send confirmation email after successful transaction
        // try {
        //   await sendConfirmationEmail(
        //     registration.student.email,
        //     qrCodeDataUrl,
        //     {
        //       name: registration.student.name,
        //       registrationType: registration.paymentDetails.merchantParams?.comboName || 'Standard Registration',
        //       amount: registration.amount,
        //       transactionId: orderData.id,
        //       selectedEvents: registration.selectedEvents,
        //       selectedWorkshops: registration.selectedWorkshops
        //     }
        //   );
        // } catch (emailError) {
        //   console.error('Failed to send confirmation email:', emailError);
        //   // Don't throw error here as payment is already processed
        // }
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

      // Process new events
      if (newEvents && newEvents.length > 0) {
        const eventUpdates = newEvents.map(event => {
          const eventId = event.id;
          const eventName = event.eventInfo?.title;
          
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

      // Process new workshops
      if (newWorkshops && newWorkshops.length > 0) {
        const workshopUpdates = newWorkshops.map(workshop => ({
          workshopId: workshop.id,
          workshopName: workshop.title,
          status: 'completed'
        }));

        const existingWorkshopIds = new Set(
          registration.selectedWorkshops.map(w => w.workshopId.toString())
        );

        const newWorkshopUpdates = workshopUpdates.filter(update => {
          const isNew = !existingWorkshopIds.has(update.workshopId.toString());
          console.log(`Workshop ${update.workshopId} is new: ${isNew}`);
          return isNew;
        });

        if (newWorkshopUpdates.length > 0) {
          const workshopPromises = newWorkshopUpdates.map(workshop =>
            Workshop.findByIdAndUpdate(
              workshop.workshopId,
              { 
                $inc: { registrationCount: 1 },
                $addToSet: { registeredStudents: registration.student._id }
              },
              { session, new: true }
            ).exec()
          );

          registration.selectedWorkshops.push(...newWorkshopUpdates);
          await Promise.all(workshopPromises);
        }
      }

      // Update student record
      if (newEvents.length > 0 || newWorkshops.length > 0) {
        await Student.findByIdAndUpdate(
          registration.student._id,
          {
            $addToSet: {
              events: { $each: newEvents.map(e => e.id) },
              workshops: { $each: (newWorkshops || []).map(w => w.id) }
            }
          },
          { session }
        ).exec();
      }

      // Generate new QR code using the existing generateQRCode function
      const qrCodeDataUrl = await generateQRCode({
        userId: registration.student.kindeId,
        selectedEvents: registration.selectedEvents,
        selectedWorkshops: registration.selectedWorkshops,
        orderId: registration.paymentDetails.razorpayOrderId,
        paymentId: registration.paymentDetails.razorpayPaymentId,
        amount: registration.amount
      });

      // Update QR code in registration
      registration.qrCode = {
        dataUrl: qrCodeDataUrl,
        generatedAt: new Date(),
        validUntil: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)),
        metadata: {
          events: registration.selectedEvents.map(e => e.eventId.toString()),
          workshops: (registration.selectedWorkshops || []).map(w => w.workshopId.toString()),
          verificationData: {
            orderId: registration.paymentDetails.razorpayOrderId,
            paymentId: registration.paymentDetails.razorpayPaymentId,
            amount: registration.amount,
            timestamp: new Date()
          }
        }
      };

      // Save registration with new QR code
      await registration.save({ session });

      console.log('Final events count:', registration.selectedEvents.length);
      
      return registration;
    });

    // Send detailed response
    res.json({ 
      success: true,
      registration: {
        eventsCount: result.selectedEvents.length,
        workshopsCount: result.selectedWorkshops.length,
        updatedAt: result.updatedAt,
        events: result.selectedEvents.map(e => ({
          id: e.eventId,
          name: e.eventName,
          status: e.status
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

export default router;