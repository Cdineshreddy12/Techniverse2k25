import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import API_CONFIG from '../config/api';

const PaymentHandler = ({ sessionData, onClose }) => {
  const razorpayLoaded = useRef(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionData) return;

    // Step 1: Create a fresh order instead of using the possibly problematic one
    const createFreshOrder = async () => {
      try {
      
        
        // Extract original order details
        const originalOrderId = sessionData?.paymentDetails?.razorpayDetails?.orderId;
        const baseAmount = sessionData.amount || 0;
        const platformFee = sessionData.platformFee || Math.ceil(baseAmount * 0.02) || 0;
        const totalAmount = sessionData.totalAmount || (baseAmount + platformFee);
        
  
        // Get cart items in the correct format
        const cartItems = sessionData.selectedEvents?.map(event => ({
          eventId: event.eventId || event.id,
          eventName: event.eventName || event.title || '',
          status: 'pending',
          registrationType: 'individual',
          maxTeamSize: 1
        })) || [];
        
        // Create a fresh order through your backend
        const response = await fetch(API_CONFIG.getUrl('payment/initiate'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalAmount,
            baseAmount: baseAmount,
            platformFee: platformFee,
            cartItems: cartItems,
            workshops: sessionData.selectedWorkshops || [],
            kindeId: sessionData.kindeId || sessionData.student?.kindeId,
            combo: sessionData.paymentDetails?.merchantParams?.comboId ? {
              id: sessionData.paymentDetails.merchantParams.comboId,
              name: sessionData.paymentDetails.merchantParams.comboName || "Selected Package",
              price: baseAmount
            } : null,
            timestamp: Date.now(),
            refreshOrder: true
          })
        });
        
        // More detailed error logging
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error response:', errorText);
          throw new Error(`Failed to create fresh order: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success || !data.registration?.paymentDetails?.razorpayDetails?.orderId) {
          console.error('Invalid server response:', data);
          throw new Error('Failed to get a valid order ID from the server');
        }
        
   
        return data.registration;
      } catch (error) {
        console.error('Failed to create fresh order:', error);
        throw error;
      }
    };

    // Step 2: Load Razorpay SDK
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          razorpayLoaded.current = true;
          resolve();
          return;
        }
        
        console.log('Loading Razorpay SDK...');
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        
        script.onload = () => {
          console.log('Razorpay SDK loaded successfully');
          razorpayLoaded.current = true;
          resolve();
        };
        
        script.onerror = () => {
          console.error('Razorpay SDK failed to load');
          setError('Payment system unavailable. Please try again later.');
          if (onClose) onClose();
        };
        
        document.body.appendChild(script);
      });
    };

    // Step 3: Initialize payment with fresh order data
    const initializePayment = async () => {
      try {
        // Show loading indicator
        toast.loading('Preparing payment...', { id: 'payment-loading' });
        
        // Make sure SDK is loaded first
        await loadRazorpayScript();
        if (!razorpayLoaded.current) {
          toast.error('Payment system not available', { id: 'payment-loading' });
          return;
        }
        
        // Create a fresh order to avoid using potentially problematic order IDs
        const freshSessionData = await createFreshOrder();
        
        const paymentDetails = freshSessionData?.paymentDetails || {};
        const customerDetails = paymentDetails?.customerDetails || {};
        const razorpayDetails = paymentDetails?.razorpayDetails || {};
        
        // Get the fresh Razorpay order ID
        const orderIdToUse = razorpayDetails.orderId;
        
        if (!orderIdToUse) {
          throw new Error('Could not get a valid order ID');
        }
        
   
        
        // Extract fee information
        const baseAmount = freshSessionData.amount || 0;
        const platformFee = freshSessionData.platformFee || 0;
        const totalAmount = freshSessionData.totalAmount || 0;
        
     
        // Close loading toast
        toast.dismiss('payment-loading');
        
        // Configure Razorpay options
        const options = {
          key: import.meta.env.VITE_APP_RAZORPAY_KEY_ID,
          amount: totalAmount * 100, // Convert to paise
          currency: "INR",
          name: "Techniverse2k25",
          description: "Event Registration Payment",
          order_id: orderIdToUse,
          handler: function(response) {
            handlePaymentVerification(response, freshSessionData);
          },
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
              if (onClose) onClose();
            }
          }
        };
        
     
        
        const rzp = new window.Razorpay(options);
        
        rzp.on('payment.failed', function (response) {
          console.error('Payment failed:', response.error);
          toast.error(`Payment failed: ${response.error.description}`);
          if (onClose) onClose();
        });
        
        rzp.open();
      } catch (error) {
        console.error('Payment initialization error:', error);
        toast.error(`Payment initialization failed: ${error.message}`, { id: 'payment-loading' });
        setError(error.message);
        if (onClose) onClose();
      }
    };

    // Step 4: Handle payment verification with improved error handling
    const handlePaymentVerification = async (response, sessionDataToUse) => {
      try {
     
        
        // Show loading indicator during verification
        toast.loading('Verifying payment...', { id: 'verify-loading' });
        
        if (!response.razorpay_payment_id || !response.razorpay_order_id || !response.razorpay_signature) {
          console.error('Missing required Razorpay parameters:', response);
          throw new Error('Missing required payment confirmation parameters');
        }
        
        const verifyData = {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature
        };
        
        
        
        const verifyResponse = await fetch(API_CONFIG.getUrl('payment/verify'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(verifyData)
        });
        
        if (!verifyResponse.ok) {
          throw new Error(`Server responded with status: ${verifyResponse.status}`);
        }
        
        const verifyResult = await verifyResponse.json();
      
        
        toast.dismiss('verify-loading');
        
        if (verifyResult.success) {
          toast.success('Payment successful!');
          // Redirect to success page
          window.location.href = `/payment/success?orderId=${sessionDataToUse.paymentDetails.orderId}`;
        } else {
          throw new Error(verifyResult.error || 'Payment verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast.error(`Payment verification failed: ${error.message}`, { id: 'verify-loading' });
        
        // Fall back to checking payment status
        checkPaymentStatus(sessionDataToUse.paymentDetails.orderId);
      }
    };

    // Step 5: Enhanced status check function
    const checkPaymentStatus = async (orderId) => {
      try {
        if (!orderId) {
          console.error('Missing order ID for status check');
          if (onClose) onClose();
          return;
        }
        
        console.log('Checking payment status for order:', orderId);
        toast.loading('Checking payment status...', { id: 'status-check' });
        
        // Wait for webhook processing
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const response = await fetch(API_CONFIG.getUrl(`payment/status/${orderId}`));
        if (!response.ok) {
          throw new Error(`Failed to check payment status: ${response.status}`);
        }
        
        const data = await response.json();
       
        
        toast.dismiss('status-check');
        
        if (data.success && data.status === 'completed') {
          toast.success('Payment confirmed!');
          window.location.href = `/payment/success?orderId=${orderId}`;
        } else {
          window.location.href = `/payment/failure?orderId=${orderId}&error=Payment+verification+failed`;
        }
      } catch (error) {
        console.error('Payment status check failed:', error);
        toast.dismiss('status-check');
        toast.error('Could not verify payment status');
        window.location.href = `/payment/failure?orderId=${orderId}&error=${encodeURIComponent(error.message)}`;
      } finally {
        if (onClose) onClose();
      }
    };

    // Start the payment flow
    initializePayment();

    // Cleanup function
    return () => {
      const script = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      
      // Clear any toast notifications
      toast.dismiss('payment-loading');
      toast.dismiss('verify-loading');
      toast.dismiss('status-check');
    };
  }, [sessionData, onClose]);

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="bg-slate-800 p-6 rounded-lg max-w-md w-full">
          <h3 className="text-xl font-bold text-white mb-2">Payment Error</h3>
          <p className="text-red-400 mb-4">{error}</p>
          <div className="flex justify-end">
            <button 
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No visual rendering during normal operation
  return null;
};

export default PaymentHandler;