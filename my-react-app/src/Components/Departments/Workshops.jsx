import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { workshopService } from '../../../services/workshopService';
import { useMemo } from 'react';
import { Image as ImageIcon } from 'lucide-react';

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

const WorkshopCard = ({ workshop, index }) => {
  const [cardRef, isVisible] = useScrollAnimation();
  const [imageError, setImageError] = useState(false);
  const isEven = index % 2 === 0;
  
  // Extract department ID from the workshop's departments array
  const departmentId = workshop.departments?.[0]?._id;

  // Handle image loading errors
  const handleImageError = () => {
    setImageError(true);
  };

  if (!workshop || !departmentId) return null;
  
  return (
    <div ref={cardRef} className="relative h-full w-full overflow-hidden">
      <div className={`transition-all duration-500 ease-out ${
        isVisible ? 'translate-x-0 opacity-100' : 
        isEven ? 'translate-x-full opacity-0' : '-translate-x-full opacity-0'
      }`}>
        <Link 
          to={`/departments/${departmentId}/workshops/${workshop._id}`}
          className="block group relative w-full h-full"
        >
          <div className="relative h-full bg-slate-900/95 rounded-xl overflow-hidden border 
                         border-slate-800/50 transition-all duration-300
                         hover:scale-105 hover:border-slate-700/50">
            <div className="flex flex-col h-full">
              {/* Image Section */}
              <div className="w-full h-48 relative">
                {imageError || (!workshop.bannerDesktop && !workshop.bannerMobile) ? (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-violet-800 flex flex-col items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-indigo-300 mb-2 opacity-60" />
                    <p className="text-sm text-indigo-300 font-medium text-center px-4 line-clamp-1">{workshop.title}</p>
                  </div>
                ) : (
                  <img
                    src={workshop.bannerDesktop || workshop.bannerMobile}
                    alt={workshop.title}
                    className="w-full h-full object-contain"
                    onError={handleImageError}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium 
                                  border backdrop-blur-sm ${getStatusStyles(workshop.status)}`}>
                    {workshop.status}
                  </span>
                </div>
                
                {/* Price Badge */}
                <span className="absolute top-4 line-through right-4 px-2.5 py-1 bg-slate-900/80 backdrop-blur-sm 
                               rounded-md text-xs text-green-400 border border-green-500/30">
                  ₹{workshop.price}
                </span>
              </div>

              {/* Content Section */}
              <div className="p-4 space-y-3 flex-grow">
                <h3 className="text-lg font-semibold text-white line-clamp-2">
                  {workshop.title}
                </h3>

                <pre className="text-slate-300 text-sm line-clamp-2">
                  {workshop.description}
                </pre>

                {/* Details Section */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <div className="text-xs text-slate-300">
                    {workshop.departments?.map(dept => (
                      <span key={dept._id} className="mr-2">
                        {dept.name}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-slate-300">
                    Registrations Ends: {formatDate(workshop.registrationEndTime)}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-800/50">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-300">
                    {workshop.registration?.registeredCount || 0} Registered
                  </span>
                  <span className="text-sm text-indigo-400">
                    View Details →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
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
  const { departmentId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [headerRef, isHeaderVisible] = useScrollAnimation();

  const [page, setPage] = useState(1);
  const limit = 10;

  // Updated query with proper options
  const { data: workshopsData, isLoading, error } = useQuery({
    queryKey: ['workshops', departmentId, page, searchQuery],
    queryFn: () => workshopService.getWorkshopsByDepartment(departmentId, {
      page,
      limit,
      search: searchQuery
    }),
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });

  // Filter workshops based on search query
  const filteredWorkshops = useMemo(() => {
    if (!workshopsData?.workshops) return [];
    return workshopsData.workshops;
  }, [workshopsData]);

  // Add pagination handling
  const totalPages = workshopsData?.pagination?.pages || 1;

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

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
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-white">
            Technical Workshops
          </h2>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1); // Reset to first page on new search
              }}
              placeholder="Search workshops..."
              className="w-full sm:w-72 px-4 py-2 rounded-lg 
                       bg-slate-800 text-white 
                       border border-slate-700 
                       focus:outline-none focus:border-indigo-500
                       placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Workshops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkshops.map((workshop, index) => (
          <WorkshopCard 
            key={workshop._id} 
            workshop={workshop} 
            index={index}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredWorkshops.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No workshops found matching your criteria.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-4 py-2 rounded ${
                page === pageNum
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Workshops;