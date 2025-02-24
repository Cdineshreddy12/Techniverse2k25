import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader, Receipt } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { clearCart } from '../Redux/cartSlice';
import { toast } from 'react-hot-toast';
import API_CONFIG from '../config/api';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();
    const [verifying, setVerifying] = useState(true);
    const [paymentDetails, setPaymentDetails] = useState(null);

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                // Get orderId from URL query parameters instead of location.state
                const orderId = searchParams.get('orderId');
                console.log('Verifying payment for orderId:', orderId);

                if (!orderId) {
                    throw new Error('Order ID not found');
                }

                // First try to get registration details
                const response = await fetch(API_CONFIG.getUrl(`registrations/order/${orderId}`));
                if (!response.ok) {
                    throw new Error('Failed to fetch registration details');
                }
                const data = await response.json();
                console.log('Registration data:', data);

                if (data.success && data.registration) {
                    if (data.registration.paymentStatus === 'completed') {
                        setPaymentDetails(data.registration);
                        dispatch(clearCart());
                        setTimeout(() => navigate('/profile'), 10000);
                    } else {
                        // Double check payment status
                        const statusResponse = await fetch(API_CONFIG.getUrl(`payment/status/${orderId}`));
                        if (!statusResponse.ok) {
                            throw new Error('Failed to fetch payment status');
                        }
                        const statusData = await statusResponse.json();
                        console.log('Status check response:', statusData);

                        if (statusData.success && statusData.status === 'completed') {
                            setPaymentDetails(data.registration);
                            dispatch(clearCart());
                            setTimeout(() => navigate('/profile'), 10000);
                        } else {
                            throw new Error('Payment not confirmed');
                        }
                    }
                } else {
                    throw new Error(data.error || 'Failed to load registration');
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                toast.error(error.message || 'Error verifying payment');
                // Reduced timeout for failure case
                setTimeout(() => navigate('/cart'), 6000);
            } finally {
                setVerifying(false);
            }
        };

        verifyPayment();
    }, [searchParams, navigate, dispatch]);

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
                    <h2 className="text-lg font-semibold text-white mb-2">
                        Verification Failed
                    </h2>
                    <p className="text-gray-400 text-sm mb-4">
                        Check your registration status in profile
                    </p>
                    <button
                        onClick={() => navigate('/profile')}
                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
                    >
                        Go to Profile
                    </button>
                </div>
            );
        }

        // Update the destructuring in renderContent()
const {
  paymentDetails: {
    customerDetails,
    orderId,
    razorpayPaymentId, // Change this from razorpayDetails
    merchantParams,
    amount
  }
} = paymentDetails;

return (
  <div className="p-6">
    <div className="text-center mb-4">
      <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
      <h2 className="text-lg font-semibold text-white">Payment Successful!</h2>
      <p className="text-gray-400 text-sm">Registration confirmed</p>
    </div>

    <div className="grid gap-4 mb-6">
      {/* Customer Info */}
      <div className="bg-slate-700/50 p-4 rounded-lg">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-gray-400 text-xs mb-1">Name</p>
            <p className="text-white text-sm font-medium">{customerDetails?.name}</p>
          </div>
          <Receipt className="w-4 h-4 text-indigo-400" />
        </div>
        <p className="text-gray-400 text-xs mt-2">{customerDetails?.email}</p>
      </div>

      {/* Payment Details */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <p className="text-purple-400 text-lg font-semibold">₹{amount}</p>
          <p className="text-gray-400 text-xs mt-1">Amount Paid</p>
        </div>
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <p className="text-emerald-400 text-sm font-medium">{merchantParams?.comboName}</p>
          <p className="text-gray-400 text-xs mt-1">Package</p>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="bg-slate-700/50 p-4 rounded-lg space-y-3">
        <div>
          <p className="text-gray-400 text-xs mb-1">Payment ID</p>
          <p className="text-white text-sm font-medium font-mono">{razorpayPaymentId}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-1">Order ID</p>
          <p className="text-white text-sm font-medium font-mono break-all">{orderId}</p>
        </div>
      </div>
    </div>

    <button
      onClick={() => navigate('/profile')}
      className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors font-medium"
    >
      View Registration
    </button>

    <p className="text-center text-gray-400 text-xs mt-4">
      Redirecting to profile in 10 seconds...
    </p>
  </div>
);
    }


    return (
        <div className="fixed inset-0 bg-slate-900/95 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md animate-fade-in">
                {renderContent()}
            </div>
        </div>
    );
};

export default PaymentSuccess;