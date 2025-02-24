import React, { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import API_CONFIG from '../config/api';

const PaymentHandler = ({ sessionData, onClose }) => {
  useEffect(() => {
    if (!sessionData) return;

    console.log('Session Data:', sessionData);

    const paymentDetails = sessionData?.paymentDetails || {};
    const customerDetails = paymentDetails?.customerDetails || {};
    const razorpayDetails = paymentDetails?.razorpayDetails || {};

    const handlePaymentVerification = async (response) => {
      try {
        console.log('Payment Response:', response); // Debug log

        const verifyResponse = await fetch(API_CONFIG.getUrl('payment/verify'), {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          })
        });

        const verifyData = await verifyResponse.json();
        console.log('Verify Response:', verifyData); // Debug log

        if (verifyData.success) {
          toast.success('Payment successful!');
          // Use state parameter for React Router
          window.location.href = `/payment/success?orderId=${paymentDetails.orderId}`;
        } else {
          throw new Error(verifyData.error || 'Verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast.error('Payment verification failed');
        window.location.href = `/payment/failure?orderId=${paymentDetails.orderId}&error=${encodeURIComponent(error.message)}`;
      } finally {
        if (onClose) onClose();
      }
    };

    const options = {
      key: import.meta.env.VITE_APP_RAZORPAY_KEY_ID,
      amount: (paymentDetails.amount || 0) * 100, // Convert to paise
      currency: "INR",
      name: "Techniverse2k25",
      description: "Event Registration Payment",
      order_id: razorpayDetails.orderId,
      handler: handlePaymentVerification,
      prefill: {
        name: customerDetails.name || '',
        email: customerDetails.email || '',
        contact: customerDetails.phone || ''
      },
      theme: {
        color: "#7e22ce"
      },
      modal: {
        ondismiss: function() {
          toast.error('Payment cancelled');
          window.location.href = `/payment/failure?orderId=${paymentDetails.orderId}&error=cancelled`;
          if (onClose) onClose();
        }
      },
      notes: {
        orderId: paymentDetails.orderId
      }
    };

    console.log('Razorpay Options:', options);

    try {
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded');
      }

      const rzp = new window.Razorpay(options);
      
      // Add payment events
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        toast.error('Payment failed. Please try again.');
        window.location.href = `/payment/failure?orderId=${paymentDetails.orderId}&error=${encodeURIComponent(response.error.description)}`;
        if (onClose) onClose();
      });

      rzp.open();
    } catch (error) {
      console.error('Razorpay initialization error:', error);
      toast.error('Failed to initialize payment');
      window.location.href = `/payment/failure?orderId=${paymentDetails.orderId}&error=initialization_failed`;
      if (onClose) onClose();
    }

  }, [sessionData]);

  if (!sessionData) {
    console.error('No session data provided');
    return null;
  }

  return null;
};

export default PaymentHandler;