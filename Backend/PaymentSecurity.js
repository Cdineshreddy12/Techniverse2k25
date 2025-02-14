import crypto from 'crypto';

class PaymentSecurityService {
  constructor(responseKey) {
    this.responseKey = responseKey;
  }

  // Core signature verification
  verifySignature(params) {
    try {
      const { signature, signature_algorithm, ...otherParams } = params;
      
      if (!signature) {
        throw new Error('Signature is missing');
      }

      const stringToHash = this.generateParameterString(otherParams);
      const calculatedSignature = crypto
        .createHmac('sha256', this.responseKey)
        .update(stringToHash)
        .digest('hex');
      
      return calculatedSignature === decodeURIComponent(signature);
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  generateParameterString(params) {
    return Object.entries(params)
      .map(([key, value]) => ({
        key: encodeURIComponent(key),
        value: encodeURIComponent(value?.toString() || '')
      }))
      .sort((a, b) => a.key.localeCompare(b.key))
      .map(({ key, value }) => `${key}=${value}`)
      .join('&');
  }

  // Payment response validation
  async validatePaymentResponse(webhookData, registration) {
    const validations = [
      // Amount validation
      {
        check: () => this.validateAmount(webhookData.amount, registration.amount),
        message: 'Amount mismatch detected..'
      },
      // Order ID validation
      {
        check: () => webhookData.order_id === registration.paymentDetails?.orderId,
        message: 'Order ID mismatch'
      },
      // Timestamp validation
      {
        check: () => this.validateTransactionTimestamp(webhookData.timestamp),
        message: 'Transaction timestamp is invalid'
      },
      // Duplicate transaction check
      {
        check: () => !registration.paymentDetails?.transactionId || 
                     registration.paymentDetails.transactionId !== webhookData.txn_id,
        message: 'Transaction already processed'
      }
    ];

    for (const validation of validations) {
      if (!validation.check()) {
        throw new Error(validation.message);
      }
    }

    return true;
  }

  validateAmount(webhookAmount, registrationAmount) {
    return Math.abs(parseFloat(webhookAmount) - parseFloat(registrationAmount)) < 0.01;
  }

  validateTransactionTimestamp(timestamp, maxAgeMinutes = 10) {
    if (!timestamp) return false;
    
    const transactionTime = new Date(timestamp).getTime();
    const currentTime = Date.now();
    const maxAge = maxAgeMinutes * 60 * 1000;
    
    return (currentTime - transactionTime) <= maxAge;
  }

  // Webhook data transformation
  transformWebhookData(webhookData) {
    return {
      status: webhookData.status,
      txn_id: webhookData.txn_id,
      payment_method: webhookData.payment_method,
      bank_reference: webhookData.bank_reference,
      response_code: webhookData.response_code,
      response_message: webhookData.response_message,
      customer_details: {
        name: webhookData.customer_name,
        email: webhookData.customer_email,
        phone: webhookData.customer_phone
      },
      merchant_params: webhookData.merchant_params
    };
  }
}

export default PaymentSecurityService;