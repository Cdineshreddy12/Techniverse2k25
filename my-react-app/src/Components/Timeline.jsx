import React, { useState, useCallback, useMemo,useEffect } from 'react';
import { 
  Calendar, Clock, ChevronRight, Filter, ChevronDown,
  Check, Timer, AlertCircle, Code, Cpu,
  Database, Brain, Globe, Monitor, Power,X,
  ChevronLeft, Search
} from 'lucide-react';

const events = [
    {
      date: "March 15",
      startTime: "09:00",
      title: "Opening Ceremony",
      desc: "Keynote speakers & cultural events",
      branch: "all",
      venue: "Main Auditorium",
      type: "ceremony",
      icon: Calendar
    },
    {
        date: "March 15",
        startTime: "09:00",
        title: "Opening Ceremony",
        desc: "Keynote speakers & cultural events",
        branch: "all",
        venue: "Main Auditorium",
        type: "ceremony",
        icon: Calendar
      },
      {
        date: "March 15",
        startTime: "09:00",
        title: "Opening Ceremony",
        desc: "Keynote speakers & cultural events",
        branch: "all",
        venue: "Main Auditorium",
        type: "ceremony",
        icon: Calendar
      },
      {
        date: "March 15",
        startTime: "09:00",
        title: "Opening Ceremony",
        desc: "Keynote speakers & cultural events",
        branch: "all",
        venue: "Main Auditorium",
        type: "ceremony",
        icon: Calendar
      },
      {
        date: "March 15",
        startTime: "09:00",
        title: "Opening Ceremony",
        desc: "Keynote speakers & cultural events",
        branch: "all",
        venue: "Main Auditorium",
        type: "ceremony",
        icon: Calendar
      },
      {
        date: "March 15",
        startTime: "09:00",
        title: "Opening Ceremony",
        desc: "Keynote speakers & cultural events",
        branch: "all",
        venue: "Main Auditorium",
        type: "ceremony",
        icon: Calendar
      },
      {
        date: "March 15",
        startTime: "09:00",
        title: "Opening Ceremony",
        desc: "Keynote speakers & cultural events",
        branch: "all",
        venue: "Main Auditorium",
        type: "ceremony",
        icon: Calendar
      }
      ,  {
        date: "March 15",
        startTime: "09:00",
        title: "Opening Ceremony",
        desc: "Keynote speakers & cultural events",
        branch: "all",
        venue: "Main Auditorium",
        type: "ceremony",
        icon: Calendar
      }


    // Add more events as needed
  ];


  const branches = [
    { id: 'all', name: 'All Events', icon: Globe },
    { id: 'cse', name: 'Computer Science', icon: Code },
    { id: 'ece', name: 'Electronics', icon: Cpu },
    { id: 'mech', name: 'Mechanical', icon: Monitor },
    { id: 'civil', name: 'Civil', icon: Database },
    { id: 'electrical', name: 'Electrical', icon: Power }
  ];


  const MobileFilters = ({ 
    selectedBranch, 
    setSelectedBranch, 
    selectedDay, 
    setSelectedDay,
    branches,
    searchQuery,
    setSearchQuery
  }) => {
    const [isOpen, setIsOpen] = useState(false);
  
    return (
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-2 bg-slate-800 rounded-lg
                   text-gray-400 hover:bg-slate-700 transition-colors"
        >
          <span>Filters</span>
          <Filter className="w-4 h-4" />
        </button>
  
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm">
            <div className="min-h-screen p-4">
              <div className="bg-slate-900 rounded-lg p-4">
                {/* Close button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-slate-800 rounded-full"
                  >
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>
  
                {/* Search */}
                <div className="relative mb-6">
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg 
                             px-4 py-2 pl-10 focus:outline-none focus:border-cyan-500/50 text-gray-300"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
  
                {/* Branch filters */}
                <div className="space-y-2 mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Department</h3>
                  {branches.map(branch => (
                    <button
                      key={branch.id}
                      onClick={() => setSelectedBranch(branch.id)}
                      className={`w-full flex items-center gap-2 px-4 py-3 rounded-lg transition-all
                        ${selectedBranch === branch.id 
                          ? 'bg-cyan-500 text-white' 
                          : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}
                    >
                      <branch.icon className="w-4 h-4" />
                      <span>{branch.name}</span>
                    </button>
                  ))}
                </div>
  
                {/* Day filters */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Day</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {['all', '15', '16', '17'].map(day => (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`px-4 py-3 rounded-lg transition-all text-center
                          ${selectedDay === day 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}
                      >
                        {day === 'all' ? 'All Days' : `March ${day}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  

function PaginationControls({ currentPage, totalPages, filteredEvents, ITEMS_PER_PAGE, setCurrentPage }) {
    return (
      <div className="mt-8 flex items-center justify-between">
        <div className="text-gray-400">
          Showing{' '}
          {Math.min(((currentPage - 1) * ITEMS_PER_PAGE) + 1, filteredEvents.length)}
          {' '}to{' '}
          {Math.min(currentPage * ITEMS_PER_PAGE, filteredEvents.length)}
          {' '}of{' '}
          {filteredEvents.length} events
        </div>
  
        <div className="flex items-center gap-2">
          {/* Previous Page Button */}
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-slate-800 text-gray-400 hover:bg-slate-700
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
  
          {/* Page Numbers */}
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg transition-colors
                  ${currentPage === i + 1 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}
                aria-label={`Page ${i + 1}`}
                aria-current={currentPage === i + 1 ? 'page' : undefined}
              >
                {i + 1}
              </button>
            ))}
          </div>
  
          {/* Next Page Button */}
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-slate-800 text-gray-400 hover:bg-slate-700
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const statusIcons = {
    completed: <Check className="w-4 h-4 text-green-400" />,
    ongoing: <Timer className="w-4 h-4 text-yellow-400 animate-pulse" />,
    upcoming: <AlertCircle className="w-4 h-4 text-cyan-400" />
  };
  
  // Timeline Event Component
  const TimelineEvent = ({ event, index, status,isMobile }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    

    if (isMobile) {
        return (
          <div className="relative pl-8 pb-8 last:pb-0">
            {/* Vertical line */}
            <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-500 via-purple-500 to-cyan-500" />
            
            {/* Event dot with glow */}
            <div className="absolute left-[16px] top-4 -translate-x-1/2 z-10">
              <div className={`w-6 h-6 rounded-full 
                ${status === 'completed' ? 'bg-green-500' : 
                  status === 'ongoing' ? 'bg-yellow-500' : 'bg-cyan-500'}`}>
                <div className={`absolute inset-0 rounded-full 
                  ${status === 'ongoing' ? 'animate-ping' : ''}
                  ${status === 'completed' ? 'bg-green-500/50' : 
                    status === 'ongoing' ? 'bg-yellow-500/50' : 'bg-cyan-500/50'}`} />
              </div>
            </div>
    
            {/* Content Card */}
            <div className="ml-6 bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 
                          border border-slate-700/50 hover:border-cyan-500/30 
                          transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                {statusIcons[status]}
                <div className="flex flex-col">
                  <span className="text-cyan-400 font-bold">{event.date}</span>
                  <span className="text-sm text-gray-400">{event.startTime}</span>
                </div>
              </div>
              
              <div className="font-semibold text-lg text-white mb-2">{event.title}</div>
              <div className={`text-sm text-gray-400 transition-all duration-300
                ${isExpanded ? '' : 'line-clamp-2'}`}>
                {event.desc}
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-purple-400">
                  <event.icon className="w-4 h-4" />
                  <span>{event.venue}</span>
                </div>
                {event.desc.length > 100 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    {isExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      }
       else{
            
                return( <div 
                    className={`relative flex items-center gap-8 mb-8 group
                    ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                    <div className={`w-1/2 flex flex-col ${index % 2 === 0 ? 'items-end text-right' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                        {statusIcons[status]}
                        <div className="text-xl font-bold text-cyan-400">{event.date}</div>
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div className="text-gray-400">{event.startTime}</div>
                    </div>
                    <div className="text-lg font-semibold group-hover:text-cyan-400 transition-colors">
                        {event.title}
                    </div>
                    <div className="text-gray-400 text-sm">{event.desc}</div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-purple-400">
                        <event.icon className="w-4 h-4" />
                        <span>{event.venue}</span>
                    </div>
                    </div>
                
                    <div className={`absolute left-1/2 w-4 h-4 rounded-full transform -translate-x-1/2
                                transition-all duration-300
                                ${status === 'completed' ? 'bg-green-500' : 
                                    status === 'ongoing' ? 'bg-yellow-500' : 'bg-cyan-500'}
                                group-hover:scale-150 group-hover:bg-purple-500`}>
                    <div className={`absolute inset-0 rounded-full
                                    ${status === 'ongoing' ? 'animate-ping' : ''}
                                    ${status === 'completed' ? 'bg-green-500' : 
                                    status === 'ongoing' ? 'bg-yellow-500' : 'bg-cyan-500'}`} />
                    </div>
                
                    <div className="w-1/2" />
                </div>)
       }
  };




function Timeline() {
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedDay, setSelectedDay] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('compact'); // 'compact' or 'full'
  const ITEMS_PER_PAGE = 6;

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Enhanced pagination for mobile
  const getVisiblePageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    
    if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };


  // Event status calculation
  const getEventStatus = useCallback((date, startTime) => {
    const eventDateTime = new Date(`2025-${date} ${startTime}`);
    const now = new Date();
    return now > eventDateTime ? 'completed' : 
           now.toDateString() === eventDateTime.toDateString() ? 'ongoing' : 'upcoming';
  }, []);

  // Filter and search events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const branchMatch = selectedBranch === 'all' || event.branch === selectedBranch;
      const dayMatch = selectedDay === 'all' || event.date.includes(selectedDay);
      const searchMatch = !searchQuery || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return branchMatch && dayMatch && searchMatch;
    });
  }, [events, selectedBranch, selectedDay, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEvents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEvents, currentPage]);

  // Compact View Event Card
  const CompactEventCard = ({ event, status }) => (
    <div className="bg-slate-800/50 rounded-lg p-4 hover:bg-slate-800 transition-all
                    border border-transparent hover:border-cyan-500/30 group cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {statusIcons[status]}
          <span className="text-cyan-400 font-bold">{event.date} {event.startTime}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 
                               group-hover:translate-x-1 transition-all" />
      </div>
      <div className="font-semibold group-hover:text-cyan-400 transition-colors">
        {event.title}
      </div>
      <div className="text-sm text-gray-400 line-clamp-1">{event.desc}</div>
      <div className="mt-2 flex items-center gap-2 text-sm text-purple-400">
        <event.icon className="w-4 h-4" />
        <span>{event.venue}</span>
      </div>
    </div>
  );

  return (
    <div className="relative max-w-6xl mx-auto">

<div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 blur-2xl z-100" />
    
    {/* Main title container */}
    <div className="relative flex flex-col items-center">
      {/* Small decorative label */}
      <div className="text-sm font-semibold text-cyan-400 mb-2 tracking-wider">
        SCHEDULE & HIGHLIGHTS
      </div>
      
      {/* Main title */}
      <h2 className="text-4xl md:text-5xl pb-4 lg:text-6xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 mb-4">
        Journey Through The TechFest
      </h2>
      
      {/* Decorative line */}
      <div className="flex items-center gap-4 w-full max-w-xs">
        <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent flex-grow" />
        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
        <div className="h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent flex-grow" />
      </div>
      
      {/* Subtitle */}
      <p className="mt-4 text-gray-400 text-center max-w-2xl mx-auto">
        Discover our exciting three-day lineup of workshops, competitions, and celebrations that will shape the future of technology
      </p>
    </div>


        <div className="md:hidden">
            <MobileFilters 
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            branches={branches}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            />
        </div>


      {/* Header Controls */}
      <div className="hidden md:block">
            {/* Search and View Toggle */}
            <div className="flex items-center justify-between mb-6">
            <div className="relative w-64">
                <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 pl-10
                        focus:outline-none focus:border-cyan-500/50 text-gray-300"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <button
                onClick={() => setView(v => v === 'compact' ? 'full' : 'compact')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-gray-400
                        hover:bg-slate-700 transition-colors"
            >
                <span>{view === 'compact' ? 'Timeline View' : 'Compact View'}</span>
                <ChevronDown className="w-4 h-4" />
            </button>
            </div>

            {/* Branch and Day Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-2">
                {branches.map(branch => (
                <button
                    key={branch.id}
                    onClick={() => setSelectedBranch(branch.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all
                    ${selectedBranch === branch.id 
                        ? 'bg-cyan-500 text-white' 
                        : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}
                >
                    <branch.icon className="w-4 h-4" />
                    <span className="whitespace-nowrap">{branch.name}</span>
                </button>
                ))}
            </div>
            <div className="flex flex-wrap gap-2">
                {['all', '15', '16', '17'].map(day => (
                <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-4 py-2 rounded-full transition-all whitespace-nowrap
                    ${selectedDay === day 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}
                >
                    {day === 'all' ? 'All Days' : `March ${day}`}
                </button>
                ))}
            </div>
            </div>
        </div>

      {/* Events Display */}
       {view === 'compact' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedEvents.map((event, index) => (
            <CompactEventCard 
              key={index} 
              event={event} 
              status={getEventStatus(event.date, event.startTime)} 
            />
          ))}
        </div>
      ) : (
        <div className="relative">
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-cyan-500 via-purple-500 to-cyan-500" />
          {paginatedEvents.map((event, index) => (
             <TimelineEvent
             key={index}
             event={event}
             index={index}
             status={getEventStatus(event.date, event.startTime)}
             isMobile={isMobile}
           />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <PaginationControls 
        currentPage={currentPage}
        totalPages={totalPages}
        filteredEvents={filteredEvents}
        ITEMS_PER_PAGE={ITEMS_PER_PAGE}
        setCurrentPage={setCurrentPage}
        getVisiblePageNumbers={getVisiblePageNumbers}
      />

      
    </div>
  );
}

export default Timeline;
