import React from 'react';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import API_CONFIG from '../../config/api';
import { useNavigate } from 'react-router-dom';

const fetchDepartment = async (departmentId) => {
  const url = API_CONFIG.getUrl(`departments/${departmentId}`);
  const response = await fetch(url);
  
  if (!response.ok) throw new Error('Failed to fetch department');
  
  const data = await response.json();
  
  if (data.success) {
    return data.department;
  } else {
    throw new Error(data.error || 'Failed to fetch department');
  }
};

const DepartmentLayout = () => {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Using TanStack Query for fetching and caching
  const { data: department, isLoading, isError } = useQuery({
    queryKey: ['department', departmentId],
    queryFn: () => fetchDepartment(departmentId),
    enabled: !!departmentId,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - data considered fresh for a day
    cacheTime: 1000 * 60 * 60 * 24 * 7, // 7 days - keep unused data in cache for a week
    retry: 2
  });

  const handleBackClick = (e) => {
    e.preventDefault();
    navigate('/departments');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 px-4 bg-gradient-to-br from-slate-950 via-indigo-950 to-black">
        <div className="flex items-center justify-center gap-3 text-cyan-400">
          <Loader className="w-5 h-5 animate-spin" />
          <span className="text-xl">Loading department...</span>
        </div>
      </div>
    );
  }

  if (isError || !department) {
    return (
      <div className="min-h-screen pt-24 px-4 bg-gradient-to-br from-slate-950 via-indigo-950 to-black">
        <div className="text-red-400 text-xl text-center">Department not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-br from-slate-950 via-indigo-950 to-black">
      <div className="max-w-7xl mx-auto relative">
        <div className="mb-4 md:mb-0 md:absolute md:left-0 md:top-0 z-50">
          <button
            onClick={handleBackClick}
            className="group inline-flex items-center z-50 gap-2 px-4 py-2 rounded-lg transition-all transform hover:scale-102"
          >
            <div className="absolute inset-0 rounded-lg z-50 bg-slate-800/50 group-hover:bg-slate-700/50 transition-all duration-300" />
            <svg
              className="w-5 h-5 text-slate-300 group-hover:text-white relative transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="relative text-slate-300 group-hover:text-white transition-colors">Back</span>
          </button>
        </div>

        <div className="mb-12 text-center relative">
          <div className="flex flex-col items-center gap-2">
            {/* Department Name */}
            <h1 className="relative text-4xl p-4 md:text-5xl font-bold text-transparent 
                        bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              {department.name}
            </h1>
            
            {/* Accent Line */}
            <div className="relative h-1 w-32 rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 
                           to-purple-500 animate-gradient" />
            </div>
          </div>
        </div>
        
        {/* Navigation Links */}
        <div className="flex justify-center space-x-6 mb-8">
          <Link 
            to={`/departments/${departmentId}/workshops`}
            className={`group relative px-8 py-3 rounded-lg transition-all transform ${
              location.pathname.includes('/workshops') 
                ? 'text-white scale-105' 
                : 'text-slate-300 hover:text-white hover:scale-102'
            }`}
          >
            <div className={`absolute inset-0 rounded-lg transition-all duration-300 ${
              location.pathname.includes('/workshops')
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 opacity-100'
                : 'bg-slate-800/50 group-hover:bg-slate-700/50'
            }`} />
            <div className={`absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400 to-indigo-400 
                         opacity-0 blur-md transition-opacity duration-300 ${
              location.pathname.includes('/workshops') ? 'opacity-40' : 'group-hover:opacity-20'
            }`} />
            <span className="relative">Workshops</span>
          </Link>

          <Link 
            to={`/departments/${departmentId}/events`}
            className={`group relative px-8 py-3 rounded-lg transition-all transform ${
              location.pathname.includes('/events') && !location.pathname.includes('/workshops')
                ? 'text-white scale-105'
                : 'text-slate-300 hover:text-white hover:scale-102'
            }`}
          >
            <div className={`absolute inset-0 rounded-lg transition-all duration-300 ${
              location.pathname.includes('/events') && !location.pathname.includes('/workshops')
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 opacity-100'
                : 'bg-slate-800/50 group-hover:bg-slate-700/50'
            }`} />
            <div className={`absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-400 to-purple-400 
                         opacity-0 blur-md transition-opacity duration-300 ${
              location.pathname.includes('/events') && !location.pathname.includes('/workshops') 
                ? 'opacity-40' 
                : 'group-hover:opacity-20'
            }`} />
            <span className="relative">Events</span>
          </Link>
        </div>

        {/* Content Area */}
        <div className="relative">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-xl" />
          <div className="relative bg-slate-900/95 rounded-xl border border-slate-800/50 overflow-hidden">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentLayout;