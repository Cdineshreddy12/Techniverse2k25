import React, { useState, useEffect, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Loader, Search, SortAsc, SortDesc } from 'lucide-react';
import { toast } from 'react-hot-toast';
import debounce from 'lodash/debounce';

const RegistrationsPreview = () => {
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    paymentStatus: '',
    package: ''
  });

  const pageSize = 50;
  const parentRef = React.useRef();

  // Virtual row renderer
  const rowVirtualizer = useVirtualizer({
    count: registrations.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // row height estimate
    overscan: 20
  });

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      setFilters(prev => ({ ...prev, search: value }));
      setCurrentPage(1);
      setRegistrations([]);
      fetchRegistrations(1, true);
    }, 300),
    []
  );

  const fetchRegistrations = async (page, reset = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page,
        pageSize,
        ...filters
      });

      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/api/registrations-preview?${queryParams}`
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setRegistrations(prev => 
        reset ? data.data.registrations : [...prev, ...data.data.registrations]
      );
      setTotalRecords(data.data.pagination.total);
      setHasMore(page < data.data.pagination.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
      toast.error('Failed to load registrations');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRegistrations(1, true);
  }, [filters.sortBy, filters.sortOrder, filters.paymentStatus, filters.package]);

  // Intersection observer for infinite scroll
  const lastRowRef = useCallback((node) => {
    if (isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchRegistrations(currentPage + 1);
        }
      },
      { threshold: 0.5 }
    );

    if (node) observer.observe(node);
  }, [isLoading, hasMore, currentPage]);

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl">
      {/* Header and Controls */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">
            Registrations Preview
            {totalRecords > 0 && (
              <span className="ml-2 text-sm text-gray-400">
                ({totalRecords} total)
              </span>
            )}
          </h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search registrations..."
                onChange={(e) => debouncedSearch(e.target.value)}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg pl-10 focus:ring-2 focus:ring-sky-500 outline-none"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* Virtual Table */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: '600px' }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative'
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const registration = registrations[virtualRow.index];
            return (
              <div
                key={registration._id}
                ref={
                  virtualRow.index === registrations.length - 1 
                    ? lastRowRef 
                    : null
                }
                className={`absolute top-0 left-0 w-full border-b border-gray-700 ${
                  virtualRow.index % 2 ? 'bg-gray-800' : 'bg-gray-750'
                }`}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`
                }}
              >
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">
                      {registration.student?.name}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {registration.transactionId}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      registration.paymentStatus === 'completed'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-orange-500/10 text-orange-400'
                    }`}>
                      {registration.paymentStatus}
                    </span>
                    <span className="text-sky-400">
                      ₹{registration.amount}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="p-4 flex justify-center">
          <Loader className="w-6 h-6 animate-spin text-sky-500" />
        </div>
      )}
      
      {error && (
        <div className="p-4 text-red-400 text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default RegistrationsPreview;