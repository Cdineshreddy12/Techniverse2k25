// PaymentVerify.jsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API_CONFIG from '../config/api';
import { useAuth } from '../contexts/AuthContext';

const PaymentVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, checkRegistration } = useAuth();

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Ensure authentication is maintained
        if (!isAuthenticated) {
          const storedToken = localStorage.getItem('kinde_auth_token');
          if (!storedToken) {
            throw new Error('Authentication required');
          }
          await checkRegistration(true);
        }

        const formData = new URLSearchParams(location.search);
        const orderId = searchParams.get('order_id') || formData.get('order_id');
        const status = searchParams.get('status') || formData.get('status');
        const signature = searchParams.get('signature') || formData.get('signature');

        if (!orderId || !status) {
          throw new Error('Missing payment parameters');
        }

        const response = await fetch(API_CONFIG.getUrl('payment/status/' + orderId), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('kinde_auth_token')}`
          }
        });
        const data = await response.json();

        if (data.success && data.status === 'completed') {
          navigate(`/payment/success?order_id=${orderId}`);
        } else {
          const verifyResponse = await fetch(API_CONFIG.getUrl('payment/verify'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('kinde_auth_token')}`
            },
            body: JSON.stringify({ orderId, status, signature })
          });

          const verifyData = await verifyResponse.json();
          if (verifyData.success) {
            navigate(`/payment/success?order_id=${orderId}`);
          } else {
            throw new Error('Payment verification failed');
          }
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast.error(error.message || 'Error verifying payment');
        navigate('/payment/failure');
      }
    };

    verifyPayment();
  }, [navigate, location, searchParams, isAuthenticated, checkRegistration]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center max-w-md w-full">
        <Loader className="w-16 h-16 text-indigo-500 animate-spin mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Verifying Payment</h1>
        <p className="text-gray-400">Please wait while we process your payment...</p>
      </div>
    </div>
  );
};

export default PaymentVerify;