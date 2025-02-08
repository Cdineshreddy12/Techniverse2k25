import { Juspay } from 'expresscheckout-nodejs';

// Base URLs
const SANDBOX_BASE_URL = "https://smartgatewayuat.hdfcbank.com";
const PRODUCTION_BASE_URL = "https://smartgateway.hdfcbank.com";

// Configuration for different environments
export const juspayConfig = {
    // Test credentials
    test: {
        merchantId: "YOUR_TEST_MERCHANT_ID",
        paymentPageClientId: "YOUR_TEST_CLIENT_ID",
        keyId: "YOUR_TEST_KEY_ID"
    },
    // Production credentials
    production: {
        merchantId: process.env.HDFC_MERCHANT_ID,
        paymentPageClientId: process.env.HDFC_PAYMENT_PAGE_CLIENT_ID,
        keyId: process.env.HDFC_KEY_ID
    }
};

// Initialize Juspay instance
const initializeJuspay = () => {
    const config = process.env.NODE_ENV === 'production' 
        ? juspayConfig.production 
        : juspayConfig.test;

    const juspay = new Juspay({
        merchantId: config.merchantId,
        baseUrl: process.env.NODE_ENV === 'production' ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL
    });

    return juspay;
};

export default initializeJuspay;