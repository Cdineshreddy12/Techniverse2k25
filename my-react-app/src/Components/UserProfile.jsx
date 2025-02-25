import React, { useState, useEffect } from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { useLocation } from 'react-router-dom';
import { useApi } from '../config/useApi';
import { toast } from 'react-hot-toast';
import {
  User, Mail, Calendar, Shield, Globe, Clock, Users,
  Bookmark, Trophy, Ticket, Award, BookCheck, QrCode, School, Phone
} from 'lucide-react';

const EventCard = ({ event }) => {
  if (!event) return null;

  const getStatusText = (status) => {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

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
  
  // Check if we're handling a workshop instead of an event
  const isWorkshop = event.type === 'Workshop';

  return (
    <div className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700/70 transition-colors">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
        <div>
          <h3 className="text-white font-medium break-words">{event.eventName}</h3>
          <p className="text-sky-400 text-sm">{event.type}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs ${getStatusStyle(event.status)} whitespace-nowrap`}>
            {getStatusText(event.status)}
          </span>
        </div>
      </div>
      
      {/* Use workshop description for workshops, event details description for events */}
      {isWorkshop ? (
        <p className="text-gray-400 text-sm mb-3 break-words">{event.description}</p>
      ) : (
        event.details?.description && (
          <p className="text-gray-400 text-sm mb-3 break-words">{event.details.description}</p>
        )
      )}

      <div className="space-y-2">
        <div className="flex items-center text-gray-400 text-sm">
          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="break-words">
            {new Date(event.eventDate).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>

        {/* Show venue based on whether it's a workshop or event */}
        {(isWorkshop ? event.venue : event.details?.venue) && (
          <div className="flex items-center text-gray-400 text-sm">
            <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="break-words">{isWorkshop ? event.venue : event.details.venue}</span>
          </div>
        )}

        {event.duration && (
          <div className="flex items-center text-gray-400 text-sm">
            <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="break-words">Duration: {event.duration}</span>
          </div>
        )}

        {/* For workshops, show instructor if available */}
        {isWorkshop && event.details?.instructor && (
          <div className="flex items-center text-gray-400 text-sm">
            <User className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="break-words">Instructor: {event.details.instructor}</span>
          </div>
        )}

        {/* For events, show team size */}
        {!isWorkshop && event.details?.maxTeamSize && (
          <div className="flex items-center text-gray-400 text-sm">
            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="break-words">Max Team Size: {event.details.maxTeamSize}</span>
          </div>
        )}
      </div>

      {/* Only show rounds for events, not workshops */}
      {!isWorkshop && event.rounds && event.rounds.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-600/30">
          <h4 className="text-white text-sm font-medium mb-2">Rounds</h4>
          <div className="space-y-2">
            {event.rounds.map((round, index) => (
              <div key={index} className="text-gray-400 text-sm">
                {round.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const OrderDetails = ({ registrationData }) => {
  if (!registrationData) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
      {/* Package Details */}
      <div className="bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-700/50">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Ticket className="w-5 h-5" />
          Package Details
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-gray-400 text-sm">Package Name</p>
            <p className="text-white font-medium break-words">
              {registrationData?.paymentDetails?.merchantParams?.comboName || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Amount Paid</p>
            <p className="text-white font-medium">₹{registrationData?.amount || 0}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Payment Status</p>
            <p className={`font-medium ${
              registrationData?.paymentStatus === 'completed' ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {registrationData?.paymentStatus || 'Pending'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Order ID</p>
            <p className="text-white font-medium text-sm break-all">
              {registrationData?.paymentDetails?.orderId || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Student Details */}
      <div className="bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-700/50">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Student Details
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-gray-400 text-sm">Name</p>
            <p className="text-white font-medium">
              {registrationData?.student?.name || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Email</p>
            <p className="text-white font-medium break-all">
              {registrationData?.student?.email || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">College</p>
            <p className="text-white font-medium">
              {registrationData?.student?.collegeName || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Registration Type</p>
            <p className="text-white font-medium capitalize">
              {registrationData?.student?.registrationType || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Registration Summary */}
      <div className="bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-700/50">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <BookCheck className="w-5 h-5" />
          Registration Summary
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
          <div>
            <p className="text-gray-400 text-sm">Registration Date</p>
            <p className="text-white font-medium">
              {registrationData?.createdAt ? 
                new Date(registrationData.createdAt).toLocaleDateString() : 
                'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Payment Completed</p>
            <p className="text-white font-medium">
              {registrationData?.paymentCompletedAt ? 
                new Date(registrationData.paymentCompletedAt).toLocaleDateString() : 
                'Pending'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserProfile = () => {
  const { isLoading: authLoading, isAuthenticated, user } = useKindeAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [registrationData, setRegistrationData] = useState(null);
  const [error, setError] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const location = useLocation();
  const api = useApi();

  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get('order_id');

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
          response = await api.getRegistrationByOrderId(orderId);
        } else {
          response = await api.getLatestRegistration(api.user.id);
        }

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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
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

  if (error || !registrationData) {
    return (
      <div className="min-h-screen bg-slate-900 pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-slate-800/50 rounded-xl p-8 text-center border border-slate-700/50">
            <h2 className="text-2xl font-bold text-white mb-4">
              {!registrationData ? "No Registrations Found" : "Error Loading Profile"}
            </h2>
            
            {!registrationData ? (
              <>
                <p className="text-gray-300 mb-6">
                  You haven't registered for any events or workshops yet. Registration is required to set up your Tech Pass profile.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="/departments" 
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Browse Events
                  </a>
                  <a 
                    href="/departments" 
                    className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                  >
                    Browse Workshops
                  </a>
                </div>
              </>
            ) : (
              <>
                <p className="text-red-400 mb-6">
                  {error || "Unable to load your profile at this time."}
                </p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Retry
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-slate-900 pt-16 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="relative mb-48 sm:mb-32">
          <div className="h-32 sm:h-48 bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600 rounded-xl sm:rounded-2xl"></div>
          
          <div className="flex flex-col items-center sm:items-start sm:flex-row sm:justify-between px-4 sm:px-8">
            <div className="flex flex-col items-center sm:items-start sm:flex-row sm:gap-6 -mt-16 sm:-mt-12">
              <div className="relative mb-4 sm:mb-0">
                <div className="w-32 h-32 rounded-full border-4 border-slate-900 overflow-hidden bg-slate-800">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-sky-500">
                    <span className="text-4xl font-bold text-white">
                      {registrationData?.student?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center sm:text-left mb-6 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  {registrationData?.student?.name}
                </h1>
                <div className="space-y-1">
                  <p className="text-sky-400 flex items-center justify-center sm:justify-start text-sm">
                    <Mail className="w-4 h-4 mr-2" />
                    {registrationData?.student?.email}
                  </p>
                  <p className="text-sky-400 flex items-center justify-center sm:justify-start text-sm">
                    <Phone className="w-4 h-4 mr-2" />
                    {registrationData?.paymentDetails?.customerDetails?.phone}
                  </p>
                  <p className="text-sky-400 flex items-center justify-center sm:justify-start text-sm">
                    <School className="w-4 h-4 mr-2" />
                    {registrationData?.student?.collegeName}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            {registrationData?.qrCode?.dataUrl && (
              <div className="mt-6 sm:mt-0 sm:-mt-12">
                <button
                  onClick={() => setShowQrModal(true)}
                  className="bg-white p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <img 
                    src={registrationData.qrCode.dataUrl} 
                    alt="Tech Pass QR" 
                    className="w-32 h-32"
                  />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Order Details Component */}
        <OrderDetails registrationData={registrationData} />

        {/* Events & Workshops List */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="p-4 sm:p-6">
            <h2 className="text-xl text-white font-semibold mb-4">Your Registrations</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {registrationData?.selectedEvents?.map((event) => (
                <EventCard key={event.eventId} event={event} />
              ))}
              {registrationData?.selectedWorkshops?.map((workshop) => (
                <EventCard key={workshop.workshopId} event={workshop} />
              ))}
            </div>
          </div>
        </div>

        {/* QR Code Modal */}
        {showQrModal && registrationData?.qrCode?.dataUrl && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 w-full max-w-sm sm:max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Tech Pass QR Code</h3>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex justify-center">
                <img 
                  src={registrationData.qrCode.dataUrl} 
                  alt="Tech Pass QR" 
                  className="w-full"
                />
              </div>
              <div className="mt-4 text-center text-sm text-gray-500">
                <p>Valid until: {new Date(registrationData.qrCode.validUntil).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;