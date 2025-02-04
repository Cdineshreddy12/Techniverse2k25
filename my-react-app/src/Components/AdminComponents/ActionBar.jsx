import React from 'react';
import { 
  Download, Filter, Loader, RefreshCw, Eye, EyeOff, 
  BarChart2, Search, FileSpreadsheet, PieChart
} from 'lucide-react';

export const ActionBar = ({
  showStats,
  setShowStats,
  showFilters,
  setShowFilters,
  showPreview,
  setShowPreview,
  showAnalysis,
  setShowAnalysis,
  handleSearch,
  searchTerm,
  isLoading,
  handleDownload,
  refetch
}) => {
  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Registration Management</h2>
          <p className="text-gray-400">Download, analyze, and manage registration data</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setShowStats(!showStats)}
            className="px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center space-x-2 hover:bg-indigo-500/20 transition-all"
          >
            <BarChart2 className="w-4 h-4" />
            <span>{showStats ? 'Hide Stats' : 'Show Stats'}</span>
          </button>

          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="px-4 py-2 bg-purple-500/10 text-purple-400 rounded-lg flex items-center space-x-2 hover:bg-purple-500/20 transition-all"
          >
            <PieChart className="w-4 h-4" />
            <span>{showAnalysis ? 'Hide Analysis' : 'Show Analysis'}</span>
          </button>

          <button
            onClick={refetch}
            className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center space-x-2 hover:bg-emerald-500/20 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="border-b border-gray-700 p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => handleDownload(false)}
              disabled={isLoading}
              className="px-4 py-2 bg-sky-500 text-white rounded-lg flex items-center space-x-2 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Export All</span>
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg flex items-center space-x-2 hover:bg-purple-600 transition-all"
            >
              <Filter className="w-4 h-4" />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>

            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg flex items-center space-x-2 hover:bg-gray-600 transition-all"
            >
              {showPreview ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[250px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search registrations..."
              className="w-full bg-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>
    </>
  );
};