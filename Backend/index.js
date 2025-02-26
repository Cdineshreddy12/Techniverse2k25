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
import { kindeMiddleware } from './KindeAuth.js';
import { Student } from './Models/StudentSchema.js';
import QRRoutes from './Routes/QRRoutes.js'
import exportRoutes from './Routes/ExportRoutes.js'
import newRoutes from './Routes/newRoutes.js'
import PaymentRoutes from './Routes/PaymentRoutes.js'
import path from "path"
import { fileURLToPath } from "url";
import workshopRoutes from './Routes/workShopRoutes.js'
import offlineRoutes from './Routes/OfflineRegistrationRoutes.js'
import { connectToDatabase } from './utils/dbConfig.js';
import excelExportRoutes from './Routes/excelExportRoutes.js'
import offlineExportRoutes from './Routes/OfflineExports.js'
// import OfflineRegistrationRoutes from './Routes/offlineRegistrations.js'
// Load environment variables
dotenv.config();

// Initialize express app
const app = express();



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


const verifyEmailAddress = async (emailAddress) => {
  try {
    const command = new VerifyEmailIdentityCommand({
      EmailAddress: emailAddress
    });
    
    const response = await sesClient.send(command);
    console.log(`Verification email sent to: ${emailAddress}`, response);
    return response;
  } catch (error) {
    console.error(`Email verification error for ${emailAddress}:`, error);
    throw error;
  }
};


// verifyEmailAddress('reddycdinesh41@gmail.com');


// Database connection
// MongoDB connection options
await connectToDatabase();

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Request logging
const corsOptions = {
  origin: true, // Temporarily allow all origins while testing
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Coordinator-ID', 'X-Coordinator-Name']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));


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
app.use('/api',workshopRoutes);
app.use('/api/offline',offlineRoutes);
app.use('/api', excelExportRoutes);
app.use('/api/registrations', offlineExportRoutes );
// app.use('/api',OfflineRegistrationRoutes);


const fixSelectedWorkshops = async () => {
  try {
    // Find all registrations with QR code workshops but empty selectedWorkshops array
    const registrationsToFix = await Registration.find({
      'qrCode.metadata.workshops': { $exists: true, $ne: [] },
      'selectedWorkshops': { $size: 0 }
    });

    console.log(`Found ${registrationsToFix.length} registrations to fix`);

    for (const registration of registrationsToFix) {
      // Get workshop IDs from QR code metadata
      const workshopIds = registration.qrCode.metadata.workshops || [];
      
      if (workshopIds.length === 0) {
        console.log(`Registration ${registration._id} has no workshops in QR metadata`);
        continue;
      }

      // Add workshops to selectedWorkshops array
      for (const workshopId of workshopIds) {
        registration.selectedWorkshops.push({
          workshopId: workshopId,
          status: 'completed', // Assume completed since it's in the QR
        });
      }

      // Save the updated registration
      await registration.save();
      console.log(`Fixed registration ${registration._id} with ${workshopIds.length} workshops`);
    }

    console.log('Fix completed');
  } catch (error) {
    console.error('Error fixing registrations:', error);
  }
};

// To run this function, you would call:
// fixSelectedWorkshops();


export const sendConfirmationEmail = async (email, qrCode, data) => {
  try {
    // Handle different types of identifiers for QR upload
    const identifier = data.transactionId || data.receiptNumber || `TV-${Date.now()}`;
    const qrCodeUrl = await uploadQRCodeToCloudinary(qrCode, identifier);
    const senderEmail = process.env.SENDER_EMAIL || 'reddycdinesh41@gmail.com';

    // Standardize registration details
    const registrationDetails = {
      name: data.name,
      package: data.registrationType || (data.combo ? data.combo.comboName || data.combo.name : 'Not Specified'),
      amount: data.amount || data.registrationFee || 0,
      identifier: data.transactionId || data.receiptNumber || 'Not Available',
      events: data.selectedEvents || [],
      workshops: data.selectedWorkshops || []
    };

    // Format events and workshops list if available
    const eventsHtml = registrationDetails.events.length 
      ? `<li><span>Events:</span> ${registrationDetails.events.map(e => e.eventName || e.name).join(', ')}</li>` 
      : '';
    
    const workshopsHtml = registrationDetails.workshops.length 
      ? `<li><span>Workshops:</span> ${registrationDetails.workshops.map(w => w.workshopName || w.name).join(', ')}</li>` 
      : '';

    const command = new SendEmailCommand({
      Source: senderEmail,
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: {
          Data: data.isUpdate 
            ? '🔄 Updated Registration - Techniverse 2025'
            : '🎉 Welcome to Techniverse 2025!'
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
                    <p style="color: #94a3b8;">
                      ${data.isUpdate 
                        ? 'Your registration has been updated! Here are your new details.'
                        : 'Your registration for Techniverse 2025 has been confirmed! Get ready for an amazing tech fest experience.'}
                    </p>
                    
                    <div class="details">
                      <h2>Registration Details</h2>
                      <ul>
                        <li><span>Package:</span> ${registrationDetails.package}</li>
                        <li><span>Amount:</span> ₹${registrationDetails.amount}</li>
                        <li><span>ID:</span> ${registrationDetails.identifier}</li>
                        ${eventsHtml}
                        ${workshopsHtml}
                      </ul>
                    </div>

                    <div class="qr-code">
                      <h3>Your Event Access Pass</h3>
                      <img src="${qrCodeUrl}" alt="QR Code">
                      <p style="color: #e2e8f0;">Scan for seamless check-in at all your registered events.</p>
                    </div>

                    <div class="notice">
                      🎯 Important: Save this QR code and present it during event check-ins. 
                      This is your unique identifier for all registered events and workshops.
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