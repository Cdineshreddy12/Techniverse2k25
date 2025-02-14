import React, { useState, useEffect } from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { useLocation } from 'react-router-dom';
import { useApi } from '../config/useApi';
import { toast } from 'react-hot-toast';
import {
  User, Mail, Calendar, Shield, Globe, Clock, Users,
  Bookmark, Trophy, Ticket, Award, BookCheck, QrCode, School
} from 'lucide-react';

const EventCard = ({ event }) => {
  if (!event) return null;

  // Format status text
  const getStatusText = (status) => {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Get status style
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700/70 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-white font-medium">
            {event.eventName || event.workshopName || 'Untitled Event'}
          </h3>
          <p className="text-sky-400 text-sm">
            {event.type || 'Event'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs ${getStatusStyle(event.status)}`}>
            {getStatusText(event.status)}
          </span>
        </div>
      </div>
      
      {event.description && (
        <p className="text-gray-400 text-sm mb-3">{event.description}</p>
      )}

      <div className="space-y-2">
        {(event.eventDate || event.workshopDate) && (
          <div className="flex items-center text-gray-400 text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date(event.eventDate || event.workshopDate).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}

        {event.venue && (
          <div className="flex items-center text-gray-400 text-sm">
            <Globe className="w-4 h-4 mr-2" />
            {event.venue}
          </div>
        )}

        {event.instructor && (
          <div className="flex items-center text-gray-400 text-sm">
            <User className="w-4 h-4 mr-2" />
            Instructor: {event.instructor}
          </div>
        )}

        {event.duration && (
          <div className="flex items-center text-gray-400 text-sm">
            <Clock className="w-4 h-4 mr-2" />
            Duration: {event.duration}
          </div>
        )}
      </div>

      {event.payment && (
        <div className="mt-3 pt-3 border-t border-slate-600/30">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Registration Fee:</span>
            <span className="text-white font-medium">₹{event.payment.amount || 0}</span>
          </div>
          {event.payment.paidOn && (
            <div className="text-xs text-gray-400 mt-1">
              Paid on: {new Date(event.payment.paidOn).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


const UserProfile = () => {
  const { isLoading: authLoading, isAuthenticated, user } = useKindeAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isLoading, setIsLoading] = useState(true);
  const [registrationData, setRegistrationData] = useState(null);
  const [error, setError] = useState(null);
  const location = useLocation();
  const api = useApi();

  // Extract orderId from URL if present
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get('order_id');

  // Fetch registration data
  useEffect(() => {
    const fetchRegistrationData = async () => {
      if (!api?.isAuthenticated || !api?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        let response;

        if (orderId) {
          console.log('Fetching registration by order ID:', orderId);
          response = await api.getRegistrationByOrderId(orderId);
        } else {
          console.log('Fetching latest registration for user:', api.user.id);
          response = await api.getLatestRegistration(api.user.id);
        }

        console.log('Registration response:', response);

        if (response?.success) {
          setRegistrationData(response.registration);
        } else {
          throw new Error(response?.error || 'Failed to load registration');
        }
      } catch (error) {
        console.error('Failed to fetch registration:', error);
        setError(error.message);
        toast.error(error.message || 'Error loading registration details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegistrationData();
  }, [api?.isAuthenticated, api?.user?.id, orderId]);

  if (isLoading || api?.isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }

  if (!api?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-xl mb-4">Please log in to view your profile</h2>
          <button
            onClick={() => api?.login?.()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }


  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 pt-24 pb-12 px-4 text-center">
        <div className="text-red-400 mb-4">Error: {error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const getUpcomingEvents = () => {
    if (!registrationData) return [];
    const now = new Date();
    return [
      ...(registrationData.selectedEvents || []).map(event => ({
        id: event.eventId,
        type: 'Event',
        title: event.eventName,
        status: event.status,
        payment: {
          amount: registrationData.amount,
          status: registrationData.paymentStatus,
          paidOn: registrationData.paymentCompletedAt
        }
      })),
      ...(registrationData.selectedWorkshops || []).map(workshop => ({
        id: workshop.workshopId,
        type: 'Workshop',
        title: workshop.workshopName,
        status: workshop.status,
        payment: {
          amount: registrationData.amount,
          status: registrationData.paymentStatus,
          paidOn: registrationData.paymentCompletedAt
        }
      }))
    ].filter(item => new Date(item.date) > now);
  };

  return (
    <div className="min-h-screen bg-slate-900 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="relative mb-24">
          <div className="h-48 bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600 rounded-2xl"></div>
          
          {/* User Info */}
          <div className="absolute bottom-16 left-8 flex items-end">
          <div className="h-48 bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600 rounded-2xl"></div>
          
          <div className="absolute -bottom-16 left-8 flex items-end">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-slate-900 overflow-hidden bg-slate-800">
                {user?.picture ? (
                  <img 
                    src={user.picture} 
                    alt={user.given_name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-sky-500">
                    <span className="text-4xl font-bold text-white">
                      {user?.given_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-900"></div>
            </div>
                <div className="ml-6 mb-4">
                  <h1 className="text-3xl font-bold text-white">{user?.given_name}</h1>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-sky-400 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {user?.email}
                    </p>
                   </div>
                </div>
          </div>
          </div>

          {/* Tech Pass QR Code */}
          {registrationData?.qrCode?.dataUrl && (
              <div className="absolute right-8 -bottom-16">
                <div className="bg-white p-2 rounded-lg">
                  <img 
                    src={registrationData.qrCode.dataUrl} 
                    alt="Tech Pass QR" 
                    className="w-32 h-32"
                  />
                </div>
              </div>
            )}

        </div>

        {/* Registration Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Combo Details */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Package Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Package Name</p>
                <p className="text-white font-medium">{registrationData?.combo?.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Amount Paid</p>
                <p className="text-white font-medium">₹{registrationData?.amount}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Payment Status</p>
                <p className={`font-medium ${
                  registrationData?.paymentStatus === 'completed' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {registrationData?.paymentStatus}
                </p>
              </div>
            </div>
          </div>

          {/* Events & Workshops Count */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <BookCheck className="w-5 h-5" />
              Registrations
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Events Registered</p>
                <p className="text-white font-medium">{registrationData?.selectedEvents?.length || 0}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Workshops Registered</p>
                <p className="text-white font-medium">{registrationData?.selectedWorkshops?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* QR Code Info */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                          <QrCode className="w-5 h-5" />
                          Access Pass
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-gray-400 text-sm">Registration ID</p>
                            <p className="text-white font-medium">{registrationData?._id}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Registered On</p>
                            <p className="text-white font-medium">
                              {new Date(registrationData?.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {registrationData?.qrCode?.generatedAt && (
                            <div>
                              <p className="text-gray-400 text-sm">QR Code Generated</p>
                              <p className="text-white font-medium">
                                {new Date(registrationData.qrCode.generatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          {registrationData?.qrCode?.validUntil && (
                            <div>
                              <p className="text-gray-400 text-sm">Valid Until</p>
                              <p className="text-white font-medium">
                                {new Date(registrationData.qrCode.validUntil).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                 </div>
        {/* Events & Workshops List */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50">
  <div className="p-6">
    <h2 className="text-xl text-white font-semibold mb-4">Your Registrations</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {registrationData?.selectedEvents?.map((event) => (
        <EventCard
          key={event.eventId}
          event={{
            type: 'Event',
            eventName: event.eventName,
            status: event.status,
            description: event.description,
            venue: event.venue,
            eventDate: event.eventDate,
            payment: registrationData ? {
              amount: registrationData.amount,
              status: registrationData.paymentStatus,
              paidOn: registrationData.paymentCompletedAt
            } : null
          }}
        />
      ))}
      
      {registrationData?.selectedWorkshops?.map((workshop) => (
        <EventCard
          key={workshop.workshopId}
          event={{
            type: 'Workshop',
            eventName: workshop.workshopName,
            status: workshop.status,
            description: workshop.description,
            venue: workshop.venue,
            eventDate: workshop.workshopDate,
            instructor: workshop.instructor,
            payment: registrationData ? {
              amount: registrationData.amount,
              status: registrationData.paymentStatus,
              paidOn: registrationData.paymentCompletedAt
            } : null
          }}
        />
      ))}
      
      {(!registrationData?.selectedEvents?.length && !registrationData?.selectedWorkshops?.length) && (
        <div className="col-span-2 text-center py-8">
          <p className="text-gray-400">No registrations found</p>
        </div>
      )}
    </div>
  </div>
</div>

      </div>
    </div>
  );
};
export default UserProfile;