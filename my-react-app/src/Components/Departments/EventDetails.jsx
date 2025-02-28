import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Trophy, Users, Calendar, Clock,
  Phone, Tag, Check, ArrowLeft, Loader,
  IndianRupee, CalendarClock, MapPin,ShoppingCart,Info,X, ChevronDown, ChevronUp,Mail
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
      const apiUrl = API_CONFIG.getUrl(`departments/${departmentId}/events/${eventId}`);
      console.log("Fetching from:", apiUrl); // Debugging log
  
      const response = await fetch(apiUrl);
      const data = await response.json();
  
      if (data.success) {
        console.log('Event data:', data.event);
        
        // Calculate total prize money from the structure if totalPrizeMoney is 0
        if (data.event.prizes && data.event.prizes.totalPrizeMoney === 0 && 
            data.event.prizes.structure && data.event.prizes.structure.length > 0) {
          const calculatedTotal = data.event.prizes.structure.reduce(
            (total, prize) => total + (prize.amount || 0), 0
          );
          
          // Create a new event object with the updated totalPrizeMoney
          const updatedEvent = {
            ...data.event,
            prizes: {
              ...data.event.prizes,
              totalPrizeMoney: calculatedTotal
            }
          };
          
          setEvent(updatedEvent);
        } else {
          setEvent(data.event);
        }
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

  const RenderText = ({ text, className = "text-slate-300" }) => {
    if (!text) return null;
    
    return text.split('\n').map((line, index) => (
      <p key={index} className={`${className} ${index > 0 ? 'mt-2' : ''}`}>
        {line.trim()}
      </p>
    ));
  };
  
  const RoundSection = ({ section }) => (
    <div className="mt-4 pl-4 border-l-2 border-slate-700">
      <h4 className="text-lg font-medium text-white mb-2">{section.name}</h4>
      <RenderText text={section.description} />
      
      {section.duration && (
        <div className="flex items-center gap-2 text-sm text-slate-400 mt-2">
          <Clock className="w-4 h-4" />
          <span>{section.duration}</span>
        </div>
      )}
      
      {section.requirements?.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-sm font-medium text-slate-300">Requirements:</p>
          <ul className="list-disc list-inside text-sm text-slate-400">
            {section.requirements.map((req, idx) => (
              <li key={idx} className="mt-1">
                <RenderText text={req} className="text-sm text-slate-400 inline" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
  
  const RenderRounds = ({ event }) => {
    if (!event?.rounds?.length) return null;
    
    return (
      <div className="bg-slate-800 rounded-xl py-6 sm:py-8 border border-slate-700 mb-12" data-scroll>
        <h2 className="text-2xl font-bold text-white mb-6">Event Rounds</h2>
        <div className="space-y-8">
          {event.rounds.map((round, index) => (
            <div key={index} className="relative pl-8">
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
              <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
                {/* Round Header */}
                <div className="flex flex-wrap items-start gap-3 mb-4">
                  <h3 className="text-xl font-bold text-white">{round.name}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border
                                ${round.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' :
                                  round.status === 'ongoing' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' :
                                  'bg-purple-500/20 text-purple-400 border-purple-500/20'}`}>
                    {round.status.charAt(0).toUpperCase() + round.status.slice(1)}
                  </span>
                  <span className="text-sm text-slate-400">
                    Duration: {round.duration}
                  </span>
                </div>
  
                {/* Round Schedule */}
                <div className="flex items-center gap-3 mb-4 text-sm text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(round.startTime)} - {formatDate(round.endTime)}</span>
                </div>
  
                {/* Description */}
                {round.description && (
                  <div className="mb-4">
                    <RenderText text={round.description} />
                  </div>
                )}
  
                {/* Venue */}
                {round.venue && (
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{round.venue}</span>
                  </div>
                )}
  
                {/* Special Rules */}
                {round.specialRules?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Special Rules:</h4>
                    <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                      {round.specialRules.map((rule, idx) => (
                        <li key={idx} className="mt-1">
                          <RenderText text={rule} className="text-sm text-slate-400 inline" />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
  
                {/* Qualification Criteria */}
                {round.qualificationCriteria && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Qualification Criteria:</h4>
                    <RenderText 
                      text={round.qualificationCriteria} 
                      className="text-sm text-slate-400" 
                    />
                  </div>
                )}
  
                {/* Requirements */}
                {round.requirements?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Requirements:</h4>
                    <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                      {round.requirements.map((req, idx) => (
                        <li key={idx} className="mt-1">
                          <RenderText text={req} className="text-sm text-slate-400 inline" />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
  
                {/* Sections */}
                {round.sections?.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-medium text-white mb-4">Round Sections</h4>
                    {round.sections.map((section, idx) => (
                      <RoundSection key={idx} section={section} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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
            onClick={() => navigate('/departments')}
            className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }


  const InstructionsBanner = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
  
    if (!isOpen) return null;
  
    return (
      <div className="bg-indigo-500/10 border-b border-indigo-500/20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            
            <div className="flex-1">
              <div className="text-indigo-300 font-medium mb-1">
                Important Instructions
              </div>
              
              <div className={`text-sm text-indigo-200/90 space-y-1 overflow-hidden transition-all duration-300
                           ${isExpanded ? 'max-h-48' : 'max-h-6'}`}>
                <p>1. Read the event details, rules, and requirements carefully.</p>
                <p>2. The price shown is the worth of the event (not the actual fee).</p>
                <p>3. Add the event to cart and proceed to select your package.</p>
                <p>4. Final event fee will be based on your selected package.</p>
              </div>
  
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-1"
              >
                {isExpanded ? (
                  <>
                    <span>Show less</span>
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Read more</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
  
            <button 
              onClick={() => setIsOpen(false)}
              className="text-indigo-400 hover:text-indigo-300 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  

  return (
    <div className="min-h-screen bg-slate-900 relative pb-24">

       <div>
            <InstructionsBanner />
       </div>
      {/* Hero Section */}
      <div className="h-[60vh] relative">

        <img 
          src={event.media.bannerDesktop || "/api/placeholder/1920/1080"} 
          alt={event.eventInfo.title}
          className="w-full h-full p-2 object-fit"
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

      {event.rounds?.length > 0 && <RenderRounds  event={event} />}

{/* Coordinators Section */}
{event.coordinators.length > 0 && (
     <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 sm:p-8 border border-indigo-800/30 mb-12 shadow-lg" data-scroll>
     <h2 className="text-3xl font-bold text-white mb-8 text-center relative">
       <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
         Event Coordinators
       </span>
       <span className="block h-1 w-24 bg-gradient-to-r from-indigo-500 to-purple-500 mt-2 mx-auto rounded-full"></span>
     </h2>
     
     <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
       {event.coordinators.map((coordinator, index) => (
         <div 
           key={index} 
           className="bg-slate-900/80 backdrop-blur rounded-xl border border-indigo-700/20 overflow-hidden transform transition-all duration-300 hover:scale-103 hover:shadow-xl hover:shadow-indigo-500/10 group"
         >
           <div className="p-4">
             <div className="flex flex-col items-center text-center">
               <div className="w-44 h-44  mb-4  border-2 border-indigo-500 p-1 overflow-hidden bg-slate-800 shadow-lg">
                 <img
                   src={coordinator.photo || "/api/placeholder/100/100"}
                   alt={coordinator.name}
                   className="w-full h-full  object-contain transition-all duration-300 group-hover:scale-110"
                 />
               </div>
               
               <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                 {coordinator.name}
               </h3>
               
               <div className="space-y-2 mt-3 w-full">
                 <a href={`mailto:${coordinator.email}`} 
                    className="flex items-center justify-center gap-2 py-2 px-3 text-sm rounded-lg text-indigo-300 hover:text-white bg-slate-800/50 hover:bg-indigo-700/30 transition-all duration-200 w-full">
                   <Mail className="w-4 h-4" />
                   <span className="truncate">{coordinator.email}</span>
                 </a>
                 
                 <a href={`tel:${coordinator.phone}`}
                    className="flex items-center justify-center gap-2 py-2 px-3 text-sm rounded-lg text-indigo-300 hover:text-white bg-slate-800/50 hover:bg-indigo-700/30 transition-all duration-200 w-full">
                   <Phone className="w-4 h-4" />
                   <span>{coordinator.phone}</span>
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
              <p className="text-white line-through font-semibold text-lg">
                ₹{event.registration.fee.toLocaleString()}
              </p>
              <p className="text-gray-400  text-sm">Registration Fee</p>
            </div>
          </div>

          <button
              // Replace the current onClick handler with this
                  onClick={async () => {
                    if (!event.registration.isRegistrationOpen) return;
                    
                    if (!user?.id) {
                      toast.error('Please login to add items to cart');
                      return;
                    }

                    try {
                      setAddingToCart(true);
                      
                      console.log('Event data:', event);
                      
                      // Check for existing item in Redux store
                      const existingItem = store.getState().cart.items.find(item => 
                        item.eventInfo?.id === event.eventInfo.id
                      );
                      
                      if (existingItem) {
                        toast.error('Event already in cart!');
                        return;
                      }

                      // Add to backend first
                      const backendResponse = await addToBackendCart(user.id);
                      
                      if (backendResponse.success) {
                        // Prepare cart item with correct structure
                        const cartItem = {
                          type: 'event', // Add this
                          item: {        // Wrap the item data
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
                          }
                        };

                        // Dispatch with correct structure
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