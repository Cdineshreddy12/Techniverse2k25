import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-black flex items-center justify-center">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-16 h-16 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin"></div>
        {/* Inner ring */}
        <div className="absolute top-1 left-1 w-14 h-14 border-4 border-purple-400/20 border-t-purple-400 rounded-full animate-spin-slow"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;