import React, { useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, Trophy, Search, Loader, AlertCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import API_CONFIG from '../../config/api';

// Custom hook for scroll animation
const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  React.useEffect(() => {
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

// Fetch events function for React Query
const fetchEvents = async (departmentId) => {
  if (!departmentId) {
    throw new Error('Department ID is required');
  }
  
  const url = API_CONFIG.getUrl(`departments/${departmentId}/events`);
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch events');
  }
  
  return data.events;
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
  
  const registrationStatus = useMemo(() => {
    const now = new Date();
    const endDate = new Date(event.registrationEndTime);
    const remainingSlots = event.maxRegistrations - (event.registrationCount || 0);
    
    if (endDate < now) return { status: 'closed', message: 'Closed' };
    if (remainingSlots <= 0) return { status: 'full', message: 'Full' };
    return { 
      status: 'open', 
      message: `${remainingSlots} slots`,
      slots: remainingSlots
    };
  }, [event.registrationEndTime, event.maxRegistrations, event.registrationCount]);

  const endDate = useMemo(() => {
    return new Date(event.registrationEndTime).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short'
    });
  }, [event.registrationEndTime]);

  return (
    <div ref={cardRef} className="w-full">
      <Link to={`/departments/${event.departments[0]?._id}/events/${event._id}`}
            className="block group">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden
                       hover:border-indigo-500/30 hover:bg-slate-800/70 transition-all">
          {/* Image */}
          <div className="relative h-80 overflow-hidden">
            <img
              src={event.bannerDesktop || "/api/placeholder/400/200"}
              alt={event.title}
              className="w-full h-full object-fit group-hover:scale-105 transition-transform"
              loading="lazy"
            />
            
            {/* Status */}
            <div className="absolute top-2 right-2">
              <span className={`px-2 py-0.5 text-xs rounded-full border ${
                registrationStatus.status === 'open' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' :
                'bg-red-500/20 text-red-400 border-red-500/20'
              }`}>
                {registrationStatus.message}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 space-y-2">
            {/* Title */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-medium text-white line-clamp-1 group-hover:text-indigo-400">
                {event.title}
              </h3>
              {event.tag && (
                <span className="px-1.5 py-0.5 text-[10px] bg-indigo-500/20 text-indigo-400 
                               rounded border border-indigo-500/20 whitespace-nowrap">
                  {event.tag}
                </span>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] sm:text-xs">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-400" />
                <span className="text-slate-300">{event.duration}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-400" />
                <span className="text-slate-300">Until {endDate}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-indigo-400" />
                <span className="text-slate-300">{registrationStatus.slots || 'No'} slots</span>
              </div>
            </div>

            {/* Action Button */}
            <button 
              className={`w-full px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                registrationStatus.status === 'open'
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  : 'bg-slate-700 text-slate-300 cursor-not-allowed'
              }`}
              disabled={registrationStatus.status !== 'open'}
            >
              {registrationStatus.status === 'open' ? 'Add to Cart' : 'Closed'}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

const EventsInstructions = () => (
  <div className="bg-slate-800/50 border border-indigo-500/20 rounded-lg p-4 mb-6">
    <h3 className="text-lg font-semibold text-white mb-3">How to Register for Events</h3>
    <div className="space-y-2 text-sm text-slate-300">
      <ol className="list-decimal list-inside space-y-2">
        <li className="flex items-start gap-2">
          <span className="text-indigo-400 font-medium">Browse Events:</span>
          <span>View events from your branch and check their requirements and rules carefully.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-indigo-400 font-medium">Add to Cart:</span>
          <span>Add your preferred events to cart. Note: Displayed prices are not applied, only the selected package price will be applied to you</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-indigo-400 font-medium">Check Slots:</span>
          <span>Verify available slots before proceeding - registrations are first-come-first-served.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-indigo-400 font-medium">Select Package:</span>
          <span>Go to cart, choose your package, and proceed to payment.</span>
        </li>
      </ol>
      
      <div className="mt-4 flex items-center gap-2 text-amber-400 text-sm">
        <AlertCircle className="w-4 h-4" />
        <p>Important: Registration is confirmed only after successful payment and package selection in the cart.</p>
      </div>
    </div>
  </div>
);

const Events = () => {
  const { departmentId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');

  // Using TanStack Query for fetching and caching events
  const { 
    data: events = [], 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['events', departmentId],
    queryFn: () => fetchEvents(departmentId),
    staleTime: 1000 * 60 * 10, // 10 minutes - event data considered fresh for 10 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour - keep unused data in cache for an hour
    enabled: !!departmentId,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const filteredEvents = useMemo(() => 
    events.filter(event =>
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.details?.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [events, searchTerm]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3" role="status">
          <Loader className="w-6 h-6 text-indigo-500 animate-spin" aria-hidden="true" />
          <span className="text-white">Loading events...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div>
        <EventsInstructions /> 
      </div>

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

        {filteredEvents.length === 0 && !isLoading && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400 text-lg">No events found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;