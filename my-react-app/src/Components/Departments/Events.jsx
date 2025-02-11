import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, Trophy,Search,Loader } from 'lucide-react';
import { useParams } from 'react-router-dom';
import API_CONFIG from '../../config/api';
const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, []);

  return [elementRef, isVisible];
};

const StatusBadge = ({ status, registrationStatus }) => {
  const getStatusConfig = () => {
    if (registrationStatus === 'open') {
      return {
        text: 'Registration Open',
        className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
      };
    }

    const configs = {
      published: { text: 'Published', className: 'bg-blue-500/20 text-blue-400 border-blue-500/20' },
      draft: { text: 'Draft', className: 'bg-amber-500/20 text-amber-400 border-amber-500/20' },
      cancelled: { text: 'Cancelled', className: 'bg-red-500/20 text-red-400 border-red-500/20' },
      completed: { text: 'Completed', className: 'bg-slate-500/20 text-slate-400 border-slate-500/20' }
    };

    const displayText = registrationStatus === 'closed' ? 'Registration Closed' 
                     : registrationStatus === 'full' ? 'Registration Full'
                     : status.charAt(0).toUpperCase() + status.slice(1);

    return {
      text: displayText,
      className: configs[status]?.className || configs.completed.className
    };
  };

  const config = getStatusConfig();

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${config.className}`}>
      {config.text}
    </span>
  );
};

const EventCard = ({ event, index }) => {
  const [cardRef, isVisible] = useScrollAnimation();
  const isEven = index % 2 === 0;

  const totalPrize = useMemo(() => 
    event.details?.prizeStructure?.reduce(
      (sum, prize) => sum + (prize.amount || 0), 0
    ) || 0,
    [event.details?.prizeStructure]
  );

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formattedStartDate = useMemo(() => formatDate(event.startTime), [event.startTime]);
  const formattedEndDate = useMemo(() => formatDate(event.registrationEndTime), [event.registrationEndTime]);

  return (
    <div ref={cardRef} className="w-full">
      <div className={`transition-all duration-500 ease-out
                    ${isVisible ? 'translate-x-0 opacity-100' : 
                      isEven ? 'translate-x-8 opacity-0' : '-translate-x-8 opacity-0'}`}>
        <Link 
          to={`/departments/${event.departments[0]?._id}/events/${event._id}`}
          className="block group relative w-full h-full"
        >
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden
                       hover:border-indigo-500/30 hover:bg-slate-800/70 
                       transition-all duration-300 ease-out
                       hover:shadow-lg hover:shadow-indigo-500/10
                       group-hover:-translate-y-1 transform-gpu">
            {/* Image Section with Enhanced Animations */}
            <div className="relative h-32 overflow-hidden">
              <img
                src={event.bannerDesktop || "/api/placeholder/400/200"}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out
                         group-hover:scale-110 transform-gpu"
                loading="lazy"
              />
           
              
              {/* Animated Status Badge */}
              <div className="absolute top-2 right-2 z-10 transform-gpu
                           transition-transform duration-300 ease-out
                           group-hover:-translate-y-0.5">
                <StatusBadge status={event.status} registrationStatus={event.registrationStatus} />
              </div>

              {/* Animated Prize Badge */}
              {totalPrize > 0 && (
                <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5
                             bg-slate-900/90 backdrop-blur-sm rounded-md border border-amber-500/30
                             transform-gpu transition-all duration-300 ease-out
                             group-hover:scale-105 group-hover:border-amber-400/50
                             group-hover:shadow-lg group-hover:shadow-amber-500/20">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  <span className="text-xs font-medium text-amber-300">
                    ₹{totalPrize.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="p-3 space-y-2">
              {/* Title Section with Hover Effect */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 flex-1">
                  <h3 className="text-sm font-semibold text-white 
                               transition-colors duration-300 line-clamp-1
                               group-hover:text-indigo-400 relative">
                    {event.title}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-400
                                 group-hover:w-full transition-all duration-500 ease-out"/>
                  </h3>
                  <p className="text-xs text-slate-400 transition-colors duration-300
                             group-hover:text-slate-300">{event.departments[0]?.name}</p>
                </div>
                {event.tag && (
                  <span className="px-1.5 py-0.5 text-xs bg-indigo-500/20 text-indigo-400 
                               rounded-md border border-indigo-500/20 whitespace-nowrap
                               transition-all duration-300 ease-out
                               group-hover:bg-indigo-500/30 group-hover:border-indigo-400/30
                               transform-gpu group-hover:-translate-y-0.5">
                    {event.tag}
                  </span>
                )}
              </div>

              {/* Description with Fade Effect */}
              {event.details?.description && (
                <p className="text-xs text-slate-300 line-clamp-1
                           transition-colors duration-300 group-hover:text-slate-200">
                  {event.details.description}
                </p>
              )}

              {/* Info Grid with Subtle Animations */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Registration Info */}
                <div className="space-y-0.5 transform-gpu transition-transform duration-300
                             group-hover:-translate-y-0.5">
                  <div className="text-slate-400 text-[10px] uppercase tracking-wider">Registration</div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-indigo-400 transition-transform duration-300
                                    group-hover:scale-110" />
                    <div>
                      <div className="text-slate-300">Start: {formattedStartDate}</div>
                      <div className="text-slate-300">End: {formattedEndDate}</div>
                    </div>
                  </div>
                </div>

                {/* Duration Info */}
                <div className="space-y-0.5 transform-gpu transition-transform duration-300
                             group-hover:-translate-y-0.5">
                  <div className="text-slate-400 text-[10px] uppercase tracking-wider">Duration</div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400 transition-transform duration-300
                                  group-hover:scale-110" />
                    <span className="text-slate-300">{event.duration}</span>
                  </div>
                </div>

                {/* Slots Info */}
                {/* <div className="space-y-0.5 transform-gpu transition-transform duration-300
                             group-hover:-translate-y-0.5">
                  <div className="text-slate-400 text-[10px] uppercase tracking-wider">Slots</div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-indigo-400 transition-transform duration-300
                                  group-hover:scale-110" />
                    <span className="text-slate-300">
                      {event.registrationCount}/{event.maxRegistrations || '∞'}
                    </span>
                  </div>
                </div> */}

                {/* Fee Info */}
                <div className="space-y-0.5 transform-gpu transition-transform duration-300
                             group-hover:-translate-y-0.5">
                  <div className="text-slate-400 text-[10px] uppercase tracking-wider">Fee</div>
                  <span className="text-slate-300 font-medium">
                    {event.registrationFee > 0 ? `₹${event.registrationFee}` : 'Free'}
                  </span>
                </div>
              </div>

              {/* Enhanced Register Button */}
              <button 
                className="w-full mt-2 px-3 py-2 relative group/btn overflow-hidden
                        disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-700
                        rounded-md text-xs font-medium
                        bg-gradient-to-r from-cyan-400 to-cyan-400
                        hover:from-cyan-400 hover:to-cyan400
                        transition-all duration-500 ease-out
                        hover:scale-[1.02] active:scale-[0.98]
                        transform-gpu"
                disabled={event.registrationStatus !== 'open'}>
                <span className="relative z-10 font-bold tracking-widest text-white/90
                              group-hover/btn:text-white transition-colors duration-300">
                  REGISTER NOW
                </span>

                {/* Enhanced shimmer effects */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="w-full h-[300%] 
                               bg-gradient-to-r from-transparent via-white/40 to-transparent
                               absolute -top-[100%] -translate-x-full rotate-[90deg]
                               animate-[shimmer_3s_ease_infinite]" />
                </div>

                <div className="absolute inset-0 overflow-hidden opacity-70">
                  <div className="w-full h-[300%] 
                               bg-gradient-to-r from-transparent via-white/30 to-transparent
                               absolute -top-[100%] -translate-x-full rotate-[90deg]
                               animate-[shimmer_3s_ease_infinite_500ms]" />
                </div>

                {/* Glowing border effect */}
                <div className="absolute inset-0 rounded-md
                             border border-cyan-400/30
                             group-hover/btn:border-cyan-300/50
                             group-hover/btn:shadow-[0_0_10px_rgba(34,211,238,1)]
                             transition-all duration-500" />

                {/* Pulsing background */}
                <div className="absolute inset-0 -z-10 opacity-0 group-hover/btn:opacity-100 
                             transition-opacity duration-500">
                  <div className="absolute inset-0 bg-cyan-400/10
                               animate-[pulse_4s_ease-in-out_infinite]
                               blur-md" />
                </div>
              </button>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

const Events = () => {
  const { departmentId } = useParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

 

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const url=API_CONFIG.getUrl(`departments/${departmentId}/events`);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch events');
        }

        console.log('api',data);
        console.log('events',events);
        setEvents(data.events);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    if (departmentId) {
      fetchEvents();
    } else {
      setError('Department ID is required');
      setLoading(false);
    }

    return () => {
      // Cleanup if needed (e.g., for aborting fetch)
    };
  }, [departmentId]);

  const filteredEvents = useMemo(() => 
    events.filter(event =>
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.details?.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [events, searchTerm]
  );

  console.log('filtered events',filteredEvents);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3" role="status">
          <Loader className="w-6 h-6 text-indigo-500 animate-spin" aria-hidden="true" />
          <span className="text-white">Loading events...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            {filteredEvents.length} Upcoming Events
          </h2>
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search events..."
              className="w-full sm:w-72 px-3 py-2 text-sm rounded-lg bg-slate-900 text-white 
                     placeholder:text-slate-400 border border-slate-800 focus:outline-none 
                     focus:border-indigo-500/30 focus:ring-1 focus:ring-indigo-500/20 
                     transition-colors"
              aria-label="Search events"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" 
                   aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event, index) => (
          <EventCard key={event._id} event={event} index={index} />
        ))}

        {filteredEvents.length === 0 && !loading && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400 text-lg">No events found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;