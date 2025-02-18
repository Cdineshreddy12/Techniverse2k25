import crypto from 'crypto';

class PaymentSecurityService {
  constructor(responseKey) {
    this.responseKey = responseKey;
  }

  verifySignature(params) {
    try {
      // Handle Juspay webhook format
      if (params.event_name && params.content?.order) {
        const orderData = params.content.order;
        return ['CHARGED', 'SUCCESS'].includes(orderData.status);
      }
  
      // Handle payment response format
      const { signature, status, order_id } = params;
      if (!signature) {
        return status === 'CHARGED';
      }
  
      // For Juspay format signature
      const dataToVerify = `status=${status}&order_id=${order_id}`;
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

  generateParameterString(params) {
    try {
      return Object.entries(params)
        .map(([key, value]) => `${key}=${value}`)
        .sort()
        .join('&');
    } catch (error) {
      console.error('Error generating parameter string:', error);
      return '';
    }
  }

  async validatePaymentResponse(webhookData, registration) {
    try {
      const orderData = webhookData.content?.order || webhookData;
      
      const validations = [
        // Amount validation
        {
          check: () => this.validateAmount(orderData.amount, registration.amount),
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

  validateAmount(webhookAmount, registrationAmount) {
    return Math.abs(parseFloat(webhookAmount) - parseFloat(registrationAmount)) < 0.01;
  }
}

export default PaymentSecurityService;