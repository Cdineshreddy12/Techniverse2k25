import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Rocket, Gift, ChevronRight, Trophy, Star, Crown, Users, Calendar,
  Code, Lock, Brain, Terminal, Database, Cloud, Cpu, Wifi, ServerIcon,
  Globe, MonitorIcon, Command, Network, Radio, Laptop, Scan, Hexagon,
  CircuitBoard, ShieldCheck, Zap, Binary,Monitor,Layers
} from 'lucide-react';
import CyberTimer from './CyberTimer';
import { ComboPackage } from './ComboPackage.jsx';

import Timeline from './Timeline.jsx';

import QRTesting from './QrTesting.jsx';
import DepartmentEvents from './DepartmentEvents.jsx';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import toast from 'react-hot-toast';
import API_CONFIG from '../config/api.js';
const TechIcon = ({ icon: Icon, style, delay = 0 }) => (
  <div 
    className={`absolute transform opacity-20 text-cyan-400
                hover:opacity-100 hover:scale-110 transition-all duration-300`}
    style={{ 
      ...style,
      animation: `float 10s ease-in-out ${delay}s infinite`
    }}
  >
    <Icon size={24} />
  </div>
);

const CircuitLine = ({ className }) => (
  <div className={`absolute bg-gradient-to-r from-cyan-500/20 to-purple-500/20 
                   h-px animate-pulse-slow ${className}`} />
);

const QuickStat = ({ value, label, icon: Icon }) => (
  <div className="relative group bg-slate-900/50 p-3 sm:p-4 md:p-6 rounded-xl border border-cyan-500/30
                  hover:bg-slate-800/70 transition-all duration-500 transform hover:scale-105">
    <div className="relative z-10">
      <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 mb-2 sm:mb-3 group-hover:scale-110 transition-transform animate-pulse-slow" />
      <div className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-1">
        {value}
      </div>
      <div className="text-xs sm:text-sm text-gray-400">{label}</div>
    </div>
    
    {/* Animated corner accents */}
    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50 rounded-tl" />
    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500/50 rounded-tr" />
    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500/50 rounded-bl" />
    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500/50 rounded-br" />
  </div>
);

const CorePrinciple = ({ icon: Icon, title, description }) => (
  <div className="relative group">
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl opacity-0 
                    group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
    <div className="relative flex flex-col items-center p-6 rounded-xl bg-slate-900/80 border border-cyan-500/20
                    hover:bg-slate-800/90 transition-all duration-300 transform hover:scale-105">
      <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4
                      group-hover:bg-cyan-500/20 transition-all">
        <Icon className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-400 text-center leading-relaxed">{description}</p>
    </div>
  </div>
);

const TechniVerseTitle = () => {
  return (
    <div className="relative mt-8 inline-block mb-6 group">
      <div className="relative">     
        {/* Signature-style decorative line */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-32 h-2">
          <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
          <div className="absolute w-2 h-2 left-0 top-0 border-t-2 border-l-2 border-cyan-400 transform -rotate-45"></div>
          <div className="absolute w-2 h-2 right-0 top-0 border-t-2 border-r-2 border-purple-400 transform rotate-45"></div>
        </div>

        {/* Main title with enhanced styling */}
        <h1 className="relative text-4xl italic sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-2 z-10">
          {/* Tech prefix with enhanced animation */}
          <span className="inline-block mr-1 relative group">
            <span className="inline-block">
              <span className="inline-block text-[4rem] italic md:text-[7rem] text-cyan-400 font-bold transform hover:scale-110 transition-transform duration-300 relative">
                T
                <Zap className="absolute -top-4 -right-1 w-4 h-4 text-cyan-400 animate-pulse" />
                <Sparkles className="absolute -bottom-2 -left-1 w-4 h-4 text-cyan-400 animate-pulse" />
              </span>
              <span className="text-gray-100 relative">
                echni
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </span>
            </span>
          </span>
          
          {/* Verse suffix with enhanced animation */}
          <span className="inline-block relative group">
            <span className="inline-block">
              <span className="inline-block italic text-[4rem] md:text-[7rem] text-purple-400 transform hover:scale-110 transition-transform duration-300 relative">
                V
                <Hexagon className="absolute -top-4 -right-1 w-4 h-4 text-purple-400 animate-pulse" />
                <CircuitBoard className="absolute -bottom-2 -left-1 w-4 h-4 text-purple-400 animate-pulse" />
              </span>
              <span className="text-gray-100 relative">
                erse
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </span>
            </span>
          </span>
          
          {/* Enhanced year styling */}
          <span className="text-xl sm:text-2xl md:text-3xl font-bold ml-2">
            <span className="text-cyan-300">2</span>
            <span className="text-pink-200 animate-pulse">K</span>
            <span className="text-cyan-300">25</span>
          </span>
        </h1>

        {/* Enhanced animated border elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
          <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500 transform origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
          <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-cyan-500 via-purple-500 to-cyan-500 transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-700"></div>
          <div className="absolute right-0 top-0 w-1 h-full bg-gradient-to-b from-purple-500 via-cyan-500 to-purple-500 transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-700"></div>
        </div>

        {/* Always visible floating tech icons with trails */}
        <div className="absolute -top-8 -left-8">
          <Monitor className="w-6 h-6 text-cyan-400 animate-float" />
          <div className="absolute w-8 h-8 bg-cyan-400 opacity-10 rounded-full animate-ping"></div>
        </div>
        <div className="absolute -top-8 -right-8">
          <Cpu className="w-6 h-6 text-purple-400 animate-float" />
          <div className="absolute w-8 h-8 bg-purple-400 opacity-10 rounded-full animate-ping"></div>
        </div>
        <div className="absolute -bottom-8 -left-8">
          <Code className="w-6 h-6 text-cyan-400 animate-float" />
          <div className="absolute w-8 h-8 bg-cyan-400 opacity-10 rounded-full animate-ping"></div>
        </div>
        <div className="absolute -bottom-8 -right-8">
          <Database className="w-6 h-6 text-purple-400 animate-float" />
          <div className="absolute w-8 h-8 bg-purple-400 opacity-10 rounded-full animate-ping"></div>
        </div>

        {/* Signature-style flourish */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-32 h-2">
          <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse"></div>
          <div className="absolute w-2 h-2 left-0 bottom-0 border-b-2 border-l-2 border-purple-400 transform rotate-45"></div>
          <div className="absolute w-2 h-2 right-0 bottom-0 border-b-2 border-r-2 border-cyan-400 transform -rotate-45"></div>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const {user}=useKindeAuth();
  const handlePackageSelect = async (pkg, optionId) => {
    try {
      const url=API_CONFIG('combo/select');
      const response = await fetch(url,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kindeId: user.id,
          combo: {
            id: pkg.id,
            optionId,
            name: pkg.name,
            ...pkg.options[optionId]
          }
        })
      });
  
      if (!response.ok) throw new Error();
      
      setSelectedPackage({
        id: pkg.id,
        optionId,
        name: pkg.name,
        ...pkg.options[optionId]
      });
      
      toast.success('Package selected!');
      const departmentsSection = document.getElementById('departments-section');
      if (departmentsSection) {
        departmentsSection.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      toast.error('Failed to select package');
    }
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { value: '40+', label: 'Tech Events', icon: Terminal },
    { value: '7 +', label: 'Innovation Workshops', icon: Brain },
    { value: '₹10k+', label: 'Prize Pool', icon: Trophy },
    { value: '3000+', label: 'Tech Enthusiasts', icon: Users }
  ];

  const principles = [
    { icon: Code, title: 'Code Innovate', description: 'Push boundaries with cutting-edge coding challenges and hackathons' },
    { icon: Brain, title: 'Tech Mastery', description: 'Learn from industry experts in specialized tech workshops' },
    { icon: Rocket, title: 'Launch Ideas', description: 'Transform your innovative ideas into reality' },
    { icon: Cloud, title: 'Connect & Grow', description: 'Network with tech leaders and like-minded innovators' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20 overflow-hidden">
      {/* Hero Section */}
      <header className="relative pt-20 pb-12">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-slate-950 to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.4),transparent_70%)]" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(to right, rgba(0, 179, 255, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(56,189,248,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 mt-12 text-center">
          <div className={`flex flex-col items-center transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <TechniVerseTitle />
            
            {/* Highlight text */}
            <div className="relative mb-6 sm:mb-8">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              <div className="relative px-3 sm:px-6 py-2 bg-slate-900 rounded-lg border border-cyan-500/30">
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-cyan-200 font-medium">
                  ONE OF THE LARGEST TECH FEST CONDUCTED BY RGUKT-SRIKAKULAM
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm md:text-base text-gray-400 max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
              Uniting <span className="text-cyan-400 font-semibold">3000+</span> brilliant minds in a 
              <span className="hidden sm:inline"> celebration of innovation and technology.</span>
              <span className="inline sm:hidden"> tech celebration.</span>
              <br className="hidden sm:block" />
              Experience <span className="text-cyan-400 font-semibold">3 days</span> of
              <span className="hidden sm:inline"> cutting-edge tech, competitions, and workshops.</span>
              <span className="inline sm:hidden"> tech innovation.</span>
            </p>

            {/* Timer */}
            <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl px-4 sm:px-8 py-3 sm:py-4 mb-8 sm:mb-12
                          border border-cyan-500/30 inline-flex items-center gap-2 sm:gap-4 group hover:bg-slate-800/90 transition-all duration-300">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
              <CyberTimer eventDate="2025-03-07T00:00:00" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-6xl mx-auto mb-8 sm:mb-16">
              {stats.map((stat, index) => (
                <QuickStat key={index} {...stat} />
              ))}
            </div>

            {/* Principles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
              {principles.map((principle, index) => (
                <CorePrinciple key={index} {...principle} />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative">
        <section className="py-12 sm:py-16 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent" />
          <div className="relative max-w-7xl mx-auto px-4">

             <section className="py-8 md:py-16">
                <ComboPackage 
                  isSelected={selectedPackage} 
                  onSelect={handlePackageSelect} 
                />
              </section>


                  <section id='departments-section' className="mt-8 md:mt-16">
                      <DepartmentEvents/>
                   </section>

             

              {/* <section className="py-8 md:py-16 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent" />
                <div className="relative">
                  <Timeline />
                </div>
              </section> */}


          </div>
        </section>
      </main>

      {/* Floating Tech Icons in Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Left Side Icons */}
        <TechIcon icon={Cpu} style={{ top: '15%', left: '8%', filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.4))' }} delay={0} />
        <TechIcon icon={Database} style={{ top: '45%', left: '12%' }} delay={2} />
        <TechIcon icon={Terminal} style={{ top: '75%', left: '8%' }} delay={4} />
        <TechIcon icon={Code} style={{ top: '30%', left: '15%' }} delay={6} />
        
        {/* Right Side Icons */}
        <TechIcon icon={Globe} style={{ top: '20%', right: '8%' }} delay={1} />
        <TechIcon icon={Cloud} style={{ top: '60%', right: '12%' }} delay={3} />
        <TechIcon icon={ServerIcon} style={{ top: '85%', right: '15%' }} delay={5} />
        <TechIcon icon={Command} style={{ top: '35%', right: '18%' }} delay={7} />
        
        {/* Center Area Icons */}
        <TechIcon icon={Layers} style={{ top: '50%', left: '30%' }} delay={2.5} />
        <TechIcon icon={Binary} style={{ top: '40%', right: '30%' }} delay={3.5} />
        <TechIcon icon={Monitor} style={{ top: '70%', left: '40%' }} delay={4.5} />
        <TechIcon icon={Hexagon} style={{ top: '25%', right: '35%' }} delay={5.5} />
      </div>

    </div>
  );
};

export default HomePage;