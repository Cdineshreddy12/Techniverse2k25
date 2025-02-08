import dotenv from 'dotenv';
dotenv.config();

export const hdfcConfig = {
  merchantId: process.env.HDFC_MERCHANT_ID,
  accessCode: process.env.HDFC_ACCESS_CODE,
  workingKey: process.env.HDFC_WORKING_KEY,
  redirectUrl: process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com/api/payment/callback'
    : 'http://localhost:5000/api/payment/callback',
  cancelUrl: process.env.NODE_ENV === 'production'
    ? 'https://your-domain.com/api/payment/cancel'
    : 'http://localhost:5000/api/payment/cancel'
};