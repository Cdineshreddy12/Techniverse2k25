import crypto from 'crypto';
import QRCode from 'qrcode';
import { OfflineRegistration } from '../Models/offlineRegistration.js';

// Generate a unique secure key for each registration
const generateSecureKey = (registrationData) => {
  const data = `${registrationData.studentId}-${registrationData.receiptNumber}-${registrationData.timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

export const generateOfflineQRCode = async (registrationData) => {
    try {
      const timestamp = new Date().toISOString();
      const secureKey = generateSecureKey({ ...registrationData, timestamp });
  
      // Create signed data with both events and workshops
      const dataToSign = {
        type: 'offline',
        receiptNumber: registrationData.receiptNumber,
        studentId: registrationData.studentId,
        secureKey,
        timestamp,
        events: (registrationData.selectedEvents || []).map(e => ({
          id: e.eventId.toString(),
          name: e.eventName,
          type: 'event'
        })),
        workshops: (registrationData.selectedWorkshops || []).map(w => ({
          id: w.workshopId.toString(),
          name: w.workshopName,
          type: 'workshop'
        }))
      };
  
      // Rest of the function remains same
      const signature = crypto
        .createHmac('sha256', process.env.OFFLINE_QR_SECRET)
        .update(JSON.stringify(dataToSign))
        .digest('hex');
  
      const qrData = {
        ...dataToSign,
        signature
      };
  
      const qrImage = await QRCode.toDataURL(JSON.stringify(qrData), {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 1.0,
        margin: 1,
        width: 300
      });
  
      return { qrImage, secureKey };
    } catch (error) {
      console.error('Offline QR Generation Error:', error);
      throw error;
    }
  };

export const verifyOfflineQR = async (qrData) => {
  try {
    const parsedData = JSON.parse(qrData);
    const { signature, ...dataToVerify } = parsedData;

    // Verify QR type
    if (dataToVerify.type !== 'offline') {
      throw new Error('Invalid QR type. Expected offline registration.');
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.OFFLINE_QR_SECRET)
      .update(JSON.stringify(dataToVerify))
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new Error('Invalid QR signature');
    }

    // Check for QR expiration (24 hours)
    const qrTime = new Date(dataToVerify.timestamp);
    const now = new Date();
    if ((now - qrTime) > 24 * 60 * 60 * 1000) {
      throw new Error('QR code has expired');
    }

    // Find registration
    const registration = await OfflineRegistration.findOne({
      receiptNumber: dataToVerify.receiptNumber,
      studentId: dataToVerify.studentId,
      secureKey: dataToVerify.secureKey
    });

    if (!registration) {
      throw new Error('Invalid registration');
    }

    return {
      isValid: true,
      data: {
        registration,
        events: dataToVerify.events
      }
    };
  } catch (error) {
    return {
      isValid: false,
      error: error.message
    };
  }
};