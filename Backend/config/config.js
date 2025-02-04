import dotenv from 'dotenv';

dotenv.config();

const config = {
  server: {
    port: process.env.PORT || 4000,
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  },
  database: {
    uri: process.env.MONGODB_URI
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE || '7d'
  },
  payment: {
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID,
      keySecret: process.env.RAZORPAY_KEY_SECRET
    },
    phonepe: {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      saltKey: process.env.PHONEPE_SALT_KEY,
      saltIndex: process.env.PHONEPE_SALT_INDEX
    }
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  kinde: {
    clientId: process.env.KINDE_CLIENT_ID,
    clientSecret: process.env.KINDE_CLIENT_SECRET,
    issuerUrl: process.env.KINDE_ISSUER_URL,
    redirectUrl: process.env.KINDE_REDIRECT_URL,
    postLogoutUrl: process.env.KINDE_POST_LOGOUT_URL
  }
};

export default config;
