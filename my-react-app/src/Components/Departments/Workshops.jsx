import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { workshopService } from '../../../services/workshopService';
import { useMemo } from 'react';
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
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
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

const WorkshopCard = ({ workshop, index,deptId }) => {
  const [cardRef, isVisible] = useScrollAnimation();
  const isEven = index % 2 === 0;
    // Extract department ID from the workshop's departments array
    const departmentId = workshop.departments[0]?._id;
  console.log('deptID',departmentId )
  return (
    <div 
      ref={cardRef}
      className="relative h-full w-[100%] overflow-hidden"
    >
      {/* Animation wrapper */}
      <div className={`absolute inset-0 transition-all duration-500 ease-out
                    ${isVisible ? 'translate-x-0 opacity-100' : 
                      isEven ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0'}`}>
        <Link 
          to={`/departments/${departmentId }/workshops/${workshop._id}`}
          className="block group relative w-full h-full"
        >
          {/* Mobile-visible, desktop-hover glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-cyan-500/5 
                        rounded-xl opacity-50 blur-[1px] transition-all duration-300
                        md:opacity-0 md:group-hover:opacity-0" />
          
          <div className="relative h-full bg-slate-900/95 rounded-xl overflow-hidden border 
                        border-slate-800/50 transition-all duration-300
                        md:hover:scale-[1.01] md:hover:border-slate-700/50">
            {/* Gradient line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-purple-500/30 via-indigo-500/30 to-cyan-500/30
                          opacity-100 md:opacity-30 md:group-hover:opacity-100" />
            
            {/* Content container */}
            <div className="flex flex-col h-full">
              {/* Image Section */}
              <div className="w-full h-48 relative">
                <img
                  src={workshop.bannerDesktop || workshop.bannerMobile}
                  alt={workshop.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium 
                               border backdrop-blur-sm
                               ${getStatusStyles(workshop.status)}`}>
                    {workshop.status}
                  </span>
                </div>
                
                {/* Duration */}
                <span className="absolute top-4 right-4 px-2.5 py-1 bg-slate-900/80 backdrop-blur-sm 
                             rounded-md text-xs text-slate-300 border border-slate-700/30">
                  {workshop.schedule?.length * 2 || 0} Hours
                </span>
              </div>

              <div className="p-4 sm:p-5 space-y-3 flex-grow">
                {/* Title */}
                <h3 className="text-lg font-semibold text-white">
                  {workshop.title}
                </h3>

                {/* Description with fixed height */}
                <div className="h-12">
                  <p className="text-slate-300 text-sm line-clamp-2 leading-relaxed">
                    {workshop.description}
                  </p>
                </div>

                {/* Time and Date */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <svg className="w-4 h-4 text-indigo-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(workshop.registrationEndTime)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <svg className="w-4 h-4 text-indigo-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{workshop.registrations} Registrations</span>
                  </div>
                </div>
              </div>

              {/* Register button */}
              <div className="h-16 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900
                           flex items-center justify-center transition-all duration-300 
                           opacity-100 md:opacity-80 md:group-hover:opacity-100">
                <span className="text-indigo-300 text-xs font-medium flex items-center gap-1.5">
                  Register Now
                  <svg className="w-3.5 h-3.5 transform translate-x-0 transition-transform group-hover:translate-x-0.5" 
                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>
      
      {/* Placeholder to maintain layout */}
      <div className="invisible">
        <div className="h-full bg-transparent rounded-xl border border-transparent">
          <div className="h-48" />
          <div className="p-4 sm:p-5 space-y-3">
            <h3 className="text-lg">Title placeholder</h3>
            <div className="h-12">
              <p className="text-sm">Description placeholder</p>
            </div>
            <div className="pt-3 border-t">
              <div className="flex justify-between">
                <span>Date</span>
                <span>Time</span>
              </div>
            </div>
          </div>
          <div className="h-10" />
        </div>
      </div>
    </div>
  );
};

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'Not specified';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusStyles = (status) => {
  switch (status?.toLowerCase()) {
    case 'upcoming':
      return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/20';
    case 'ongoing':
      return 'bg-green-500/20 text-green-300 border-green-500/20';
    case 'completed':
      return 'bg-gray-500/20 text-gray-300 border-gray-500/20';
    case 'cancelled':
      return 'bg-red-500/20 text-red-300 border-red-500/20';
    default:
      return 'bg-slate-500/20 text-slate-300 border-slate-500/20';
  }
};

const Workshops = () => {
  const { deptId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [headerRef, isHeaderVisible] = useScrollAnimation();
  console.log('deptID',deptId);
  // Fetch workshops using React Query
  const { data: workshopsData, isLoading, error } = useQuery({
    queryKey: ['workshops', deptId],
    queryFn: () => deptId ? workshopService.getWorkshopsByDepartment(deptId) : workshopService.getAll(),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes
  });

  // Filter workshops based on search query and department
  const filteredWorkshops = useMemo(() => {
    if (!workshopsData) return [];
    
    return workshopsData.filter(workshop => {
      return searchQuery.trim() === '' || 
        workshop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workshop.description.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [workshopsData,deptId,searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Failed to load workshops. Please try again later.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Search Section */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            Technical Workshops
          </h2>
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workshops..."
              className="w-full sm:w-72 px-3 py-2 text-sm rounded-lg 
                        bg-slate-800 text-white 
                        placeholder:text-slate-400 
                        border border-slate-700 
                        focus:outline-none 
                        focus:border-indigo-500/30 
                        focus:ring-1 
                        focus:ring-indigo-500/20 
                        transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Workshops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full">
        {filteredWorkshops.map((workshop, index) => (
          <WorkshopCard key={workshop._id} deptId={deptId} workshop={workshop} index={index} />
        ))}
      </div>

      {/* No results message */}
      {filteredWorkshops.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No workshops found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Workshops;