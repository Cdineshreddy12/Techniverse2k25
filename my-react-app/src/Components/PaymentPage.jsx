import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { clearCart } from '../Redux/cartSlice';

const PaymentHandler = ({ sessionData, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Comprehensive logging
    console.log('Payment Session Data:', sessionData);

    // Validate session data
    if (!sessionData) {
      setError('No payment session data available');
      toast.error('Payment initialization failed');
      return;
    }

    // More robust payment link checking
    if (sessionData?.payment_links?.web) {
      try {
        // Validate URL
        new URL(sessionData.payment_links.web);
        
        // Optional: Add timeout for redirection
        const redirectTimer = setTimeout(() => {
          window.location.href = sessionData.payment_links.web;
        }, 500);

        return () => clearTimeout(redirectTimer);
      } catch (urlError) {
        console.error('Invalid payment URL:', urlError);
        setError('Invalid payment gateway URL');
        toast.error('Unable to proceed with payment');
      }
    } else {
      setError('Payment gateway link is missing');
      toast.error('Payment gateway configuration error');
    }
  }, [sessionData]);

  // Fallback payment status check
  useEffect(() => {
    const handleMessage = (event) => {
      // Add origin checking for security
      // Replace with your actual frontend domain
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'PAYMENT_COMPLETE') {
        dispatch(clearCart());
        navigate('/payment/success');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [dispatch, navigate]);

  // Error rendering
  if (error) {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-slate-800 p-8 rounded-xl border border-red-700 text-center">
          <div className="text-red-500 mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 mx-auto" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-red-400 mb-2">
            Payment Initialization Error
          </h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
            >
              Retry
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Redirecting to Payment Gateway
        </h3>
        <p className="text-gray-400">
          Please wait while we connect you to the secure payment page...
        </p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
        >
          Cancel Payment
        </button>
      </div>
    </div>
  );
};

export default PaymentHandler;