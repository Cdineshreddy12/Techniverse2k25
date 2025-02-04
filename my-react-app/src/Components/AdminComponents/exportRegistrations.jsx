import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useInView } from 'react-intersection-observer';
import { toast } from 'react-hot-toast';
import { useRegistrations, useRegistrationStats } from './UserRegistrations';
import { StatsSection } from './Stats';
import { FilterSection } from './FilterSection';
import { ColumnSelection } from './ColumnSelection';
import { ActionBar } from './ActionBar';
import { DataPreview } from './DataPreview';
import { AnalysisSection } from './analysisSection.jsx';
import { downloadRegistrations } from '../utils/download';
import { AVAILABLE_COLUMNS, DEFAULT_FILTERS } from '../constants';

const ExportRegistrations = () => {
  const [showStats, setShowStats] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState([
    'Transaction ID', 'Student Name', 'Email', 'Package', 'Amount', 'Payment Status'
  ]);
  
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const memoizedFilters = useMemo(() => filters, [
    filters.sortBy,
    filters.sortOrder,
    filters.searchTerm,
    filters.paymentStatus,
    filters.package,
    filters.branch,
    filters.startDate,
    filters.endDate
  ]);
  
  const parentRef = useRef(null);
  const { ref: lastRowRef, inView } = useInView();

  const {
    registrations,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
    refetch
  } = useRegistrations(memoizedFilters);

  const { 
    data: stats,
    isLoading: isStatsLoading,
    error: statsError 
  } = useRegistrationStats();

  const rowVirtualizer = useVirtualizer({
    count: registrations.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5
  });

  const handleSearch = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  }, []);

  const handleSort = useCallback((field) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  React.useEffect(() => {
    if (inView && hasNextPage && !isLoading) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isLoading, fetchNextPage]);

  const handleDownload = async (filtered = false) => {
    try {
      await downloadRegistrations(filtered, filters, selectedColumns);
      toast.success('Download completed successfully!');
    } catch (err) {
      toast.error(`Download failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen mt-16 bg-gradient-to-b from-gray-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <ActionBar
          showStats={showStats}
          setShowStats={setShowStats}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          showPreview={showPreview}
          setShowPreview={setShowPreview}
          showAnalysis={showAnalysis}
          setShowAnalysis={setShowAnalysis}
          handleSearch={handleSearch}
          searchTerm={filters.searchTerm}
          isLoading={isLoading}
          handleDownload={handleDownload}
          refetch={refetch}
        />

        {showStats && (
          <StatsSection 
            stats={stats} 
            isLoading={isStatsLoading} 
            error={statsError} 
          />
        )}

        <div className="bg-gray-800/50 backdrop-blur-xl rounded-lg shadow-lg border border-gray-700">
          <ColumnSelection
            availableColumns={AVAILABLE_COLUMNS}
            selectedColumns={selectedColumns}
            setSelectedColumns={setSelectedColumns}
          />

          {showFilters && (
            <FilterSection
              filters={filters}
              setFilters={setFilters}
              isLoading={isLoading}
              handleDownload={handleDownload}
            />
          )}

          {showPreview && (
            <DataPreview
              parentRef={parentRef}
              rowVirtualizer={rowVirtualizer}
              registrations={registrations}
              selectedColumns={selectedColumns}
              filters={memoizedFilters}
              handleSort={handleSort}
              isLoading={isLoading}
              lastRowRef={lastRowRef}
            />
          )}

          {isError && (
            <div className="p-6 bg-red-500/10 border-t border-red-500">
              <p className="text-red-500">{error.message}</p>
            </div>
          )}
        </div>

        {showAnalysis && <AnalysisSection />}
      </div>
    </div>
  );
};

export default ExportRegistrations;