import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Tag, Eye, ChevronLeft, AlertCircle } from 'lucide-react';

const NewsDetail = () => {
  const { newsId } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);

  useEffect(() => {
    fetchNewsDetail();
  }, [newsId]);

  const fetchNewsDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/news/${newsId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch news');
      }

      setNews(data.news);

      // Fetch related news based on department or tags
      if (data.news.departments?.length || data.news.tags?.length) {
        const params = new URLSearchParams();
        if (data.news.departments?.[0]) {
          params.append('department', data.news.departments[0]);
        }
        if (data.news.tags?.length) {
          params.append('tags', data.news.tags.join(','));
        }
        
        const relatedResponse = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/news?${params}&limit=3`);
        const relatedData = await relatedResponse.json();
        setRelatedNews(relatedData.news.filter(item => item._id !== newsId));
      }
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

  if (error || !news) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400">Error: {error || 'News not found'}</div>
      </div>
    );
  }

  const formattedDate = new Date(news.publishDate).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        to="/news"
        className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 
                   transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to News
      </Link>

      <article className="max-w-4xl mx-auto">
        {/* Header Section */}
        <header className="space-y-4 mb-8">
          {news.important && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 
                          bg-red-500/20 text-red-400 rounded-full text-sm 
                          font-medium border border-red-500/20">
              <AlertCircle className="w-4 h-4" />
              Important News
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl font-bold text-white">{news.title}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-sky-400" />
              {formattedDate}
            </div>
            {news.author?.name && (
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-sky-400" />
                {news.author.name}
                {news.author.role && (
                  <span className="text-slate-500">({news.author.role})</span>
                )}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-sky-400" />
              {news.viewCount} views
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden mb-8">
          {/* Thumbnail */}
          {news.thumbnail && (
            <div className="relative h-[400px]">
              <img
                src={news.thumbnail}
                alt={news.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6 sm:p-8 prose prose-invert prose-sky max-w-none">
            {news.content.split('\n').map((paragraph, index) => (
              <p key={index} className="text-slate-300">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags and Metadata */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-4 border-t border-slate-700/50">
            <div className="flex flex-wrap gap-4">
              {/* Tags */}
              {news.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {news.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="flex items-center gap-1 px-2 py-1 bg-slate-700/50 
                               text-slate-400 rounded-full text-xs"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Related Departments */}
              {news.departments?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {news.departments.map((dept) => (
                    <Link
                      key={dept._id}
                      to={`/departments/${dept._id}`}
                      className="px-2 py-1 bg-sky-500/20 text-sky-400 
                               rounded-full text-xs hover:bg-sky-500/30 transition-colors"
                    >
                      {dept.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Events Section */}
        {news.relatedEvents?.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Related Events</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {news.relatedEvents.map((event) => (
                <Link
                  key={event._id}
                  to={`/events/${event._id}`}
                  className="flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700/50 
                           rounded-lg hover:border-slate-600/50 hover:bg-slate-800/70 
                           transition-all group"
                >
                  <div className="flex-1">
                    <h3 className="text-white font-medium group-hover:text-sky-400 
                                 transition-colors">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                      <Calendar className="w-4 h-4 text-sky-400" />
                      {new Date(event.startTime).toLocaleDateString()}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-sky-400 
                                     transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related News Section */}
        {relatedNews.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-white mb-4">Related News</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedNews.map((item) => (
                <Link
                  key={item._id}
                  to={`/news/${item._id}`}
                  className="block group bg-slate-800/50 border border-slate-700/50 rounded-lg 
                           overflow-hidden hover:border-slate-600/50 hover:bg-slate-800/70 
                           transition-all"
                >
                  {item.thumbnail && (
                    <div className="relative h-40">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 
                                 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 
                                    via-slate-900/50 to-transparent" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-white font-medium group-hover:text-sky-400 
                                 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-400 mt-2">
                      <Calendar className="w-4 h-4 text-sky-400" />
                      {new Date(item.publishDate).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

export default NewsDetail;