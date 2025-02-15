// routes/paymentRoutes.js
import express from 'express';
import { Juspay } from 'expresscheckout-nodejs';
import { Student } from '../Models/StudentSchema.js';
import { Registration } from '../Models/RegistrationSchema.js';
import Event from '../Models/eventModel.js';
import Workshop from '../Models/workShopModel.js';
import PaymentSecurityService from '../PaymentSecurity.js';
import dotenv from 'dotenv';
import { generateQRCode } from './QRRoutes.js';
import { sendConfirmationEmail } from '../index.js';
import initializeJuspay from '../config/justpayconfig.js';
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

  // Create return URL using the request object
  const returnUrl = `${process.env.BASE_URL}/api/payment/handleResponse`;

// Payment initiation
router.post('/payment/initiate', async (req, res) => {
    try {
      const { amount, cartItems, combo, kindeId } = req.body;
  
      const student = await Student.findOne({ kindeId });
      if (!student) {
        throw new Error('Student not found');
      }
  
      // Create registration
      const registration = await Registration.create({
        student: student._id,
        kindeId,
        selectedEvents: (cartItems || []).map(item => ({
          eventId: item.id,
          eventName: item.title || '',
          status: 'pending',
          registrationType: 'individual',
          maxTeamSize: 1
        })),
        amount: combo.price,
        paymentStatus: 'pending',
        paymentInitiatedAt: new Date(),
        paymentDetails: {
          customerDetails: {
            name: student.name,
            email: student.email,
            phone: student.mobileNumber
          },
          merchantParams: {
            comboId: combo.id,
            comboName: combo.name,
            features: combo.features
          }
        }
      });
  
      const orderId = `order_${Date.now()}_${kindeId}`;
      await Registration.findByIdAndUpdate(registration._id, {
        'paymentDetails.orderId': orderId
      });
  
      // Create session with proper status handling
      const sessionResponse = await juspay.orderSession.create({
        order_id: orderId,
        amount: amount ,
        payment_page_client_id: process.env.HDFC_PAYMENT_PAGE_CLIENT_ID,
        customer_id: kindeId,
        action: 'paymentPage',
        return_url: returnUrl,
        webhook_url: `${process.env.BASE_URL}/api/payment/webhook`,
        currency: 'INR',
        customer_email: student.email,
        customer_phone: student.mobileNumber,
        customer_name: student.name,
        merchant_params: {
          registration_id: registration._id.toString(),
          student_id: student._id.toString(),
          combo_id: combo.id
        }
      });
  
      console.log('Payment session created:', {
        orderId,
        return_url: `${process.env.FRONTEND_URL}/api/payment/success`,
        webhook_url: `${process.env.BASE_URL}/api/payment/webhook`
      });
  
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


  // Handle payment response
  router.all('/payment/handleResponse', async (req, res) => {
    try {
        const orderId = req.body.order_id || req.query.order_id;
        console.log('Payment response received:', { orderId, body: req.body });

        if (!orderId) {
            throw new Error('order_id not present or cannot be empty');
        }

        // Get payment status from Juspay
        const statusResponse = await juspay.order.status(orderId);
        const orderStatus = statusResponse.status;

        // Find registration and populate student data
        const registration = await Registration.findOne({
            'paymentDetails.orderId': orderId
        }).populate('student');

        if (!registration) {
            throw new Error('Registration not found');
        }

        let redirectUrl;

        switch (orderStatus) {
            case "CHARGED":
                try {
                    // Update registration
                    registration.paymentStatus = 'completed';
                    registration.paymentCompletedAt = new Date();
                    
                    // Generate QR code
                    const qrCodeDataUrl = await generateQRCode({
                        userId: registration.student.kindeId,
                        selectedEvents: registration.selectedEvents,
                        selectedWorkshops: registration.selectedWorkshops || []
                    });
                    
                    // Store QR code data properly
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

                    // Update workshop statuses if any
                    if (registration.selectedWorkshops) {
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
                    await sendConfirmationEmail(
                        registration.student.email,
                        registration.qrCode.dataUrl,
                        {
                            name: registration.student.name,
                            combo: registration.paymentDetails.merchantParams || {},
                            amount: registration.amount,
                            transactionId: orderId
                        }
                    );

                    redirectUrl = `${process.env.FRONTEND_URL}/payment/success?order_id=${orderId}`;
                } catch (error) {
                    console.error('Post-payment processing error:', error);
                    redirectUrl = `${process.env.FRONTEND_URL}/payment/success?order_id=${orderId}&email_error=true`;
                }
                break;

            case "PENDING":
            case "PENDING_VBV":
                redirectUrl = `${process.env.FRONTEND_URL}/payment/pending?order_id=${orderId}`;
                break;

            default:
                redirectUrl = `${process.env.FRONTEND_URL}/payment/failure?order_id=${orderId}`;
                break;
        }

        res.redirect(redirectUrl);

    } catch (error) {
        console.error('Payment response handling failed:', error);
        res.redirect(`${process.env.FRONTEND_URL}/payment/failure`);
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
  


// Webhook handler with proper event handling
router.post('/payment/webhook', express.json(), async (req, res) => {
  try {
      console.log('Webhook received:', req.body);

      const event = req.body;
      let orderId;
      let status;

      if (event.event_name === 'TXN_CHARGED' || event.event_name === 'ORDER_SUCCEEDED') {
          orderId = event.content.order?.order_id || event.content.txn?.order_id;
          status = 'CHARGED';

          const registration = await Registration.findOne({
              'paymentDetails.orderId': orderId
          }).populate('student');

          if (registration && !registration.qrCode?.dataUrl) {
              try {
                  // Generate QR code
                  const qrCodeDataUrl = await generateQRCode({
                      userId: registration.student.kindeId,
                      selectedEvents: registration.selectedEvents,
                      selectedWorkshops: registration.selectedWorkshops || []
                  });

                  // Store QR code data properly
                  registration.qrCode = {
                      dataUrl: qrCodeDataUrl,
                      generatedAt: new Date(),
                      metadata: {
                          events: registration.selectedEvents.map(e => e.eventId.toString()),
                          workshops: (registration.selectedWorkshops || []).map(w => w.workshopId.toString())
                      }
                  };

                  registration.paymentStatus = 'completed';
                  registration.paymentCompletedAt = new Date();

                  // Update event and workshop statuses
                  for (const event of registration.selectedEvents) {
                      event.status = 'confirmed';
                  }
                  if (registration.selectedWorkshops) {
                      for (const workshop of registration.selectedWorkshops) {
                          workshop.status = 'confirmed';
                      }
                  }

                  await registration.save();

                  // Send confirmation email if not already sent
                  if (!registration.emailNotification?.confirmationSent) {
                      await sendConfirmationEmail(
                          registration.student.email,
                          registration.qrCode.dataUrl,
                          {
                              name: registration.student.name,
                              combo: registration.paymentDetails.merchantParams || {},
                              amount: registration.amount,
                              transactionId: orderId
                          }
                      );
                  }
              } catch (error) {
                  console.error('Webhook QR/Email processing error:', error);
              }
          }
      }

      res.status(200).json({
          success: true,
          message: 'Webhook processed successfully'
      });

  } catch (error) {
      console.error('Webhook processing error:', error);
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