import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../Redux/cartSlice';
import { toast } from 'react-hot-toast';
import { Loader, XCircle } from 'lucide-react';
import API_CONFIG from '../config/api';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

const PaymentProcessor = ({ amount, cartItems, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useKindeAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const initiatePayment = async () => {
      try {
        setLoading(true);
        setError(null);

        // Initiate payment
        const response = await fetch(API_CONFIG.getUrl('payment/initiate'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            cartItems,
            kindeId: user.id
          })
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Payment initiation failed');
        }

        // Handle Juspay session
        const { sessionData } = data;

        // Create payment form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = sessionData.payment_links.web;

        // Add required fields
        Object.entries(sessionData.payment_data).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });

        // Submit form
        document.body.appendChild(form);
        form.submit();

      } catch (error) {
        console.error('Payment error:', error);
        setError(error.message);
        toast.error(error.message || 'Payment initiation failed');
      } finally {
        setLoading(false);
      }
    };

    initiatePayment();
  }, [amount, cartItems, user.id]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center">
          <div className="flex items-center justify-center mb-4">
            <Loader className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Initializing Payment
          </h3>
          <p className="text-gray-400">
            Please wait while we connect to the payment gateway...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center">
          <div className="text-red-500 mb-4">
            <XCircle className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Payment Failed
          </h3>
          <p className="text-gray-400 mb-4">
            {error}
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
            >
              Close
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PaymentProcessor;