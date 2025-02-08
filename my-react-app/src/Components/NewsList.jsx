import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, ArrowRight, AlertCircle, Tag, Eye } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import API_CONFIG from '../config/api';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'announcement', label: 'Announcements' },
  { value: 'update', label: 'Updates' },
  { value: 'result', label: 'Results' },
  { value: 'general', label: 'General' }
];

const MIN_SEARCH_LENGTH = 3;
const DEBOUNCE_DELAY = 3000;

// Separate API call
const fetchNews = async ({ page = 1, search = '', category = '', important = false }) => {
  const params = new URLSearchParams({
    page,
    limit: 9,
  });

  if (search && search.length >= MIN_SEARCH_LENGTH) params.append('search', search);
  if (category) params.append('category', category);
  if (important) params.append('important', 'true');

  const url = API_CONFIG.getUrl(`news?${params.toString()}`);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

const NewsCard = ({ news }) => {
  const formattedDate = new Date(news.publishDate).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <Link 
      to={`/news/${news._id}`}
      className="block group bg-slate-800/50 border border-slate-700/50 rounded-lg 
                 overflow-hidden hover:border-slate-600/50 hover:bg-slate-800/70 
                 transition-all duration-300 relative"
    >
      {news.important && (
        <div className="absolute top-3 right-3 z-10">
          <span className="flex items-center gap-1.5 px-2 py-1 bg-red-500/20 
                        text-red-400 rounded-full text-xs font-medium border border-red-500/20">
            <AlertCircle className="w-3 h-3" />
            Important
          </span>
        </div>
      )}

      <div className="relative h-48">
        <img
          src={news.thumbnail || "/api/placeholder/800/400"}
          alt={news.title}
          className="w-full h-full object-cover transition-transform duration-500
                   group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"/>
        
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border
            ${news.category === 'announcement' ? 'bg-purple-500/20 text-purple-400 border-purple-500/20' :
              news.category === 'update' ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' :
              news.category === 'result' ? 'bg-green-500/20 text-green-400 border-green-500/20' :
              'bg-slate-500/20 text-slate-400 border-slate-500/20'}`}>
            {news.category.charAt(0).toUpperCase() + news.category.slice(1)}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold text-white group-hover:text-sky-400 
                     transition-colors line-clamp-2">
          {news.title}
        </h3>

        <p className="text-slate-400 text-sm line-clamp-2">
          {news.summary || news.content}
        </p>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-sky-400" />
              {formattedDate}
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-sky-400" />
              {news.viewCount} views
            </div>
          </div>
          
          <span className="flex items-center gap-1 text-sky-400 group-hover:gap-2 transition-all">
            Read More <ArrowRight className="w-4 h-4" />
          </span>
        </div>

        {news.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-700/50">
            {news.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="flex items-center gap-1 px-2 py-0.5 bg-slate-700/50 
                         text-slate-400 rounded text-xs"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
            {news.tags.length > 3 && (
              <span className="text-xs text-slate-500">
                +{news.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

const NewsFilters = ({ filters, onFilterChange }) => {
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    onFilterChange(name, type === 'checkbox' ? checked : value);
  };

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={handleInputChange}
          placeholder="Search news (min 3 characters)..."
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 
                   rounded-lg text-white placeholder-slate-400 pr-10"
        />
        <Search className="absolute right-3 top-2.5 w-5 h-5 text-slate-400" />
      </div>

      <select
        name="category"
        value={filters.category}
        onChange={handleInputChange}
        className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg 
                 text-white appearance-none cursor-pointer"
      >
        {CATEGORIES.map(cat => (
          <option key={cat.value} value={cat.value}>{cat.label}</option>
        ))}
      </select>

      <label className="flex items-center gap-2 text-white cursor-pointer">
        <input
          type="checkbox"
          name="important"
          checked={filters.important}
          onChange={handleInputChange}
          className="w-4 h-4 rounded border-slate-700 bg-slate-800"
        />
        Important Only
      </label>
    </div>
  );
};

const NewsList = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    important: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Create memoized debounced search handler
  const debouncedSetSearch = useMemo(
    () => debounce((value) => {
      setDebouncedSearch(value);
      setCurrentPage(1);
    }, DEBOUNCE_DELAY),
    []
  );

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
    
    if (name === 'search') {
      debouncedSetSearch(value);
    }
  };

  // Enhanced query with prefetching
  const { 
    data, 
    isLoading, 
    isError, 
    error,
    isFetching,
    isPreviousData
  } = useQuery({
    queryKey: ['news', { 
      page: currentPage, 
      search: debouncedSearch, 
      category: filters.category,
      important: filters.important 
    }],
    queryFn: () => fetchNews({ 
      page: currentPage, 
      search: debouncedSearch, 
      category: filters.category,
      important: filters.important
    }),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
    retry: 2,
    onSuccess: (data) => {
      // Prefetch next page
      if (!isPreviousData && data.pagination.hasNextPage) {
        queryClient.prefetchQuery({
          queryKey: ['news', { 
            page: currentPage + 1, 
            search: debouncedSearch, 
            category: filters.category,
            important: filters.important 
          }],
          queryFn: () => fetchNews({ 
            page: currentPage + 1, 
            search: debouncedSearch, 
            category: filters.category,
            important: filters.important
          })
        });
      }
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500" />
          <span className="text-slate-400">Loading news...</span>
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

  const { news, pagination } = data;
  const { totalPages } = pagination;

  return (
    <div className="container mt-16 mx-auto px-4 py-8">
      <div className="mb-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Latest News</h1>
          {isFetching && !isLoading && (
            <div className="flex items-center gap-2 text-slate-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-500" />
              <span className="text-sm">Updating...</span>
            </div>
          )}
        </div>
        
        <NewsFilters 
          filters={filters} 
          onFilterChange={handleFilterChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item) => (
          <NewsCard key={item._id} news={item} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || isFetching}
            className="px-4 py-2 rounded-lg text-sm font-medium 
                     bg-slate-800 text-slate-400 hover:bg-slate-700
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${currentPage === i + 1
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={isFetching}
            >
              {i + 1}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || isFetching}
            className="px-4 py-2 rounded-lg text-sm font-medium 
                     bg-slate-800 text-slate-400 hover:bg-slate-700
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {news.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">
            {debouncedSearch && debouncedSearch.length < MIN_SEARCH_LENGTH 
              ? 'Please enter at least 2 characters to search'
              : 'No news found'}
          </p>
        </div>
      )}
    </div>
  );
};

export default NewsList;