import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Trophy, Users, Calendar, Clock,
  Phone, Tag, Check, ArrowLeft, Loader,
  IndianRupee, CalendarClock, MapPin,ShoppingCart
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { store } from '../../Redux/mainStore';
import { addToCart } from '../../Redux/cartSlice';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import API_CONFIG from '../../config/api';
const EventDetails = () => {
  const { departmentId, eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

const {user}=useKindeAuth();
  const dispatch = useDispatch();
  const [addingToCart, setAddingToCart] = useState(false);

  const addToBackendCart = async (kindeId) => {
    if (!event.eventInfo || !event.eventInfo.id) {
      throw new Error('Invalid event data');
    }
    
    const eventId = event.eventInfo.id;
    console.log("Event ID:", eventId);
    
    const cartItem = {
      eventId: eventId,  // Use the correct ID from eventInfo
      price: event.registration.fee
    };
  
    console.log('Sending to backend:', {
      kindeId,
      item: cartItem
    });
  
    const url = API_CONFIG.getUrl('cart/add');
  
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        kindeId,
        item: cartItem
      })
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.details || 'Failed to add item to cart');
    }
    
    return response.json();
  };

  useEffect(() => {
    fetchEventDetails();
  }, [departmentId, eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/api/departments/${departmentId}/events/${eventId}`
      );
      const data = await response.json();
      
      if (data.success) {
        console.log('Event data:', data.event);
        setEvent(data.event);
      } else {
        throw new Error(data.error || 'Failed to fetch event details');
      }
    } catch (error) {
      toast.error(error.message);
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Animation setup
  useEffect(() => {
    const animateOnScroll = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-scroll]').forEach(el => {
      el.classList.add('opacity-0', 'translate-y-4', 'transition-all', 'duration-300');
      animateOnScroll.observe(el);
    });

    return () => animateOnScroll.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader className="w-6 h-6 text-indigo-500 animate-spin" />
          <span className="text-white">Loading event details...</span>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Event Not Found</h2>
          <p className="text-gray-400 mb-6">The event you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 relative pb-24">
      {/* Hero Section */}
      <div className="h-[40vh] relative">
        <img 
          src={event.media.bannerDesktop || "/api/placeholder/1920/1080"} 
          alt={event.eventInfo.title}
          className="w-full h-full object-cover"
        />
        
        <div className="absolute top-4 left-4 inline-flex items-center px-3 py-1.5 rounded-full 
                     bg-slate-900/80 border border-slate-700 backdrop-blur-sm">
          <Tag size={14} className="text-indigo-400 mr-2" />
          <span className="text-indigo-300 text-sm font-medium">{event.eventInfo.tag}</span>
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Title and Description */}
        <div className="mb-12" data-scroll>
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium
                          bg-${event.eventInfo.department.color} text-white`}>
              {event.eventInfo.department.shortName}
            </span>
            {event.registration.isRegistrationOpen && (
              <span className="px-3 py-1 rounded-full text-xs font-medium
                           bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                Registration Open
              </span>
            )}
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {event.eventInfo.title}
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-3xl whitespace-pre-wrap">
            {event.eventInfo.description}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12" data-scroll>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 p-2.5">
                <Trophy className="w-full h-full text-white" />
              </div>
              <span className="text-gray-400 text-sm">Prize Pool</span>
            </div>
            <p className="text-xl font-bold text-white">₹{event.prizes.totalPrizeMoney.toLocaleString()}</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 p-2.5">
                <Users className="w-full h-full text-white" />
              </div>
              <span className="text-gray-400 text-sm">Registration</span>
            </div>
            <p className="text-xl font-bold text-white">
              {event.registration.registeredCount}/{event.registration.totalSlots}
            </p>
            <p className="text-sm text-gray-400">
              {event.registration.type === 'team' ? 
                `Teams (max ${event.registration.maxTeamSize} members)` : 
                'Individual'}
            </p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-2.5">
                <CalendarClock className="w-full h-full text-white" />
              </div>
              <span className="text-gray-400 text-sm">Schedule</span>
            </div>
            <p className="text-xl font-bold text-white">{event.schedule.duration}</p>
            <p className="text-sm text-gray-400">{formatDate(event.schedule.startTime)}</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-2.5">
                <MapPin className="w-full h-full text-white" />
              </div>
              <span className="text-gray-400 text-sm">Venue</span>
            </div>
            <p className="text-xl font-bold text-white">{event.schedule.venue}</p>
          </div>
        </div>

        {/* Prizes Section */}
        {event.prizes.structure.length > 0 && (
          <div className="bg-slate-800 rounded-xl p-6 sm:p-8 border border-slate-700 mb-12" data-scroll>
            <h2 className="text-2xl font-bold text-white mb-6">Prize Distribution</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {event.prizes.structure.map((prize, index) => (
                <div key={index} className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-amber-400 font-medium">
                        {prize.position === 1 ? '1st' : 
                         prize.position === 2 ? '2nd' : 
                         prize.position === 3 ? '3rd' : 
                         `${prize.position}th'} Place`}
                      </p>
                      <p className="text-2xl font-bold text-white">₹{prize.amount.toLocaleString()}</p>
                    </div>
                  </div>
                  {prize.description && (
                    <p className="text-gray-400 text-sm">{prize.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {event.rounds.length > 0 && (
  <div className="bg-slate-800 rounded-xl p-6 sm:p-8 border border-slate-700 mb-12" data-scroll>
    <h2 className="text-2xl font-bold text-white mb-6">Event Rounds</h2>
    <div className="space-y-6">
      {event.rounds.map((round, index) => (
        <div key={index} className="relative pl-8 pb-6 last:pb-0">
          {/* Connection Line */}
          {index !== event.rounds.length - 1 && (
            <div className="absolute left-3.5 top-8 bottom-0 w-px bg-slate-700" />
          )}
          
          {/* Round Number Badge */}
          <div className="absolute left-0 top-1.5 w-7 h-7 rounded-full bg-slate-700 
                       flex items-center justify-center text-sm font-medium text-white">
            {round.number}
          </div>

          {/* Round Content */}
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              {/* Status Badge */}
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full
                            ${round.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' :
                              round.status === 'ongoing' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' :
                              'bg-purple-500/20 text-purple-400 border-purple-500/20'} 
                            border`}>
                {round.status.charAt(0).toUpperCase() + round.status.slice(1)}
              </span>
              
              {/* Time */}
              <span className="text-sm text-slate-400">
                {formatDate(round.startTime)} - {formatDate(round.endTime)}
              </span>
            </div>

            {/* Description */}
            <p className="text-white mb-2">{round.description}</p>

            {/* Venue */}
            {round.venue && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin className="w-4 h-4" />
                <span>{round.venue}</span>
              </div>
            )}

            {/* Requirements */}
            {round.requirements && round.requirements.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-sm font-medium text-slate-300">Requirements:</p>
                <ul className="list-disc list-inside text-sm text-slate-400">
                  {round.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{/* Coordinators Section */}
{event.coordinators.length > 0 && (
  <div className="bg-slate-800 rounded-xl p-6 sm:p-8 border border-slate-700 mb-12" data-scroll>
    <h2 className="text-2xl font-bold text-white mb-6">Event Coordinators</h2>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {event.coordinators.map((coordinator, index) => (
        <div key={index} className="bg-slate-900 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden">
              <img
                src={coordinator.photo || "/api/placeholder/100/100"}
                alt={coordinator.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{coordinator.name}</h3>
              <div className="space-y-1 mt-1">
                <a href={`mailto:${coordinator.email}`} 
                   className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300">
                  {coordinator.email}
                </a>
                <a href={`tel:${coordinator.phone}`}
                   className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300">
                  <Phone className="w-3.5 h-3.5" />
                  {coordinator.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

      {/* Fixed Bottom Registration Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-md border-t border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg 
                       bg-slate-800 hover:bg-slate-700 border border-slate-600 
                       text-white transition-all duration-300"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div>
              <p className="text-white font-semibold text-lg">
                ₹{event.registration.fee.toLocaleString()}
              </p>
              <p className="text-gray-400 text-sm">Registration Fee</p>
            </div>
          </div>

          <button
              onClick={async () => {
                if (!event.registration.isRegistrationOpen) return;
                
                if (!user?.id) {
                  toast.error('Please login to add items to cart');
                  return;
                }
              
                try {
                  setAddingToCart(true);
                  
                  console.log('Event data:', event); // Debug log
                  
                  // Check for existing item in Redux store
                  const existingItem = store.getState().cart.items.find(item => item.id === event._id);
                  if (existingItem) {
                    toast.error('Event already in cart!');
                    return;
                  }
              
                  // Update backend first
                 // Just pass the whole event object
                const backendResponse = await addToBackendCart(user.id);
              
                                
                if (backendResponse.success) {
                  // Prepare cart item for Redux with correct ID
                  const cartItem = {
                    id: event.eventInfo.id,
                    fee: event.registration.fee,
                    eventInfo: {
                      ...event.eventInfo,
                      department: {
                        id: departmentId,
                        shortName: event.eventInfo.department.shortName,
                        color: event.eventInfo.department.color
                      }
                    },
                    schedule: event.schedule,
                    registration: event.registration,
                    media: event.media
                  };
                    // If backend succeeds, update Redux
                    dispatch(addToCart(cartItem));
                    setShowSuccess(true);
                    toast.success('Added to cart successfully!');
                    setTimeout(() => setShowSuccess(false), 2000);
                  }
                  
              
                } catch (error) {
                  console.error('Error adding to cart:', error);
                  toast.error(error.message || 'Failed to add to cart. Please try again.');
                } finally {
                  setAddingToCart(false);
                }
              }}
              disabled={!event.registration.isRegistrationOpen || addingToCart}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium
                          transition-all duration-300
                          ${event.registration.isRegistrationOpen && !addingToCart
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500'
                            : 'bg-slate-700 cursor-not-allowed'}`}
            >
              {addingToCart ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : showSuccess ? (
                <>
                  <Check className="w-5 h-5 animate-bounce" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span>
                    {event.registration.isRegistrationOpen 
                      ? 'Add to Cart' 
                      : event.registration.status === 'closed'
                        ? 'Registration Closed'
                        : 'Registration Full'}
                  </span>
                </>
              )}
            </button>

        </div>
      </div>
    </div>
  );
};

export default EventDetails;