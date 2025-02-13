import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { clearCart } from '../Redux/cartSlice';
import { toast } from 'react-hot-toast';
import API_CONFIG from '../config/api';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const orderId = searchParams.get('order_id');
        
        console.log('Payment callback received:', { orderId });

        // Check payment status
        const response = await fetch(API_CONFIG.getUrl(`payment/status/${orderId}`));
        const data = await response.json();

        if (data.success && data.status === 'completed') {
          dispatch(clearCart());
          toast.success('Payment successful!');
          setTimeout(() => {
            navigate('/dashboard/registrations');
          }, 2000);
        } else {
          throw new Error('Payment verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast.error('Error verifying payment');
        setTimeout(() => {
          navigate('/cart');
        }, 2000);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [navigate, dispatch, searchParams]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center max-w-md w-full">
          <Loader className="w-16 h-16 text-indigo-500 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Verifying Payment</h1>
          <p className="text-gray-400">
            Please wait while we confirm your payment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center max-w-md w-full">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
        <p className="text-gray-400 mb-6">
          Your registration has been confirmed. You will be redirected to your registrations.
        </p>
        <button
          onClick={() => navigate('/dashboard/registrations')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
        >
          View Registrations
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;