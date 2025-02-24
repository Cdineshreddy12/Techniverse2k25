import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Clock, ChevronRight, Filter, 
  Award, Sparkles, Globe, MapPin, LayoutGrid,
  ListOrdered, ChevronLeft, Search, Users,
  SlidersHorizontal, X
} from 'lucide-react';
import API_CONFIG from '../config/api';

const CompactCard = ({ item }) => {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(item.startTime));

  const getStatus = () => {
    const now = new Date();
    const startTime = new Date(item.startTime);
    if (startTime < now) return 'completed';
    if (startTime.toDateString() === now.toDateString()) return 'ongoing';
    return 'upcoming';
  };

  const status = getStatus();
  const statusColors = {
    completed: 'text-emerald-400',
    ongoing: 'text-amber-400 animate-pulse',
    upcoming: 'text-blue-400'
  };

  return (
    <Link to={`/departments/${item.departments[0]._id}/${item.type}s/${item._id}`}>
      <div className="bg-gray-800/80 backdrop-blur rounded-xl p-3 hover:bg-gray-700/80 
                    transition-all border border-gray-700/50 hover:border-blue-500/30 
                    shadow-lg hover:shadow-blue-500/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {item.type === 'event' ? (
              <Award className={`w-4 h-4 ${statusColors[status]}`} />
            ) : (
              <Sparkles className={`w-4 h-4 ${statusColors[status]}`} />
            )}
            <span className="text-xs font-medium text-gray-400 capitalize">{item.type}</span>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${item.departments[0].color} 
                         bg-gradient-to-r text-white font-medium`}>
            {item.departments[0].shortName}
          </span>
        </div>
        
        <h3 className="text-sm font-semibold text-white mb-2 line-clamp-1">
          {item.title}
        </h3>
        
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-gray-300">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>{formattedDate}</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-gray-300">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span className="truncate">{item.venue || 'TBA'}</span>
          </div>

          {item.type === 'workshop' && (
            <div className="flex items-center gap-1.5 text-gray-300">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>{item.registration?.totalSlots || 0} slots</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

const TimelineStepper = ({ items }) => {
  const now = new Date();
  
  return (
    <div className="relative pl-4 space-y-4 md:space-y-6">
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b 
                    from-blue-500 via-purple-500 to-emerald-500" />
      
      {items.map((item) => {
        const itemDate = new Date(item.startTime);
        const isPast = itemDate < now;
        const isActive = itemDate.toDateString() === now.toDateString();
        
        return (
          <div key={item._id} className="relative">
            <div className={`absolute -left-2 w-4 h-4 rounded-full border-2 border-gray-900
              ${isPast ? 'bg-emerald-500' : 
                isActive ? 'bg-blue-500 animate-pulse' : 'bg-gray-600'}`}
            />
            
            <div className="absolute -left-24 md:-left-28 top-2">
              <span className="text-xs md:text-sm font-medium text-gray-400">
                {itemDate.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </span>
            </div>
            
            <div className="ml-6 md:ml-8">
              <CompactCard item={item} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Timeline = () => {
  const [events, setEvents] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedDay, setSelectedDay] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('card');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eventsRes, workshopsRes] = await Promise.all([
          fetch(API_CONFIG.getUrl('events')),
          fetch(API_CONFIG.getUrl('workshops'))
        ]);

        const [eventsData, workshopsData] = await Promise.all([
          eventsRes.json(),
          workshopsRes.json()
        ]);

        setEvents(eventsData.events || []);
        setWorkshops(workshopsData.workshops || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const departments = useMemo(() => {
    const deptMap = new Map();
    deptMap.set('all', { id: 'all', name: 'All Departments', shortName: 'ALL' });

    [...events, ...workshops].forEach(item => {
      item.departments.forEach(dept => {
        if (!deptMap.has(dept._id)) {
          deptMap.set(dept._id, dept);
        }
      });
    });

    return Array.from(deptMap.values());
  }, [events, workshops]);

  const filteredItems = useMemo(() => {
    const allItems = [
      ...events.map(event => ({
        ...event,
        type: 'event',
        startTime: event.startTime,
        _id: event._id
      })),
      ...workshops.map(workshop => ({
        ...workshop,
        type: 'workshop',
        startTime: workshop.registration?.startTime || workshop.createdAt,
        _id: workshop._id,
        venue: workshop.venue || 'TBA'
      }))
    ];

    return allItems.filter(item => {
      const date = new Date(item.startTime);
      const deptMatch = selectedDept === 'all' || 
        item.departments.some(d => d._id === selectedDept);
      const dayMatch = selectedDay === 'all' || 
        date.getDate().toString() === selectedDay;
      const searchMatch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase());

      return deptMatch && dayMatch && searchMatch;
    }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }, [events, workshops, selectedDept, selectedDay, searchQuery]);

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-gray-400 py-8">
        Failed to load events: {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 mt-20  sm:mt-16 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-purple-400">Timeline</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('card')}
            className={`p-2 rounded-lg transition-all
              ${view === 'card' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700/80'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('timeline')}
            className={`p-2 rounded-lg transition-all
              ${view === 'timeline' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700/80'}`}
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg md:hidden transition-all
              ${showFilters 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700/80'}`}
          >
            {showFilters ? <X className="w-4 h-4" /> : <SlidersHorizontal className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Filters - Desktop */}
      <div className="hidden md:block mb-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800/80 backdrop-blur border border-gray-700/50 
                       rounded-xl px-4 py-2 pl-10 focus:outline-none focus:border-blue-500/50 
                       text-gray-300 placeholder-gray-500"
            />
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex gap-2">
            {['all', '7', '8', '9'].map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all
                  ${selectedDay === day 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700/80'}`}
              >
                {day === 'all' ? 'All Days' : `Mar ${day}`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {departments.map(dept => (
            <button
              key={dept.id}
              onClick={() => setSelectedDept(dept.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all
                ${selectedDept === dept.id 
                  ? `${dept.color || 'bg-blue-500'} text-white` 
                  : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700/80'}`}
            >
              {dept.shortName || dept.name}
            </button>
          ))}
        </div>
      </div>

      {/* Filters - Mobile */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-96 mb-6' : 'max-h-0'}`}>
        <div className="space-y-4 py-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800/80 backdrop-blur border border-gray-700/50 
                       rounded-xl px-4 py-2 pl-10 focus:outline-none focus:border-blue-500/50 
                       text-gray-300 placeholder-gray-500"
            />
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex flex-wrap gap-2">
            {['all', '7', '8', '9'].map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all flex-1
                  ${selectedDay === day 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700/80'}`}
              >
                {day === 'all' ? 'All Days' : `Mar ${day}`}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {departments.map(dept => (
              <button
                key={dept.id}
                onClick={() => setSelectedDept(dept.id)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all
                  ${selectedDept === dept.id 
                    ? `${dept.color || 'bg-blue-500'} text-white` 
                    : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700/80'}`}
              >
                {dept.shortName || dept.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {view === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {paginatedItems.map(item => (
            <CompactCard key={item._id} item={item} />
          ))}
        </div>
      ) : (
        <div className="pl-24 md:pl-32">
          <TimelineStepper items={paginatedItems} />
        </div>
      )}

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-8 md:py-12">
          <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No events found</p>
          <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
        </div>
      )}

      {/* Pagination */}
      {filteredItems.length > ITEMS_PER_PAGE && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-gray-800/80 text-gray-400 hover:bg-gray-700/80 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-4 py-2 rounded-lg bg-gray-800/80 text-gray-400">
            Page {currentPage} of {Math.ceil(filteredItems.length / ITEMS_PER_PAGE)}
          </span>
          <button
            onClick={() => setCurrentPage(prev => 
              Math.min(Math.ceil(filteredItems.length / ITEMS_PER_PAGE), prev + 1)
            )}
            disabled={currentPage >= Math.ceil(filteredItems.length / ITEMS_PER_PAGE)}
            className="p-2 rounded-lg bg-gray-800/80 text-gray-400 hover:bg-gray-700/80 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Timeline;