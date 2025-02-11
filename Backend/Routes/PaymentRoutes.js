// routes/paymentRoutes.js
import express from 'express';
import { Juspay } from 'expresscheckout-nodejs';
import { Student } from '../Models/StudentSchema.js';
import { Registration } from '../Models/RegistrationSchema.js';
import Event from '../Models/eventModel.js';
import dotenv from 'dotenv'
import PaymentSecurityService from '../PaymentSecurity.js';
dotenv.config();
const paymentSecurity = new PaymentSecurityService(process.env.HDFC_RESPONSE_KEY);
const router = express.Router();

console.log('Merchant ID:', process.env.HDFC_MERCHANT_ID);
console.log('API Key:', process.env.HDFC_API_KEY);

const SANDBOX_BASE_URL = "https://smartgateway.hdfcbank.com";
// Initialize Juspay
const juspay = new Juspay({
  merchantId:process.env.HDFC_MERCHANT_ID ,
  apiKey: process.env.HDFC_API_KEY,
  baseUrl: SANDBOX_BASE_URL 
});

// Test endpoint to verify Juspay initialization
router.get('/payment/test', (req,res) => {
  try {
      res.json({
          success: true,
          message: 'Payment gateway initialized successfully',
          environment: process.env.NODE_ENV,
          merchantId: juspay.merchantId
      });
  } catch (error) {
      res.status(500).json({
          success: false,
          error: error.message
      });
  }
});


router.post('/payment/initiate', async (req, res) => {
  try {
      const { amount, cartItems, kindeId } = req.body;

      // Validate student exists and get their MongoDB _id
      const student = await Student.findOne({ kindeId });
      if (!student) {
          return res.status(404).json({
              success: false,
              error: 'Student not found'
          });
      }

      // Create registration records using student._id instead of kindeId
      const registrations = await Promise.all(cartItems.map(async item => {
          // Check if event exists and has slots
          const event = await Event.findById(item.eventInfo.id);
          if (!event) {
              throw new Error(`Event ${item.eventInfo.title} not found`);
          }
          
          if (event.registrationCount >= event.maxRegistrations) {
              throw new Error(`Event ${item.eventInfo.title} is full`);
          }

          return Registration.create({
              student: student._id, // Use MongoDB _id instead of kindeId
              selectedEvents: [{
                  eventId: item.eventInfo.id,
                  eventName: item.eventInfo.title,
                  status: 'pending',
                  registrationType: event.registrationType,
                  maxTeamSize: event.details.maxTeamSize || 1
              }],
              amount: item.registration.fee,
              paymentStatus: 'pending',
              kindeId: kindeId // Store kindeId as a separate field if needed
          });
      }));

      const orderId = `order_${Date.now()}_${kindeId}`;

      // Create Juspay session
      const sessionResponse = await juspay.orderSession.create({
          order_id: orderId,
          amount: amount,
          payment_page_client_id: process.env.HDFC_PAYMENT_PAGE_CLIENT_ID,
          customer_id: kindeId,
          action: 'paymentPage',
          return_url: `${process.env.FRONTEND_URL}/payment/success`,
          webhook_url: `${process.env.BASE_URL}/api/payment/webhook`,
          currency: 'INR',
          customer_email: student.email,
          customer_phone: student.mobileNumber,
          customer_name: student.name,
          merchant_params: {
              registration_ids: registrations.map(reg => reg._id).join('_'),
              student_id: student._id.toString()
          }
      });

      // Remove undefined fields
      Object.keys(sessionResponse).forEach(key => 
          sessionResponse[key] === undefined && delete sessionResponse[key]
      );

      res.json({
          success: true,
          sessionData: sessionResponse
      });

  } catch (error) {
      console.error('Payment initiation failed:', error);
      res.status(500).json({
          success: false,
          error: error.message
      });
  }
});


// 2. Payment Callback (Client-side redirect)
router.post('/payment/callback', async (req, res) => {
    try {
        const orderId = req.body.order_id;
        if (!orderId) {
            throw new Error('Order ID not found');
        }

        const statusResponse = await juspay.order.status(orderId);

        // Redirect based on status
        switch (statusResponse.status) {
            case "CHARGED":
                res.redirect('/payment/success');
                break;
            case "PENDING":
            case "PENDING_VBV":
                res.redirect('/payment/pending');
                break;
            default:
                res.redirect('/payment/failure');
        }

    } catch (error) {
        console.error('Payment callback failed:', error);
        res.redirect('/payment/error');
    }
});


// Update the webhook route
router.post('/payment/webhook', async (req, res) => {
    let session;
    try {
        // 1. Verify signature
        if (!paymentSecurity.verifySignature(req.body)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid signature'
            });
        }

        // 2. Get registration from order ID
        const registration = await Registration.findOne({
            'paymentDetails.orderId': req.body.order_id
        });

        if (!registration) {
            throw new Error('Registration not found');
        }

        // 3. Validate payment response
        await paymentSecurity.validatePaymentResponse(req.body, registration);

        // 4. Start transaction session
        session = await mongoose.startSession();
        session.startTransaction();

        // 5. Transform and update payment details
        const webhookData = paymentSecurity.transformWebhookData(req.body);
        await registration.handleWebhook(webhookData);

        // 6. Process successful payment
        if (webhookData.status === 'CHARGED') {
            // Update event registrations
            for (const event of registration.selectedEvents) {
                await Event.findByIdAndUpdate(
                    event.eventId,
                    { $inc: { registrationCount: 1 } },
                    { session }
                );
            }

            // Update student registrations
            await Student.findOneAndUpdate(
                { kindeId: registration.kindeId },
                { 
                    $addToSet: { registrations: registration._id },
                    // Clear cart after successful payment
                    $set: { 
                        cart: [],
                        workshops: []
                    }
                },
                { session }
            );

            // Set payment completion timestamp
            registration.paymentCompletedAt = new Date();
            await registration.save({ session });
        }

        // 7. Commit transaction
        await session.commitTransaction();

        // 8. Send response
        res.json({
            success: true,
            message: 'Payment processed successfully',
            status: webhookData.status
        });

    } catch (error) {
        // Rollback transaction if exists
        if (session) {
            await session.abortTransaction();
        }

        console.error('Webhook processing failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    } finally {
        if (session) {
            session.endSession();
        }
    }
});

// 4. Check Payment Status
router.get('/payment/status/:orderId', async (req, res) => {
    try {
        const statusResponse = await juspay.order.status(req.params.orderId);
        res.json({
            success: true,
            status: statusResponse
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 5. Verify Payment
router.post('/payment/verify', async (req, res) => {
    try {
        const { orderId, transactionId } = req.body;
        const statusResponse = await juspay.order.status(orderId);

        if (statusResponse.txn_id !== transactionId) {
            throw new Error('Transaction ID mismatch');
        }

        res.json({
            success: true,
            verified: statusResponse.status === "CHARGED"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 6. Get Registration Details
router.get('/payment/registration/:registrationId', async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.registrationId)
            .populate('selectedEvents.eventId')
            .populate('student', 'name email mobileNumber');

        if (!registration) {
            return res.status(404).json({
                success: false,
                error: 'Registration not found'
            });
        }

        res.json({
            success: true,
            registration
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 7. Cancel Payment
router.post('/payment/cancel/:orderId', async (req, res) => {
    try {
        const statusResponse = await juspay.order.status(req.params.orderId);
        
        if (statusResponse.status === "PENDING" || statusResponse.status === "PENDING_VBV") {
            // Cancel Juspay order if possible
            // Note: Add your cancellation logic here based on HDFC's documentation

            // Update registrations
            const registrationIds = statusResponse.merchant_params.registration_ids.split('_');
            await Registration.updateMany(
                { _id: { $in: registrationIds } },
                { 
                    paymentStatus: 'cancelled',
                    updatedAt: new Date()
                }
            );
        }

        res.json({
            success: true,
            message: 'Payment cancelled successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;