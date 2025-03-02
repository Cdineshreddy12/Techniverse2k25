import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import API_CONFIG from '../config/api';

/**
 * Global payment state manager to prevent multiple payment instances
 * This helps mitigate common Razorpay integration issues
 */
const PaymentState = {
  inProgress: false,
  currentOrderId: null,
  reset() {
    this.inProgress = false;
    this.currentOrderId = null;
    return true;
  },
  start(orderId) {
    if (this.inProgress) return false;
    this.inProgress = true;
    this.currentOrderId = orderId;
    return true;
  }
};

/**
 * PaymentHandler Component
 * Handles Razorpay payment integration with error recovery
 * 
 * @param {Object} sessionData - Payment session data from API
 * @param {Function} onClose - Callback to close payment modal
 */
const PaymentHandler = ({ sessionData, onClose }) => {
  const [error, setError] = useState(null);
  const scriptLoaded = useRef(false);
  const paymentInitiated = useRef(false);
  const isMounted = useRef(true);
  
  // Reset state on mount
  useEffect(() => {
    console.log('Payment handler initialized');
    PaymentState.reset();
    cleanupRazorpayElements();
    
    return () => {
      isMounted.current = false;
      PaymentState.reset();
      cleanupRazorpayElements();
    };
  }, []);
  
  /**
   * Clean up any Razorpay elements in the DOM
   * This helps prevent issues with multiple payment attempts
   */
  const cleanupRazorpayElements = () => {
    // Remove Razorpay UI elements
    const razorpayElements = document.querySelectorAll(
      '.razorpay-container, .razorpay-backdrop, .razorpay-checkout-frame, iframe[name^="razorpay"]'
    );
    
    razorpayElements.forEach(el => {
      try {
        el.parentNode.removeChild(el);
      } catch (e) {
        console.error('Failed to remove Razorpay element', e);
      }
    });
    
    // Remove Razorpay scripts
    document.querySelectorAll('script[src*="razorpay"]').forEach(script => {
      try {
        script.parentNode.removeChild(script);
      } catch (e) {
        console.error('Failed to remove Razorpay script', e);
      }
    });
  };
  
  // Main payment flow
  useEffect(() => {
    // Skip if already initiated or no session data
    if (!sessionData || paymentInitiated.current || PaymentState.inProgress) {
      return;
    }
    
    paymentInitiated.current = true;
    PaymentState.start();
    
    /**
     * Main payment flow initialization
     * 1. Create a fresh order
     * 2. Load Razorpay SDK
     * 3. Create payment options
     * 4. Open payment modal
     */
    const initializePayment = async () => {
      try {
        // Step 1: Create fresh order
        toast.loading('Preparing payment...', { id: 'payment-loading' });
        const freshSessionData = await createFreshOrder();
        if (!isMounted.current) return;
        
        // Step 2: Load Razorpay script
        await loadRazorpayScript();
        if (!isMounted.current) return;
        
        if (!window.Razorpay) {
          throw new Error('Payment system unavailable');
        }
        
        // Step 3: Setup payment options
        const options = createRazorpayOptions(freshSessionData);
        
        toast.dismiss('payment-loading');
        
        // Step 4: Initialize payment with delay to ensure proper setup
        setTimeout(() => {
          if (!isMounted.current) return;
          
          try {
            const rzp = new window.Razorpay(options);
            
            // Handle payment failures
            rzp.on('payment.failed', function(response) {
              if (isMounted.current) {
                console.error('Payment failed:', response.error?.code, response.error?.description);
                toast.error(`Payment failed: ${response.error?.description || 'Unknown error'}`);
                PaymentState.reset();
                if (onClose) onClose();
              }
            });
            
            // Open payment modal
            rzp.open();
          } catch (error) {
            console.error('Failed to open payment modal:', error);
            if (isMounted.current) {
              toast.error('Failed to initialize payment');
              setError(error.message);
              PaymentState.reset();
              if (onClose) onClose();
            }
          }
        }, 200);
        
      } catch (error) {
        console.error('Payment initialization error:', error);
        if (isMounted.current) {
          toast.error(`Payment failed: ${error.message}`, { id: 'payment-loading' });
          setError(error.message);
          PaymentState.reset();
          if (onClose) onClose();
        }
      }
    };
    
    /**
     * Create a fresh order via API
     * Always creates a new order to avoid stale order IDs
     */
    const createFreshOrder = async () => {
      try {
        // Format cart items
        const cartItems = sessionData.selectedEvents?.map(event => ({
          eventId: event.eventId || event.id,
          eventName: event.eventName || event.title || '',
          status: 'pending',
          registrationType: 'individual',
          maxTeamSize: 1
        })) || [];
        
        // Prepare payload with all required data
        const payload = {
          amount: sessionData.totalAmount || 509,
          baseAmount: sessionData.amount || 499,
          platformFee: sessionData.platformFee || 10,
          cartItems,
          workshops: sessionData.selectedWorkshops || [],
          kindeId: sessionData.kindeId || sessionData.student?.kindeId,
          combo: sessionData.paymentDetails?.merchantParams?.comboId ? {
            id: sessionData.paymentDetails.merchantParams.comboId,
            name: sessionData.paymentDetails.merchantParams.comboName || "Selected Package",
            price: sessionData.amount || 499
          } : null,
          timestamp: Date.now(),
          refreshOrder: true
        };
        
        // Make API request with timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        try {
          const response = await fetch(API_CONFIG.getUrl('payment/initiate'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (!data.success || !data.registration?.paymentDetails?.razorpayDetails?.orderId) {
            throw new Error('Invalid order response');
          }
          
          return data.registration;
        } catch (fetchError) {
          if (fetchError.name === 'AbortError') {
            throw new Error('Request timed out');
          }
          throw fetchError;
        }
      } catch (error) {
        throw new Error(`Order creation failed: ${error.message}`);
      }
    };
    
    /**
     * Load Razorpay SDK with reliability improvements
     */
    const loadRazorpayScript = () => {
      return new Promise((resolve, reject) => {
        // Use existing if available
        if (window.Razorpay && scriptLoaded.current) {
          resolve();
          return;
        }
        
        // Reset any partial Razorpay state
        if (window.Razorpay) {
          try {
            delete window.Razorpay;
          } catch (e) {
            console.error('Failed to reset Razorpay object');
          }
        }
        
        // Load fresh script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        
        // Add timeout for script loading
        const timeoutId = setTimeout(() => {
          reject(new Error('Payment system unavailable'));
        }, 10000);
        
        script.onload = () => {
          clearTimeout(timeoutId);
          scriptLoaded.current = true;
          // Small delay to ensure script initialization
          setTimeout(resolve, 100);
        };
        
        script.onerror = () => {
          clearTimeout(timeoutId);
          reject(new Error('Failed to load payment system'));
        };
        
        document.body.appendChild(script);
      });
    };
    
    /**
     * Create Razorpay options from session data
     */
    const createRazorpayOptions = (sessionData) => {
      const paymentDetails = sessionData?.paymentDetails || {};
      const customerDetails = paymentDetails?.customerDetails || {};
      const razorpayDetails = paymentDetails?.razorpayDetails || {};
      
      const orderId = razorpayDetails.orderId;
      
      if (!orderId) {
        throw new Error('Missing order ID');
      }
      
      // Store the current order ID in global state
      PaymentState.currentOrderId = orderId;
      
      // Calculate amount in paise (Razorpay uses smallest currency unit)
      const amount = Math.round((sessionData.totalAmount || 509) * 100);
      
      // Generate unique session token to avoid conflicts
      const sessionToken = `sv2_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      return {
        key: import.meta.env.VITE_APP_RAZORPAY_KEY_ID,
        amount,
        currency: "INR",
        name: "Techniverse2k25",
        description: "Event Registration Payment",
        order_id: orderId,
        handler: function(response) {
          handlePaymentSuccess(response, sessionData);
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
            if (isMounted.current) {
              toast.error('Payment cancelled');
              PaymentState.reset();
              if (onClose) onClose();
            }
          },
          escape: true,
          animation: true
        },
        retry: false, // Disable automatic retry
        notes: {
          session_id: sessionData.id || '',
          session_token: sessionToken,
          timestamp: Date.now().toString()
        },
        // Disable features that may cause issues
        send_sms_hash: false,
        remember_customer: false
      };
    };
    
    /**
     * Handle successful payment response
     */
    const handlePaymentSuccess = async (response, sessionData) => {
      if (!isMounted.current) return;
      
      try {
        toast.loading('Verifying payment...', { id: 'verify-payment' });
        
        // Validate response
        if (!response.razorpay_payment_id || !response.razorpay_order_id || !response.razorpay_signature) {
          throw new Error('Invalid payment response');
        }
        
        // Prepare verification data
        const verifyData = {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          session_id: sessionData.id
        };
        
        // Send verification request
        const verifyResponse = await fetch(API_CONFIG.getUrl('payment/verify'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(verifyData)
        });
        
        if (!verifyResponse.ok) {
          throw new Error(`Verification failed: ${verifyResponse.status}`);
        }
        
        const verifyResult = await verifyResponse.json();
        
        if (verifyResult.success) {
          toast.dismiss('verify-payment');
          toast.success('Payment successful!');
          window.location.href = `/payment/success?orderId=${sessionData.paymentDetails.orderId}`;
        } else {
          throw new Error(verifyResult.error || 'Payment verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast.error('Payment verification failed', { id: 'verify-payment' });
        
        // Try status check as fallback
        checkPaymentStatus(sessionData.paymentDetails.orderId);
      }
    };
    
    /**
     * Check payment status as fallback verification method
     */
    const checkPaymentStatus = async (orderId) => {
      if (!isMounted.current) return;
      
      try {
        toast.loading('Checking payment status...', { id: 'status-check' });
        
        // Wait for webhooks to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const response = await fetch(API_CONFIG.getUrl(`payment/status/${orderId}`));
        
        if (!response.ok) {
          throw new Error(`Status check failed: ${response.status}`);
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
        PaymentState.reset();
        if (onClose && isMounted.current) onClose();
      }
    };
    
    // Start the payment flow
    initializePayment();
  }, [sessionData, onClose]);
  
  // Error UI
  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="bg-slate-800 p-6 rounded-lg max-w-md w-full">
          <h3 className="text-xl font-bold text-white mb-2">Payment Error</h3>
          <p className="text-red-400 mb-4">{error}</p>
          <div className="flex justify-end gap-2">
            <button 
              className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700"
              onClick={() => {
                PaymentState.reset();
                cleanupRazorpayElements();
                window.location.reload();
              }}
            >
              Reload Page
            </button>
            <button 
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              onClick={() => {
                PaymentState.reset();
                if (onClose) onClose();
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Reset button only shown in development
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          className="bg-red-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
          onClick={() => {
            PaymentState.reset();
            cleanupRazorpayElements();
            toast.success('Payment system reset');
            setTimeout(() => window.location.reload(), 500);
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
            <path d="M16 16h5v5"></path>
          </svg>
          Reset Payment
        </button>
      </div>
    );
  }
  
  // No UI in production (invisible component)
  return null;
};


export default PaymentHandler;