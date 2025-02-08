import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import { SESClient, SendEmailCommand, VerifyEmailIdentityCommand } from "@aws-sdk/client-ses";

// import paymentRoutes from './Routes/PaymentRoutes.js';
import eventRoutes from './Routes/eventRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import DepartmentRoutes from './Routes/DepartmentRoutes.js'
import { Registration } from './Models/RegistrationSchema.js';
import { v2 as cloudinary } from 'cloudinary';
import AWS from 'aws-sdk';   
import analysisRoutes from './Routes/analysis.js'
import { Buffer } from 'buffer';
import cartRoutes from './Routes/CartRoutes.js'
import comboRoutes from './Routes/comboRoutes.js'
import RegistrationRoutes from './Routes/Registration.js'

import { Student } from './Models/StudentSchema.js';
import QRRoutes from './Routes/QRRoutes.js'
import exportRoutes from './Routes/ExportRoutes.js'
import newRoutes from './Routes/newRoutes.js'
import PaymentRoutes from './Routes/PaymentRoutes.js'
import path from "path"
import { fileURLToPath } from "url";
// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Convert __dirname to work with ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, "public")));

app.get("/google65f85b9b14c46c09.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "googleXXXXXXXXXX.html"));
});




AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// aws ses configuration
const sesClient = new SESClient({ 
  region: "us-east-1", // Using N. Virginia region which is commonly available
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// cloudinary 
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Function to upload QR code to Cloudinary
const uploadQRCodeToCloudinary = async (qrCodeDataUrl, transactionId) => {
  try {
    const uploadResponse = await cloudinary.uploader.upload(qrCodeDataUrl, {
      folder: 'techniverse-qrcodes',
      public_id: `qr-${transactionId}`,
      overwrite: true
    });
    return uploadResponse.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};


const verifySenderEmail = async () => {
  try {
    const command = new VerifyEmailIdentityCommand({
      EmailAddress: 'reddycdinesh41@gmail.com'
    });
    
    const response = await sesClient.send(command);
    console.log('Verification email sent to sender address:', response);
  } catch (error) {
    console.error('Email verification error:', error);
  }
};




// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Techniverse')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Request logging
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Static files serving
app.use('/uploads', express.static('uploads'));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// API routes
// app.use('/api', paymentRoutes);
app.use('/api',eventRoutes);
app.use('/api',DepartmentRoutes);
app.use('/api',analysisRoutes);
app.use('/api', RegistrationRoutes);
app.use('/api',QRRoutes);
app.use('/api',exportRoutes );
app.use('/api',newRoutes);
app.use('/api',cartRoutes);
app.use('/api',comboRoutes);
app.use('/api',PaymentRoutes);
// Send confirmation email
// Verify recipient email
const verifyRecipientEmail = async (recipientEmail) => {
  try {
    const command = new VerifyEmailIdentityCommand({
      EmailAddress: recipientEmail
    });
    
    const response = await sesClient.send(command);
    console.log(`Verification email sent to recipient: ${recipientEmail}`, response);
  } catch (error) {
    console.error('Recipient verification error:', error);
  }
};


export const sendConfirmationEmail = async (email, qrCode, registrationDetails) => {
  try {
    const qrCodeUrl = await uploadQRCodeToCloudinary(qrCode, registrationDetails.transactionId);
    
    const command = new SendEmailCommand({
      Source: 'reddycdinesh41@gmail.com',
      Destination: {
        ToAddresses: [email]
      },
      Message: {
        Subject: {
          Data: '🎉 Welcome to Techniverse 2025!'
        },
        Body: {
          Html: {
            Data: `
              <html>
                <head>
                  <style>
                    body { 
                      margin: 0;
                      padding: 0;
                      background-color: #020617;
                      font-family: Arial, sans-serif;
                    }
                    .container { 
                      max-width: 600px; 
                      margin: 0 auto;
                      background: linear-gradient(to bottom, rgba(56,189,248,0.05), rgba(168,85,247,0.05));
                      padding: 40px 20px;
                      border-radius: 16px;
                      color: #fff;
                    }
                    .header {
                      text-align: center;
                      margin-bottom: 40px;
                    }
                    .title {
                      font-size: 36px;
                      font-weight: bold;
                      background: linear-gradient(to right, #22d3ee, #a855f7);
                      -webkit-background-clip: text;
                      -webkit-text-fill-color: transparent;
                      margin: 0;
                    }
                    .subtitle {
                      color: #0ea5e9;
                      font-size: 18px;
                      margin-top: 8px;
                    }
                    .details {
                      background: rgba(15, 23, 42, 0.6);
                      border: 1px solid rgba(56,189,248,0.3);
                      padding: 24px;
                      border-radius: 12px;
                      margin: 24px 0;
                    }
                    .details h2 {
                      color: #0ea5e9;
                      margin-top: 0;
                      font-size: 24px;
                    }
                    .details ul {
                      list-style: none;
                      padding: 0;
                      margin: 0;
                    }
                    .details li {
                      padding: 12px 0;
                      border-bottom: 1px solid rgba(56,189,248,0.1);
                      color: #e2e8f0;
                    }
                    .details li:last-child {
                      border-bottom: none;
                    }
                    .details span {
                      color: #94a3b8;
                      display: inline-block;
                      width: 120px;
                    }
                    .qr-code {
                      text-align: center;
                      margin: 32px 0;
                      padding: 32px;
                      background: rgba(15, 23, 42, 0.6);
                      border: 1px solid rgba(168,85,247,0.3);
                      border-radius: 12px;
                    }
                    .qr-code h3 {
                      color: #a855f7;
                      font-size: 24px;
                      margin-top: 0;
                    }
                    .qr-code img {
                      max-width: 200px;
                      width: 100%;
                      padding: 16px;
                      background: white;
                      border-radius: 8px;
                      margin: 16px 0;
                    }
                    .notice {
                      background: rgba(56,189,248,0.1);
                      border-left: 4px solid #0ea5e9;
                      padding: 16px;
                      margin: 24px 0;
                      color: #94a3b8;
                      font-size: 14px;
                    }
                    .footer {
                      text-align: center;
                      margin-top: 40px;
                      padding-top: 20px;
                      border-top: 1px solid rgba(56,189,248,0.2);
                      color: #94a3b8;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1 class="title">TECHNIVERSE 2025</h1>
                      <p class="subtitle">Where Innovation Meets Excellence</p>
                    </div>

                    <p style="color: #e2e8f0;">Dear ${registrationDetails.name},</p>
                    <p style="color: #94a3b8;">Your registration for Techniverse 2025 has been confirmed! Get ready for an amazing tech fest experience.</p>
                    
                    <div class="details">
                      <h2>Registration Details</h2>
                      <ul>
                        <li><span>Package:</span> ${registrationDetails.combo.name}</li>
                        <li><span>Amount:</span> ₹${registrationDetails.amount}</li>
                        <li><span>Transaction ID:</span> ${registrationDetails.transactionId}</li>
                      </ul>
                    </div>

                    <div class="qr-code">
                      <h3>Your Event Access Pass</h3>
                      <img src="${qrCodeUrl}" alt="QR Code">
                      <p style="color: #e2e8f0;">Scan for seamless check-in at all your registered events.</p>
                    </div>

                    <div class="notice">
                      🎯 Important: Save this QR code and present it during event check-ins. This is your unique identifier for all registered events and workshops.
                    </div>

                    <div class="footer">
                      <p>Best regards,<br>Team Techniverse</p>
                      <div style="color: #64748b; font-size: 12px; margin-top: 16px;">
                        © 2025 Techniverse. All rights reserved.
                      </div>
                    </div>
                  </div>
                </body>
              </html>
            `
          }
        }
      }
    });

    const response = await sesClient.send(command);
    console.log('Email sent successfully:', response.MessageId);
    return response;

  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

app.post('/api/payment-callback', async (req, res) => {
  try {
    const { transactionId, paymentStatus } = req.body;
    console.log('Processing payment callback:', { transactionId, paymentStatus });

    // Find registration and populate student data
    const registration = await Registration.findOne({ transactionId })
      .populate('student');
      
    if (!registration) {
      throw new Error('Registration not found');
    }

    registration.paymentStatus = paymentStatus;
    registration.updatedAt = new Date();

    if (paymentStatus === 'completed') {
      console.log('Payment successful, generating QR code...');
      
      // Generate QR code with student and registration data
      const qrCode = await generateQRCode({
        userId: registration.student.kindeId,
        studentId: registration.student._id,
        registrationId: registration._id,
        selectedEvents: registration.selectedEvents,
        selectedWorkshops: registration.selectedWorkshops
      });

      registration.qrCode = qrCode;
      await registration.save();

      // Send confirmation email
      await sendConfirmationEmail(
        registration.student.email,
        qrCode,
        {
          name: registration.student.name,
          combo: registration.combo,
          amount: registration.amount,
          transactionId: registration.transactionId
        }
      );
    }

    res.json({ 
      success: true,
      message: 'Payment processed successfully'
    });

  } catch (error) {
    console.error('Payment Callback Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Payment callback processing failed: ' + error.message 
    });
  }
});

// Utility function to get registration details
app.get('/api/registration/:registrationId', async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.registrationId)
      .populate('student');
      
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
    console.error('Registration Fetch Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch registration details: ' + error.message 
    });
  }
});

app.get('/health', async (req, res) => {
  try {
    // Add MongoDB connection check
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date(),
      services: {
        database: dbStatus,
        server: 'running'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});



app.post('/api/initiate-payment', async (req, res) => {
  try {
    const {
      kindeId,  // User's Kinde ID from authentication
      combo,
      selectedEvents,
      selectedWorkshops
    } = req.body;

    console.log('Received payment initiation request:', {
      kindeId,
      combo,
      eventCount: selectedEvents?.length,
      workshopCount: selectedWorkshops?.length
    });

    // Find the student using kindeId
    const student = await Student.findOne({ kindeId });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found. Please complete registration first.'
      });
    }

    // Generate unique transaction ID
    const merchantTransactionId = 'TXN' + Date.now() + Math.random().toString(36).slice(2, 8).toUpperCase();

    // Format events and workshops for registration
    const formattedEvents = selectedEvents.map(event => ({
      eventId: event.id,
      eventName: event.name,
      status: 'pending'
    }));

    const formattedWorkshops = selectedWorkshops.map(workshop => ({
      workshopId: workshop.id,
      workshopName: workshop.name,
      status: 'pending'
    }));

    // Create new registration
    const registration = new Registration({
      student: student._id,  // Link to student document
      combo: {
        id: combo.id,
        name: combo.name,
        price: combo.price,
        description: combo.description
      },
      selectedEvents: formattedEvents,
      selectedWorkshops: formattedWorkshops,
      paymentStatus: 'pending',
      transactionId: merchantTransactionId,
      amount: combo.price,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Created registration object:', registration);

    // Save the registration
    const savedRegistration = await registration.save();

    // Add registration to student's registrations array
    student.registrations.push(savedRegistration._id);
    await student.save();

    console.log('Registration saved and linked to student:', {
      studentId: student._id,
      registrationId: savedRegistration._id
    });

    // Return success response
    res.json({
      success: true,
      transactionId: merchantTransactionId,
      message: 'Registration initiated successfully',
      registrationId: savedRegistration._id
    });

  } catch (error) {
    console.error('Payment Initiation Error:', {
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({ 
      success: false, 
      error: 'Payment initiation failed: ' + error.message 
    });
  }
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(false, () => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});