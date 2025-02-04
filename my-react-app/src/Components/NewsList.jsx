import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, ArrowRight, AlertCircle, Tag, Eye } from 'lucide-react';

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
        
        {/* Category Badge */}
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

const NewsList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNews();
  }, [searchTerm, category, currentPage]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 9
      });

      if (searchTerm) params.append('search', searchTerm);
      if (category) params.append('category', category);

      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/news?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch news');
      }

      setNews(data.news);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching news:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500" />
          <span className="text-slate-400">Loading news...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filters */}
      <div className="mb-8 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Latest News</h1>
        
        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search news..."
              className="w-full sm:w-64 px-4 py-2 bg-slate-800 border border-slate-700 
                       rounded-lg text-white placeholder-slate-400 pr-10"
            />
            <Search className="absolute right-3 top-2.5 w-5 h-5 text-slate-400" />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg 
                     text-white appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="announcement">Announcements</option>
            <option value="update">Updates</option>
            <option value="result">Results</option>
            <option value="general">General</option>
          </select>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item) => (
          <NewsCard key={item._id} news={item} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${currentPage === i + 1
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {news.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">No news found</p>
        </div>
      )}
    </div>
  );
};

export default NewsList;