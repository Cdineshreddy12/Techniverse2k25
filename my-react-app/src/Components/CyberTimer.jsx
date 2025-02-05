import React, { useState, useEffect, memo, useCallback } from 'react';
import { Terminal, Binary, Clock, Calendar } from 'lucide-react';

const CyberTimer = memo(({ eventDate = '2025-03-07T00:00:00'}) => {
  const calculateTimeLeft = useCallback(() => {
    const targetDate = new Date(eventDate);
    const now = new Date();
    const difference = targetDate - now;
    
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  }, [eventDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);
  const [binaryEffects, setBinaryEffects] = useState({
    days: '00000000',
    hours: '00000000',
    minutes: '00000000',
    seconds: '00000000'
  });

  const generateBinary = useCallback(() => {
    return Math.random().toString(2).substr(2, 8).padStart(8, '0');
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  useEffect(() => {
    const binaryInterval = setInterval(() => {
      setBinaryEffects({
        days: generateBinary(),
        hours: generateBinary(),
        minutes: generateBinary(),
        seconds: generateBinary()
      });
    }, 500);
    return () => clearInterval(binaryInterval);
  }, [generateBinary]);

  const unitIcons = {
    days: Calendar,
    hours: Clock,
    minutes: Terminal,
    seconds: Binary
  };

  const renderTimeUnit = useCallback(([unit, value]) => {
    const Icon = unitIcons[unit];
    
    return (
      <div key={unit} className="group relative">
        <div className="relative bg-slate-900 rounded-lg sm:rounded-xl overflow-hidden
                      border border-cyan-500/30 group-hover:border-purple-500/50 
                      transition-all duration-300">
          {/* Binary Background - Hidden on mobile */}
          <div className="absolute inset-0 opacity-20 hidden sm:block">
            <div className="absolute inset-0 text-[6px] sm:text-[8px] font-mono text-cyan-500/30 
                          leading-none p-0.5 sm:p-1 whitespace-pre-wrap">
              {binaryEffects[unit].repeat(20)}
            </div>
          </div>

          {/* Content */}
          <div className="relative p-2 sm:p-3 md:p-4">
            {/* Icon */}
            <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
              <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400 group-hover:text-purple-400 
                             transition-colors" />
            </div>

            {/* Number */}
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold font-mono mb-1 sm:mb-2
                          bg-gradient-to-r from-cyan-400 to-purple-400 
                          bg-clip-text text-transparent
                          group-hover:from-purple-400 group-hover:to-cyan-400
                          transition-all duration-300">
              {value.toString().padStart(2, '0')}
            </div>

            {/* Label */}
            <div className="text-[10px] sm:text-xs text-cyan-400 group-hover:text-purple-400 
                          font-medium uppercase tracking-wide sm:tracking-wider transition-colors">
              {unit}
            </div>

            {/* Side Glow */}
            <div className="absolute top-0 bottom-0 left-0 w-0.5 sm:w-1 
                          bg-gradient-to-b from-cyan-500/50 to-purple-500/50 
                          group-hover:opacity-100 opacity-50 transition-opacity" />
          </div>
        </div>

        {/* Hover Glow - Hidden on mobile */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 
                      rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity
                      hidden sm:block" />
      </div>
    );
  }, [binaryEffects]);

  return (
    <div className="relative w-full max-w-4xl mx-auto px-2 sm:px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 blur-xl" />
      
      {/* Timer Grid */}
      <div className="relative grid grid-cols-4 gap-1.5 sm:gap-3 md:gap-4 p-2 sm:p-4 md:p-6">
        {Object.entries(timeLeft).map(renderTimeUnit)}
      </div>

      {/* Event Date Display */}
      <div className="text-center mt-2 sm:mt-4 text-[10px] sm:text-sm text-cyan-400/80">
        <span className="font-mono">TECHNIVERSE 2025</span>
        <span className="mx-1 sm:mx-2">•</span>
        <span className="font-mono hidden sm:inline">MARCH 7-9</span>
        <span className="font-mono inline sm:hidden">MAR 7-9</span>
      </div>
    </div>
  );
});

export default CyberTimer;

