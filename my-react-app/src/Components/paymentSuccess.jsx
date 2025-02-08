import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Download, FileText } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { clearCart } from '../Redux/cartSlice';
import { toast } from 'react-hot-toast';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import API_CONFIG from '../config/api';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useKindeAuth();
  
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrationDetails = async () => {
      try {
        // Clear cart in Redux store
        dispatch(clearCart());

        // Fetch recent registrations for the user
        const response = await fetch(
          API_CONFIG.getUrl(`payment/recent-registrations/${user.id}`), 
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          }
        );

        const data = await response.json();

        if (data.success) {
          setRegistrations(data.registrations);
          toast.success('Registrations retrieved successfully!');
        } else {
          toast.error('Could not fetch registration details');
        }
      } catch (error) {
        console.error('Error fetching registrations:', error);
        toast.error('An error occurred while fetching registrations');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchRegistrationDetails();
    }
  }, [user, dispatch]);

  const handleDownloadReceipt = async (registrationId) => {
    try {
      const response = await fetch(
        API_CONFIG.getUrl(`payment/receipt/${registrationId}`), 
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        }
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt_${registrationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Could not download receipt');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-white">Loading registration details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center max-w-2xl w-full">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
        <p className="text-gray-400 mb-6">
          Your registration has been confirmed. Details are below.
        </p>

        {registrations.length > 0 ? (
          <div className="space-y-4">
            {registrations.map((registration) => (
              <div 
                key={registration._id} 
                className="bg-slate-700 rounded-lg p-4 border border-slate-600"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {registration.selectedEvents[0].eventName}
                  </h3>
                  <span className="text-emerald-400 font-medium">
                    ₹{registration.amount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-gray-300">
                    Transaction ID: {registration.transactionId}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadReceipt(registration._id)}
                      className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
                    >
                      <Download size={16} />
                      Receipt
                    </button>
                    <button
                      onClick={() => navigate(`/events/${registration.selectedEvents[0].eventId}`)}
                      className="flex items-center gap-2 px-3 py-1 bg-slate-600 text-white rounded-lg hover:bg-slate-500"
                    >
                      <FileText size={16} />
                      Event Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No recent registrations found.</p>
        )}

        <div className="flex gap-4 justify-center mt-6">
          <button
            onClick={() => navigate('/dashboard/registrations')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
          >
            View All Registrations
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

export default PaymentSuccess;