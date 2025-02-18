import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader, Receipt } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { clearCart } from '../Redux/cartSlice';
import { toast } from 'react-hot-toast';
import API_CONFIG from '../config/api';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const orderId = searchParams.get('order_id');
        console.log('Payment callback received:', { orderId });
  
        // Check payment status and get registration details
        const response = await fetch(API_CONFIG.getUrl(`registrations/order/${orderId}`));
        const data = await response.json();
  
        if (!data.success) {
          throw new Error(data.error || 'Failed to load registration');
        }
  
        const registration = data.registration;
        
        if (registration?.paymentStatus === 'completed') {
          setPaymentDetails(registration);
          dispatch(clearCart());
          toast.success('Payment successful!');
          setTimeout(() => {
            navigate('/profile');
          }, 10000);
        } else {
          // Double check payment status
          const statusResponse = await fetch(API_CONFIG.getUrl(`payment/status/${orderId}`));
          const statusData = await statusResponse.json();
  
          if (statusData.success && statusData.status === 'completed') {
            setPaymentDetails(registration);
            dispatch(clearCart());
            toast.success('Payment successful!');
            setTimeout(() => {
              navigate('/profile');
            }, 10000);
          } else {
            throw new Error('Payment status not confirmed');
          }
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast.error('Error verifying payment');
        setTimeout(() => {
          navigate('/cart');
        }, 6000);
      } finally {
        setVerifying(false);
      }
    };
  
    verifyPayment();
  }, [navigate, dispatch, searchParams]);

  if (verifying) {
    return (
      <div className="max-h-[60vh] mt-24 bg-slate-900 flex items-center justify-center p-4">
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

  if (!paymentDetails) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center max-w-md w-full">
          <div className="text-red-500 mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Payment Verification Failed</h1>
          <p className="text-gray-400 mb-6">
            We couldn't verify your payment. Please check your registration status in your profile.
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 max-w-md w-full">
        <div className="text-center mb-6">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
          <p className="text-gray-400">
            Your registration has been confirmed
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm">Name</p>
                <p className="text-white font-medium">
                  {paymentDetails.paymentDetails?.customerDetails?.name}
                </p>
              </div>
              <Receipt className="w-5 h-5 text-indigo-400" />
            </div>
          </div>

          <div className="bg-slate-700/50 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Order ID</p>
            <p className="text-white font-medium break-all">
              {paymentDetails.paymentDetails?.orderId}
            </p>
          </div>

          <div className="bg-slate-700/50 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Package</p>
            <p className="text-white font-medium">
              {paymentDetails.paymentDetails?.merchantParams?.comboName}
            </p>
          </div>

          <div className="bg-slate-700/50 p-4 rounded-lg">
            <p className="text-gray-400 text-sm">Amount Paid</p>
            <p className="text-white font-medium">₹{paymentDetails.amount}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
          >
            View Registration
          </button>
        </div>

        <p className="text-center text-gray-400 text-sm mt-4">
          You will be automatically redirected to your profile
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;