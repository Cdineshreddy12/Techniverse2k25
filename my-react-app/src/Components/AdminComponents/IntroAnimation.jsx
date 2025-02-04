import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PowerCircle } from 'lucide-react';

const IntroAnimation = () => {
  const navigate = useNavigate();
  const [isInitiated, setIsInitiated] = useState(false);
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [text, setText] = useState('');
  
  const finalText = "WELCOME TO TECHNIVERSE 2K25";

  const startSequence = () => {
    setIsInitiated(true);
    
    // Start door opening animation after button click
    setTimeout(() => {
      setDoorsOpen(true);
    }, 1000);

    // Start text animation after doors open
    setTimeout(() => {
      setShowContent(true);
      let index = 0;
      const textInterval = setInterval(() => {
        setText(finalText.substring(0, index));
        index++;
        if (index > finalText.length) {
          clearInterval(textInterval);
          // Redirect after text completion
          setTimeout(() => navigate('/'), 2000);
        }
      }, 100);
    }, 2500);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(56,189,248,0.1)_1px,transparent_1px),linear-gradient(0deg,rgba(56,189,248,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Left Door */}
      <div 
        className={`absolute top-0 left-0 w-1/2 h-full bg-slate-900 border-r border-cyan-500/30
                    transition-transform duration-1000 ease-in-out transform 
                    ${doorsOpen ? '-translate-x-full' : 'translate-x-0'}`}
      >
        <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-cyan-500/50 to-transparent" />
        {/* Door Pattern */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full p-8">
            <div className="w-full h-full border border-cyan-500/20 rounded-lg" />
            <div className="absolute inset-0 m-16 border border-cyan-500/20 rounded-lg" />
            <div className="absolute inset-0 m-24 border border-cyan-500/20 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Right Door */}
      <div 
        className={`absolute top-0 right-0 w-1/2 h-full bg-slate-900 border-l border-cyan-500/30
                    transition-transform duration-1000 ease-in-out transform
                    ${doorsOpen ? 'translate-x-full' : 'translate-x-0'}`}
      >
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-cyan-500/50 to-transparent" />
        {/* Door Pattern */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full p-8">
            <div className="w-full h-full border border-cyan-500/20 rounded-lg" />
            <div className="absolute inset-0 m-16 border border-cyan-500/20 rounded-lg" />
            <div className="absolute inset-0 m-24 border border-cyan-500/20 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Central Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        {!isInitiated ? (
          // Initial Button
          <button
            onClick={startSequence}
            className="group relative focus:outline-none"
          >
            {/* Button Glow */}
            <div className="absolute -inset-4 bg-cyan-500 opacity-10 group-hover:opacity-20 blur-xl rounded-full transition-opacity duration-500" />
            
            {/* Button Rings */}
            <div className="absolute -inset-8 border border-cyan-500/30 rounded-full group-hover:border-cyan-500/50 transition-colors duration-500" />
            <div className="absolute -inset-4 border border-cyan-500/30 rounded-full group-hover:border-cyan-500/50 transition-colors duration-500" />
            
            {/* Main Button */}
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-b from-slate-800 to-slate-900
                         border border-cyan-500/50 group-hover:border-cyan-400
                         flex items-center justify-center
                         shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40
                         transition-all duration-500">
              <PowerCircle className="w-10 h-10 text-cyan-500 group-hover:text-cyan-400 transition-colors duration-500" />
            </div>

            {/* Label */}
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-40 text-center">
              <p className="text-cyan-500/80 text-sm font-mono">INITIALIZE SYSTEM</p>
            </div>
          </button>
        ) : (
          // Text Content after doors open
          <div className={`transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-center">
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                {text}
              </span>
            </h1>
          </div>
        )}
      </div>

      {/* Vertical Scanning Lines (visible after doors open) */}
      {doorsOpen && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute h-full w-px bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent"
              style={{
                left: `${20 + i * 20}%`,
                animation: `scanVertical 2s ${i * 0.2}s ease-in-out infinite`,
                opacity: 0.3
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Add to your CSS
const styles = `
  @keyframes scanVertical {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
  }
`;

export default IntroAnimation;