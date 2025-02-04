import React from 'react';
import { Loader, SortAsc, SortDesc } from 'lucide-react';
import { COLUMN_WIDTHS, SORT_FIELD_MAP } from '../constants';
import { ColumnValue } from './ColumnValue';

export const DataPreview = ({
  parentRef,
  rowVirtualizer,
  registrations,
  selectedColumns,
  filters,
  handleSort,
  isLoading,
  lastRowRef
}) => {
  return (
    <div className="p-6">
      <div
        className="overflow-x-auto border border-gray-700 rounded-lg"
        style={{ height: '600px' }}
        ref={parentRef}
      >
        {/* Table Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 z-10">
          <div className="flex w-full">
            {selectedColumns.map(column => (
              <div
                key={column}
                className="flex-1 px-4 py-3 text-left text-sm font-semibold text-gray-300 min-w-[150px]"
                style={{ width: COLUMN_WIDTHS[column] }}
              >
                <div 
                  className="flex items-center space-x-2 cursor-pointer"
                  onClick={() => handleSort(SORT_FIELD_MAP[column])}
                >
                  <span>{column}</span>
                  {filters.sortBy === SORT_FIELD_MAP[column] && (
                    <span className="text-sky-400">
                      {filters.sortOrder === 'asc' ? (
                        <SortAsc className="w-4 h-4" />
                      ) : (
                        <SortDesc className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Virtual Rows */}
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
                ref={virtualRow.index === registrations.length - 1 ? lastRowRef : null}
                className={`absolute top-0 left-0 w-full border-b border-gray-700 ${
                  virtualRow.index % 2 ? 'bg-gray-800/50' : 'bg-gray-800/30'
                } hover:bg-gray-700/50 transition-colors`}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`
                }}
              >
                <div className="flex h-full items-center">
                  {selectedColumns.map(column => (
                    <div
                      key={column}
                      className="flex-1 px-4 text-sm text-gray-300 truncate min-w-[150px]"
                      style={{ width: COLUMN_WIDTHS[column] }}
                    >
                      <ColumnValue registration={registration} column={column} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg">
            <Loader className="w-5 h-5 animate-spin text-sky-500" />
            <span className="text-gray-300">Loading...</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {registrations.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-400">No registrations found</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
          >
            Clear Filters & Refresh
          </button>
        </div>
      )}
    </div>
  );
};