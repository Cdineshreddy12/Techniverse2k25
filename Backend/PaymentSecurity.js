import crypto from 'crypto';


const PACKAGES = {
  'rgukt-workshop': { price: 199, type: 'rgukt' },
  'rgukt-all-events': { price: 199, type: 'rgukt' },
  'rgukt-combo': { price: 299, type: 'rgukt' },
  'guest-workshop': { price: 499, type: 'guest' },
  'guest-all-events': { price: 499, type: 'guest' },
  'guest-combo': { price: 599, type: 'guest' }
};


class PaymentSecurityService {
  constructor(responseKey) {
    this.responseKey = responseKey;
  }

  verifySignature(params) {
    try {
      // Handle Juspay webhook format
      if (params.event_name && params.content?.order) {
        const orderData = params.content.order;
        
        // Verify webhook signature more strictly
        const webhookSignature = params.signature;
        const calculatedSignature = crypto
          .createHmac('sha256', this.responseKey)
          .update(JSON.stringify(orderData))
          .digest('base64');

        if (webhookSignature !== calculatedSignature) {
          console.error('Webhook signature mismatch');
          return false;
        }

        // Also verify amount against package price
        const packageConfig = PACKAGES[orderData.metadata?.comboId];
        if (!packageConfig || packageConfig.price !== parseFloat(orderData.amount)) {
          console.error('Webhook amount mismatch');
          return false;
        }

        return ['CHARGED', 'SUCCESS'].includes(orderData.status);
      }
  
      // Handle payment response format with strict verification
      const { signature, status, order_id, amount } = params;
      if (!signature || !order_id || !amount) {
        return false;
      }
  
      // Verify all critical parameters
      const dataToVerify = `status=${status}&order_id=${order_id}&amount=${amount}`;
      const calculatedSignature = crypto
        .createHmac('sha256', this.responseKey)
        .update(dataToVerify)
        .digest('base64');
  
      console.log('Signature verification:', {
        received: signature,
        calculated: calculatedSignature,
        dataToVerify
      });
      
      return calculatedSignature === signature;
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  
  async validatePaymentResponse(webhookData, registration) {
    try {
      const orderData = webhookData.content?.order || webhookData;
      
      // Get package config for price verification
      const packageConfig = PACKAGES[registration.paymentDetails.merchantParams.comboId];
      if (!packageConfig) {
        throw new Error('Invalid package configuration');
      }

      const validations = [
        // Strict amount validation against package price
        {
          check: () => Math.abs(parseFloat(orderData.amount) - packageConfig.price) < 0.01,
          message: 'Amount mismatch detected'
        },
        // Order ID validation
        {
          check: () => orderData.order_id === registration.paymentDetails?.orderId,
          message: 'Order ID mismatch'
        },
        // Status validation
        {
          check: () => ['CHARGED', 'SUCCESS'].includes(orderData.status),
          message: 'Invalid payment status'
        },
        // Student type validation
        {
          check: () => {
            const isRGUKTStudent = registration.student.email.toLowerCase().includes('@rgutksklm.ac.in');
            const comboPrefix = registration.paymentDetails.merchantParams.comboId.split('-')[0];
            return isRGUKTStudent ? comboPrefix === 'rgukt' : comboPrefix === 'guest';
          },
          message: 'Invalid student type for package'
        }
      ];

      for (const validation of validations) {
        if (!validation.check()) {
          throw new Error(validation.message);
        }
      }

      return true;
    } catch (error) {
      console.error('Payment validation failed:', error);
      throw error;
    }
  }

  generateSignedData(data) {
    try {
      const timestamp = Date.now();
      const dataToSign = { ...data, timestamp };
      
      const signature = crypto
        .createHmac('sha256', this.responseKey)
        .update(JSON.stringify(dataToSign))
        .digest('base64');

      return {
        ...dataToSign,
        signature
      };
    } catch (error) {
      console.error('Error generating signed data:', error);
      throw error;
    }
  }

  validateAmount(webhookAmount, registrationAmount) {
    // Use exact amount matching for stricter validation
    return parseFloat(webhookAmount) === parseFloat(registrationAmount);
  }
}

export default PaymentSecurityService;