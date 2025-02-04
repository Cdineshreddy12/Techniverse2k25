import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft, AlertTriangle } from 'lucide-react';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen mt-12 bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,0,255,0.1)_1px,_transparent_1px)] bg-[size:30px_30px] opacity-20"></div>
      
      {/* Glowing Orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse"></div>

      <div className="relative z-10 max-w-2xl w-full">
        {/* Main Content Container */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg border border-purple-500/20 p-8 relative overflow-hidden">
          {/* Glitch Effect Lines */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-2 h-full bg-cyan-400/30 animate-glitch-1"></div>
            <div className="absolute top-0 right-0 w-2 h-full bg-purple-400/30 animate-glitch-2"></div>
          </div>

          {/* Warning Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <ShieldX className="w-24 h-24 text-red-500 animate-pulse" />
              <div className="absolute inset-0 text-red-500 animate-glitch-text">
                <ShieldX className="w-24 h-24" />
              </div>
            </div>
          </div>

          {/* Error Code */}
          <div className="text-center mb-6">
            <h2 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 animate-text-gradient">
              401
            </h2>
          </div>

          {/* Error Message */}
          <div className="text-center mb-8 relative">
            <h1 className="text-2xl font-bold text-white mb-2">
              ACCESS DENIED
            </h1>
            <p className="text-gray-400">
              Your security clearance level is insufficient to access this area.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
              <span className="text-sm">Security breach detected</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 text-white font-medium transition-all flex items-center justify-center gap-2 group border border-purple-500/20 hover:border-purple-500/40"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-medium transition-all flex items-center justify-center gap-2 border border-purple-500/20 hover:border-purple-500/40"
            >
              Return to Home
            </button>
          </div>
        </div>

        {/* Bottom Warning Text */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>System log: Unauthorized access attempt recorded | {new Date().toISOString()}</p>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;