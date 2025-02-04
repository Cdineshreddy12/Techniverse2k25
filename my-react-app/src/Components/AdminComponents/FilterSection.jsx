import React from 'react';
import { X, FileSpreadsheet, Loader, SortAsc, SortDesc } from 'lucide-react';
import { DEFAULT_FILTERS } from '../constants';

export const FilterSection = ({ filters, setFilters, isLoading, handleDownload }) => {
  return (
    <div className="p-6 border-b border-gray-700 bg-gray-800/50">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm text-gray-300 mb-2">Date Range</label>
          <div className="flex gap-4">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Payment Status</label>
          <select
            value={filters.paymentStatus}
            onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Package</label>
          <select
            value={filters.package}
            onChange={(e) => setFilters(prev => ({ ...prev, package: e.target.value }))}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
          >
            <option value="">All Packages</option>
            <option value="Basic Pack">Basic Pack</option>
            <option value="Pro Pack">Pro Pack</option>
            <option value="Premium Pack">Premium Pack</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Branch</label>
          <input
            type="text"
            value={filters.branch}
            onChange={(e) => setFilters(prev => ({ ...prev, branch: e.target.value }))}
            placeholder="Enter branch"
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-2">Sort By</label>
          <div className="flex gap-4">
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
            >
              <option value="">No Sorting</option>
              <option value="date">Registration Date</option>
              <option value="amount">Amount</option>
              <option value="name">Student Name</option>
              <option value="status">Payment Status</option>
              <option value="package">Package</option>
            </select>
            <button
              onClick={() => setFilters(prev => ({
                ...prev,
                sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
              }))}
              className="px-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
            >
              {filters.sortOrder === 'asc' ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={() => handleDownload(true)}
          disabled={isLoading}
          className="px-6 py-2 bg-sky-500 text-white rounded-lg flex items-center space-x-2 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="w-4 h-4" />
          )}
          <span>Export Filtered Data</span>
        </button>

        <button
          onClick={() => setFilters(DEFAULT_FILTERS)}
          className="px-6 py-2 bg-gray-700 text-gray-300 rounded-lg flex items-center space-x-2 hover:bg-gray-600"
        >
          <X className="w-4 h-4" />
          <span>Clear Filters</span>
        </button>
      </div>
    </div>
  );
};