// PaymentFailure.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const PaymentFailure = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center max-w-md w-full">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Payment Failed</h1>
        <p className="text-gray-400 mb-6">
          We couldn't process your payment. Please try again or contact support if the issue persists.
        </p>
        <button
          onClick={() => navigate('/cart')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
        >
          Return to Cart
        </button>
      </div>
    </div>
  );
};

export default PaymentFailure;