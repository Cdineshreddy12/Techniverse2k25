import express from 'express'
import { Student } from '../Models/StudentSchema.js'
import { Registration } from '../Models/RegistrationSchema.js'
import crypto from 'crypto'
import QRCode from 'qrcode';
const router =express.Router()
// QR code generation function remains the same
export const generateQRCode = async (data) => {
  try {
    // Create the data object that will be signed
    const dataToSign = {
      id: data.userId,
      events: data.selectedEvents.map(e => e.id),    // All events in one QR
      workshops: data.selectedWorkshops.map(w => w.id) // All workshops in one QR
    };

    // Generate signature using the QR_SECRET
    const signature = crypto
      .createHmac('sha256', process.env.QR_SECRET)
      .update(JSON.stringify(dataToSign))
      .digest('hex');

    // Combine data with signature and timestamp
    const qrData = JSON.stringify({
      ...dataToSign,
      signature,
      timestamp: new Date().toISOString()
    });

    const qrCodeOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 1.0,
      margin: 1,
      width: 300
    };

    return await QRCode.toDataURL(qrData, qrCodeOptions);
  } catch (error) {
    console.error('QR Generation Error:', error);
    throw error;
  }
};

router.post('/validate-qr', async (req, res) => {
  try {
    const { qrData } = req.body;
    const parsedData = JSON.parse(qrData);

    // Recreate the same data structure used in generation
    const dataToSign = {
      id: parsedData.id,
      events: parsedData.events,
      workshops: parsedData.workshops
    };

    // Generate signature the same way
    const expectedSignature = crypto
      .createHmac('sha256', process.env.QR_SECRET)
      .update(JSON.stringify(dataToSign))  // Using the same structure as generation
      .digest('hex');

    if (parsedData.signature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code signature'
      });
    }

    const registration = await Registration.findOne({ userId: parsedData.id });
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.json({
      success: true,
      registration: {
        name: registration.name,
        events: registration.selectedEvents,
        workshops: registration.selectedWorkshops,
        college: registration.college
      }
    });

  } catch (error) {
    console.error('QR Validation Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'QR code validation failed' 
    });
  }
});

export default router;