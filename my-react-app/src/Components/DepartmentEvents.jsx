import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Atom, Award, Rocket, ArrowRight,
  Info, Loader
} from 'lucide-react';
import * as Icons from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import API_CONFIG from '../config/api';

// Separated API fetch function
const fetchDepartments = async () => {
  const url = API_CONFIG.getUrl('departments');
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch departments');
  }
  
  const data = await response.json();
  return data.departments || [];
};

const DepartmentHeader = () => (
  <div className="relative px-4 py-8 mb-8">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Title */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <Atom className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 animate-pulse" />
            <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
              Department Events & Workshops
            </h1>
            <Rocket className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 animate-pulse" />
          </div>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl">
            Browse and register for events in your department
          </p>
        </div>

        {/* Registration Steps */}
        <div className="w-full max-w-4xl bg-slate-900/50 border border-slate-800 rounded-xl p-4 sm:p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg sm:text-xl text-gray-200 font-semibold">How to Register</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-cyan-400 font-medium">Step 1: Browse Events</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2" />
                  <span>Find your department below</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2" />
                  <span>Click to view all events & workshops</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-cyan-400 font-medium">Step 2: Add to Cart</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2" />
                  <span>Add your preferred events to cart</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2" />
                  <span>Select package & complete payment in cart</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Important Notes */}
          <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
            <p className="text-sm text-gray-300">
              <span className="text-cyan-400 font-medium">Note:</span>{' '}
              Event prices shown are for reference. Final fees will be based on your selected package during checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const DepartmentCards = () => {
  const navigate = useNavigate();

  // Using TanStack Query for fetching and caching
  const { data: departments = [], isLoading, isError } = useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - data considered fresh for a day
    cacheTime: 1000 * 60 * 60 * 24 * 7, // 7 days - keep unused data in cache for a week
    retry: 2,
    onError: (error) => {
      toast.error('Failed to fetch departments');
      console.error(error);
    }
  });

  // Dynamically render icons
  const renderIcon = (iconName) => {
    const Icon = Icons[iconName];
    return Icon ? <Icon className="w-6 h-6 text-white" /> : null;
  };

  return (
    <div className="min-h-screen mt-12 bg-slate-950">
      {/* Instructions Panel */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <DepartmentHeader />
      </div>

      {/* Department Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center gap-3">
              <Loader className="w-6 h-6 text-cyan-400 animate-spin" />
              <span className="text-gray-400">Loading departments...</span>
            </div>
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-red-400 text-center">
              <p className="text-lg font-medium mb-2">Failed to load departments</p>
              <p className="text-sm">Please try refreshing the page</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div 
                key={dept._id}
                onClick={() => navigate(`/departments/${dept._id}/events`)}
                className="group cursor-pointer bg-slate-900/50 border border-slate-800 rounded-2xl 
                           overflow-hidden backdrop-blur-sm transition-all duration-300 
                           hover:border-slate-700 hover:shadow-lg hover:shadow-slate-900/50"
              >
                <div className="p-6">
                  {/* Department Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${dept.color} ${dept.hoverColor} 
                                   transition-all duration-300 group-hover:scale-110`}>
                      {renderIcon(dept.icon)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-200">{dept.name}</h2>
                      <p className="text-gray-400 text-sm">({dept.shortName})</p>
                    </div>
                  </div>

                  {/* Department Info */}
                  <p className="text-gray-400 text-sm mb-6">
                    {dept.description}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {dept.totalEvents} Events Available
                    </span>
                    <div className="flex items-center gap-2 text-cyan-400 group-hover:translate-x-1 transition-transform">
                      <span>View Events</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentCards;