// config/juspayConfig.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Juspay } from 'expresscheckout-nodejs';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const validateEnvironmentVariables = () => {
    const requiredVars = [
        'HDFC_MERCHANT_ID',
        'HDFC_API_KEY',
        'HDFC_KEY_UUID',
        'HDFC_PAYMENT_PAGE_CLIENT_ID'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Log environment variables for debugging (excluding sensitive values)
    console.log('Environment variables validated:', {
        merchantId: process.env.HDFC_MERCHANT_ID,
        keyUuid: process.env.HDFC_KEY_UUID,
        hasApiKey: !!process.env.HDFC_API_KEY,
        environment: process.env.NODE_ENV || 'development'
    });
};

const readPEMFile = (filename) => {
    try {
        const filePath = path.join(__dirname, '..', filename);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        if (!fileContent.includes('-----BEGIN') || !fileContent.includes('-----END')) {
            throw new Error(`Invalid PEM format in ${filename}`);
        }
        
        console.log(`Successfully read ${filename}. Length: ${fileContent.length}`);
        return fileContent;
    } catch (error) {
        throw new Error(`Error reading ${filename}: ${error.message}`);
    }
};

const initializeJuspay = () => {
    try {
        // Validate environment variables first
        validateEnvironmentVariables();

        // Read PEM files with validation
        const publicKey = readPEMFile('public.pem');
        const privateKey = readPEMFile('privateKey.pem');

        const baseUrl = process.env.NODE_ENV === 'production'
            ? "https://smartgateway.hdfcbank.com"
            : "https://smartgatewayuat.hdfcbank.com";

        // Log configuration (excluding sensitive data)
        console.log('Initializing Juspay with config:', {
            merchantId: process.env.HDFC_MERCHANT_ID,
            baseUrl,
            environment: process.env.NODE_ENV || 'development',
            keyId: process.env.HDFC_KEY_UUID,
            publicKeyLength: publicKey.length,
            privateKeyLength: privateKey.length
        });

        // Create Juspay instance with proper configuration
        const juspay = new Juspay({
            merchantId: process.env.HDFC_MERCHANT_ID,
            apiKey: process.env.HDFC_API_KEY,
            baseUrl,
            jweAuth: {
                keyId: process.env.HDFC_KEY_UUID,
                publicKey,
                privateKey
            }
        });

        console.log('Juspay initialized successfully');
        return juspay;

    } catch (error) {
        console.error('Juspay initialization error:', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        throw error;
    }
};

export default initializeJuspay;