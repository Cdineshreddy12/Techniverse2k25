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

    // Create session data
    const sessionData = {
      order_id: orderId,
      amount: amount,
      payment_page_client_id: process.env.HDFC_PAYMENT_PAGE_CLIENT_ID,
      customer_id: kindeId,
      action: 'paymentPage',
      return_url: `${process.env.BASE_URL}/api/payment/handleResponse`,
      webhook_url: `${process.env.BASE_URL}/api/payment/webhook`,
      currency: 'INR',
      customer_email: student.email,
      customer_phone: student.mobileNumber,
      customer_name: student.name,
      timestamp: new Date().toISOString()
    };

    // Create Juspay session directly without additional signing
    const sessionResponse = await juspay.orderSession.create(sessionData);

    console.log('Payment session created:', {
      orderId,
      return_url: sessionData.return_url,
      webhook_url: sessionData.webhook_url
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

router.all('/payment/handleResponse', async (req, res) => {
  let redirectUrl;

  try {
    const responseData = { ...req.body, ...req.query };
    const orderId = responseData.order_id;

    console.log('Payment response received:', { orderId, responseData });

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

    switch (orderStatus) {
      case "CHARGED":
        try {
          if (!registration.qrCode?.dataUrl) {
            // Update registration
            registration.paymentStatus = 'completed';
            registration.paymentCompletedAt = new Date();
            registration.paymentDetails.transactionId = statusResponse.txn_id;
            registration.paymentDetails.paymentMethod = statusResponse.payment_method;
            
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
          }

          // Create success params
          const successParams = new URLSearchParams({
            order_id: orderId,
            status: 'success',
            amount: registration.amount,
            name: registration.student.name,
            email: registration.student.email,
            timestamp: new Date().toISOString()
          }).toString();

          redirectUrl = `${process.env.FRONTEND_URL}/payment/success?${successParams}`;

        } catch (error) {
          console.error('Post-payment processing error:', error);
          const errorParams = new URLSearchParams({
            order_id: orderId,
            error: 'Payment processed but email failed',
            timestamp: new Date().toISOString()
          }).toString();
          redirectUrl = `${process.env.FRONTEND_URL}/payment/success?${errorParams}`;
        }
        break;

      case "PENDING":
      case "PENDING_VBV":
        const pendingParams = new URLSearchParams({
          order_id: orderId,
          status: 'pending',
          timestamp: new Date().toISOString()
        }).toString();
        redirectUrl = `${process.env.FRONTEND_URL}/payment/pending?${pendingParams}`;
        break;

      default:
        const failureParams = new URLSearchParams({
          order_id: orderId,
          status: 'failed',
          error: responseData.error_message || 'Payment failed',
          timestamp: new Date().toISOString()
        }).toString();
        redirectUrl = `${process.env.FRONTEND_URL}/payment/failure?${failureParams}`;
        break;
    }

    res.redirect(redirectUrl);

  } catch (error) {
    console.error('Payment response handling failed:', error);
    
    const errorParams = new URLSearchParams({
      status: 'error',
      message: error.message,
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

 
  router.get('/registration/status/:kindeId', async (req, res) => {
    try {
      const { kindeId } = req.params;
  
      // Find the student
      const student = await Student.findOne({ kindeId });
      if (!student) {
        return res.json({
          success: true,
          hasCompletedRegistration: false
        });
      }
  
      // Check for completed registration
      const completedRegistration = await Registration.findOne({
        student: student._id,
        paymentStatus: 'completed'
      });
  
      // Return status
      res.json({
        success: true,
        hasCompletedRegistration: !!completedRegistration,
        registrationDetails: completedRegistration ? {
          id: completedRegistration._id,
          orderId: completedRegistration.paymentDetails?.orderId,
          amount: completedRegistration.amount,
          paymentStatus: completedRegistration.paymentStatus,
          selectedEvents: completedRegistration.selectedEvents,
          selectedWorkshops: completedRegistration.selectedWorkshops
        } : null
      });
  
    } catch (error) {
      console.error('Registration status check failed:', error);
      res.status(500).json({
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


  // In paymentRoutes.js, add this new route:
router.post('/registration/update', async (req, res) => {
  try {
    const { kindeId, newEvents, newWorkshops } = req.body;

    // Find the student
    const student = await Student.findOne({ kindeId });
    if (!student) {
      throw new Error('Student not found');
    }

    // Find the existing completed registration
    const existingRegistration = await Registration.findOne({
      student: student._id,
      paymentStatus: 'completed'
    });

    if (!existingRegistration) {
      throw new Error('No completed registration found');
    }

    // Add new events to the registration
    const updatedEvents = [
      ...existingRegistration.selectedEvents,
      ...(newEvents || []).map(event => ({
        eventId: event.id,
        eventName: event.title,
        status: 'confirmed',
        registrationType: 'individual',
        maxTeamSize: 1
      }))
    ];

    // Add new workshops
    const updatedWorkshops = [
      ...existingRegistration.selectedWorkshops,
      ...(newWorkshops || []).map(workshop => ({
        workshopId: workshop.id,
        workshopName: workshop.title,
        status: 'confirmed'
      }))
    ];

    // Generate new QR code with updated event list
    const qrCodeDataUrl = await generateQRCode({
      userId: student.kindeId,
      selectedEvents: updatedEvents,
      selectedWorkshops: updatedWorkshops
    });

    // Update the registration
    existingRegistration.selectedEvents = updatedEvents;
    existingRegistration.selectedWorkshops = updatedWorkshops;
    existingRegistration.qrCode = {
      dataUrl: qrCodeDataUrl,
      generatedAt: new Date(),
      metadata: {
        events: updatedEvents.map(e => e.eventId.toString()),
        workshops: updatedWorkshops.map(w => w.workshopId.toString())
      }
    };

    await existingRegistration.save();

    // Update event registration counts
    for (const event of newEvents || []) {
      await Event.findByIdAndUpdate(event.id, {
        $inc: { registrationCount: 1 }
      });
    }

    // Update workshop registration counts
    for (const workshop of newWorkshops || []) {
      await Workshop.findByIdAndUpdate(workshop.id, {
        $inc: { registrationCount: 1 }
      });
    }

    // Clear the student's cart
    await Student.findByIdAndUpdate(student._id, {
      $set: { cart: [], workshops: [] }
    });

    // // Send updated confirmation email
    // await sendConfirmationEmail(
    //   student.email,
    //   qrCodeDataUrl,
    //   {
    //     name: student.name,
    //     combo: existingRegistration.paymentDetails.merchantParams,
    //     amount: existingRegistration.amount,
    //     transactionId: existingRegistration.paymentDetails.orderId,
    //     isUpdate: true
    //   }
    // );

    res.json({
      success: true,
      message: 'Registration updated successfully',
      qrCode: qrCodeDataUrl
    });

  } catch (error) {
    console.error('Registration update failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


export default router;