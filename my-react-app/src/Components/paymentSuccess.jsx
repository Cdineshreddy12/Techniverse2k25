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
        const response = await fetch(API_CONFIG.getUrl(`registrations/order/${orderId}`));
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to load registration');
        }

        if (data.registration?.paymentStatus === 'completed') {
          setPaymentDetails(data.registration);
          dispatch(clearCart());
          toast.success('Payment successful!');
          setTimeout(() => navigate('/profile'), 10000);
        } else {
          const statusResponse = await fetch(API_CONFIG.getUrl(`payment/status/${orderId}`));
          const statusData = await statusResponse.json();

          if (statusData.success && statusData.status === 'completed') {
            setPaymentDetails(data.registration);
            dispatch(clearCart());
            toast.success('Payment successful!');
            setTimeout(() => navigate('/profile'), 10000);
          } else {
            throw new Error('Payment status not confirmed');
          }
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast.error('Error verifying payment');
        setTimeout(() => navigate('/cart'), 6000);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [navigate, dispatch, searchParams]);

  const renderContent = () => {
    if (verifying) {
      return (
        <div className="text-center p-6">
          <Loader className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white">Verifying Payment</h2>
          <p className="text-gray-400 text-sm">Please wait...</p>
        </div>
      );
    }

    if (!paymentDetails) {
      return (
        <div className="text-center p-6">
          <div className="text-red-500 text-3xl mb-3">⚠️</div>
          <h2 className="text-lg font-semibold text-white mb-2">Verification Failed</h2>
          <p className="text-gray-400 text-sm mb-4">Check your registration status in profile</p>
          <button
            onClick={() => navigate('/profile')}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Go to Profile
          </button>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="text-center mb-4">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
          <h2 className="text-lg font-semibold text-white">Payment Successful!</h2>
          <p className="text-gray-400 text-sm">Registration confirmed</p>
        </div>

        <div className="grid gap-3 mb-4">
          <div className="bg-slate-700/50 p-3 rounded-lg flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-xs">Name</p>
              <p className="text-white text-sm font-medium">
                {paymentDetails.paymentDetails?.customerDetails?.name}
              </p>
            </div>
            <Receipt className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-700/50 p-3 rounded-lg">
              <p className="text-gray-400 text-xs">Order ID</p>
              <p className="text-white text-sm font-medium break-all">
                {paymentDetails.paymentDetails?.orderId}
              </p>
            </div>
            <div className="bg-slate-700/50 p-3 rounded-lg">
              <p className="text-gray-400 text-xs">Amount</p>
              <p className="text-white text-sm font-medium">₹{paymentDetails.amount}</p>
            </div>
          </div>

          <div className="bg-slate-700/50 p-3 rounded-lg">
            <p className="text-gray-400 text-xs">Package</p>
            <p className="text-white text-sm font-medium">
              {paymentDetails.paymentDetails?.merchantParams?.comboName}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/profile')}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
        >
          View Registration
        </button>

        <p className="text-center text-gray-400 text-xs mt-3">
          Redirecting to profile in 10 seconds...
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md animate-fade-in">
        {renderContent()}
      </div>
    </div>
  );
};

export default PaymentSuccess;