// config/juspayConfig.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Juspay } from 'expresscheckout-nodejs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const initializeJuspay = () => {
    try {
        // Read PEM files from local pem directory
        const publicKey = fs.readFileSync(path.join(__dirname, '..', 'pem', 'public.pem'), 'utf8');
        const privateKey = fs.readFileSync(path.join(__dirname, '..', 'pem', 'privateKey.pem'), 'utf8');

        const juspay = new Juspay({
            merchantId: process.env.HDFC_MERCHANT_ID,
            apiKey: process.env.HDFC_API_KEY,
            baseUrl: process.env.NODE_ENV === 'production'
                ? "https://smartgateway.hdfcbank.com"
                : "https://smartgatewayuat.hdfcbank.com",
            jweAuth: {
                keyId: process.env.HDFC_KEY_UUID,
                publicKey,
                privateKey
            }
        });

        return juspay;
    } catch (error) {
        console.error('Juspay initialization error:', error);
        throw error;
    }
};

export default initializeJuspay;