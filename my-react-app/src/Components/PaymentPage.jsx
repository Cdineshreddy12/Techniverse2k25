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

    // Extract fee information
    const baseAmount = sessionData.amount || 0;
    const platformFee = sessionData.platformFee || Math.ceil(baseAmount * 0.02) || 0;
    const totalAmount = sessionData.totalAmount || (baseAmount + platformFee);

    console.log('Payment amounts:', { baseAmount, platformFee, totalAmount });

    const handlePaymentVerification = async (response) => {
      try {
        console.log('Payment Response:', response); // Debug log

        // IMPORTANT FIX: Check each property individually with more detailed logging
        if (!response.razorpay_payment_id) {
          console.error('Missing razorpay_payment_id in response:', response);
        }
        
        if (!response.razorpay_order_id) {
          console.error('Missing razorpay_order_id in response:', response);
        }
        
        if (!response.razorpay_signature) {
          console.error('Missing razorpay_signature in response:', response);
        }

        // If any are missing, but we have at least a payment ID or order ID, we can still try to verify
        if ((!response.razorpay_payment_id && !response.razorpay_order_id) || 
            (response.razorpay_payment_id && response.razorpay_order_id && !response.razorpay_signature)) {
          throw new Error('Missing required Razorpay parameters');
        }

        // Prepare verification data with fallbacks for any missing fields
        const verifyData = {
          razorpay_payment_id: response.razorpay_payment_id || '',
          razorpay_order_id: response.razorpay_order_id || razorpayDetails.orderId || '',
          razorpay_signature: response.razorpay_signature || ''
        };

        console.log('Sending verification data:', verifyData);

        const verifyResponse = await fetch(API_CONFIG.getUrl('payment/verify'), {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(verifyData)
        });

        if (!verifyResponse.ok) {
          const errorText = await verifyResponse.text();
          throw new Error(`Server responded with status ${verifyResponse.status}: ${errorText}`);
        }

        const verifyResult = await verifyResponse.json();
        console.log('Verify Response:', verifyResult); // Debug log

        if (verifyResult.success) {
          toast.success('Payment successful!');
          // Use state parameter for React Router
          window.location.href = `/payment/success?orderId=${paymentDetails.orderId}`;
        } else {
          throw new Error(verifyResult.error || 'Verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast.error(`Payment verification failed: ${error.message}`);
        
        // IMPORTANT: Instead of immediately redirecting to failure page,
        // check payment status before redirecting
        checkPaymentStatus(paymentDetails.orderId);
      } finally {
        if (onClose) onClose();
      }
    };

    // Add this function to check payment status before showing error
    const checkPaymentStatus = async (orderId) => {
      try {
        if (!orderId) {
          window.location.href = '/payment/failure?error=Missing+order+ID';
          return;
        }
        
        console.log('Checking payment status for order:', orderId);
        
        // Wait a moment for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check payment status from your API
        const response = await fetch(API_CONFIG.getUrl(`payment/status/${orderId}`));
        const data = await response.json();
        
        console.log('Payment status check result:', data);
        
        // If payment is completed according to backend, redirect to success
        if (data.success && data.status === 'completed') {
          toast.success('Payment successful!');
          window.location.href = `/payment/success?orderId=${orderId}`;
        } else {
          // Otherwise redirect to failure
          window.location.href = `/payment/failure?orderId=${orderId}&error=Payment+verification+failed`;
        }
      } catch (error) {
        console.error('Payment status check failed:', error);
        window.location.href = `/payment/failure?orderId=${orderId}&error=${encodeURIComponent(error.message)}`;
      }
    };

    const options = {
      key: import.meta.env.VITE_APP_RAZORPAY_KEY_ID,
      amount: totalAmount * 100, // Convert to paise (including platform fee)
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
      notes: {
        orderId: paymentDetails.orderId,
        baseAmount: baseAmount,
        platformFee: platformFee
      },
      terms: {
        show: true,
        privacyPolicy: {
          url: `${window.location.origin}/privacy-policy`
        },
        termsAndConditions: {
          url: `${window.location.origin}/terms-and-conditions`
        },
        shippingPolicy: {
          url: `${window.location.origin}/shipping-policy`  
        },
        cancellationPolicy: {
          url: `${window.location.origin}/cancellation-policy`
        }
      },
      modal: {
        ondismiss: function() {
          toast.error('Payment cancelled');
          window.location.href = `/payment/failure?orderId=${paymentDetails.orderId}&error=cancelled`;
          if (onClose) onClose();
        }
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
        toast.error(`Payment failed: ${response.error.description}`);
        window.location.href = `/payment/failure?orderId=${paymentDetails.orderId}&error=${encodeURIComponent(response.error.description)}`;
        if (onClose) onClose();
      });

      rzp.open();
    } catch (error) {
      console.error('Razorpay initialization error:', error);
      toast.error(`Failed to initialize payment: ${error.message}`);
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