import { useNavigate } from "react-router-dom";

const PaymentFailure = () => {
    const navigate = useNavigate();
  
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center max-w-md w-full">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Payment Failed</h1>
          <p className="text-gray-400 mb-6">
            We couldn't process your payment. Don't worry, no money has been deducted.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/cart')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  };

export default PaymentFailure;