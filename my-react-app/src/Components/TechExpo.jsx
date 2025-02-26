import React, { useEffect } from 'react';
import { 
  Cpu, Lightbulb, Zap, Calendar, Clock, MapPin, 
  Users, Award, Sparkles, Rocket, Brain, Monitor, 
  Globe, Code, Database, ChevronRight, Info
} from 'lucide-react';

const TechExpo = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-slate-950 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15),transparent_70%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-12 md:mb-16 text-center">
          <div className="relative inline-block mb-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-25"></div>
            <div className="relative rounded-lg bg-slate-900 border border-cyan-500/30 p-2 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-cyan-500 mr-2" />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                Tech Expo
              </h1>
              <Cpu className="w-6 h-6 text-cyan-500 ml-2" />
            </div>
          </div>
          
          <p className="text-xl text-cyan-200 font-semibold max-w-3xl mx-auto">
            Where Ideas Meet Innovation!
          </p>
          
          <p className="mt-4 text-gray-400 max-w-3xl mx-auto">
            A premier event in our Techniverse that transforms student ideas into 
            groundbreaking innovations, providing a dynamic platform for young minds 
            to showcase their creativity and problem-solving skills.
          </p>
        </div>

        {/* Main Image */}
        <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/10 border border-cyan-500/20">
          <div className="aspect-video w-full relative bg-slate-900">
            {/* Placeholder image for tech showcase */}
            <img 
              src="https://res.cloudinary.com/dxsupdl3t/image/upload/v1740555677/WhatsApp_Image_2025-02-25_at_23.54.49_6233e5c3_hczprc.jpg" 
              alt="Tech Expo Display" 
              className="w-full h-full object-fit"
            />
          </div>
        </div>

        {/* Event Details Card */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="md:col-span-2 bg-slate-900/70 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center">
              <Info className="w-5 h-5 mr-2" />
              Event Details
            </h2>
            
            <div className="space-y-6">
              <p className="text-gray-300 leading-relaxed">
                Tech Expo brings together the brightest minds from RGUKT-Srikakulam to showcase cutting-edge 
                projects and visionary concepts. With cutting-edge projects and innovative solutions, 
                Tech Expo bridges the gap between imagination and reality. Join us to witness the future 
                of technology, crafted by the innovators of tomorrow!
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-500/10">
                  <h3 className="text-lg font-semibold text-cyan-300 mb-3">Key Highlights</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Lightbulb className="w-5 h-5 text-cyan-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Student-led innovation projects</span>
                    </li>
                    <li className="flex items-start">
                      <Lightbulb className="w-5 h-5 text-cyan-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Interactive technological demonstrations</span>
                    </li>
                    <li className="flex items-start">
                      <Lightbulb className="w-5 h-5 text-cyan-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Prototype showcases and presentations</span>
                    </li>
                    <li className="flex items-start">
                      <Lightbulb className="w-5 h-5 text-cyan-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Expert feedback and mentoring</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-500/10">
                  <h3 className="text-lg font-semibold text-cyan-300 mb-3">Featured Categories</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Zap className="w-5 h-5 text-cyan-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Artificial Intelligence & Machine Learning</span>
                    </li>
                    <li className="flex items-start">
                      <Zap className="w-5 h-5 text-cyan-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Internet of Things & Smart Systems</span>
                    </li>
                    <li className="flex items-start">
                      <Zap className="w-5 h-5 text-cyan-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Robotics & Automation Solutions</span>
                    </li>
                    <li className="flex items-start">
                      <Zap className="w-5 h-5 text-cyan-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Sustainable Technology & Green Innovation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Logistics */}
          <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-6 shadow-xl">
            <h2 className="text-xl font-bold text-cyan-400 mb-6">Event Information</h2>
            
            <div className="space-y-5">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-cyan-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-200">Date</p>
                  <p className="text-gray-400">March 7-9, 2025</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="w-5 h-5 text-cyan-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-200">Time</p>
                  <p className="text-gray-400">9:00 AM - 5:00 PM</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-cyan-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-200">Venue</p>
                  <p className="text-gray-400">Innovation Center, RGUKT-Srikakulam</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Users className="w-5 h-5 text-cyan-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-200">Audience</p>
                  <p className="text-gray-400">Open to all students and faculty</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Award className="w-5 h-5 text-cyan-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-200">Entry</p>
                  <p className="text-gray-400">Free with Techniverse pass</p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-cyan-500/20">
                <div className="bg-blue-900/20 rounded-lg p-4 flex items-start">
                  <Sparkles className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-cyan-300">Special Opportunity</p>
                    <p className="text-gray-300 text-sm">
                      Industry professionals will be present to scout for innovative ideas
                      and potential internship opportunities for standout participants.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Innovation Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center">
            <Rocket className="w-6 h-6 mr-2" />
            Innovation Showcase Categories
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 rounded-xl border border-cyan-500/20 p-6 hover:bg-slate-800/80 transition-all hover:scale-105 duration-300 group">
              <Brain className="w-12 h-12 text-cyan-400 mb-4 group-hover:text-cyan-300 transition-colors" />
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                AI & Data Science
              </h3>
              <p className="text-gray-400 mb-4">
                Projects leveraging artificial intelligence, machine learning algorithms, 
                and advanced data analytics to solve real-world problems.
              </p>
              <div className="flex items-center text-cyan-400 text-sm font-medium group-hover:text-cyan-300 transition-colors">
                <span>Discover innovations</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:ml-2 transition-all" />
              </div>
            </div>

            <div className="bg-slate-900/60 rounded-xl border border-cyan-500/20 p-6 hover:bg-slate-800/80 transition-all hover:scale-105 duration-300 group">
              <Monitor className="w-12 h-12 text-cyan-400 mb-4 group-hover:text-cyan-300 transition-colors" />
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                IoT & Smart Systems
              </h3>
              <p className="text-gray-400 mb-4">
                Connected devices and intelligent systems that enhance quality of life, 
                automation, and efficiency in various environments.
              </p>
              <div className="flex items-center text-cyan-400 text-sm font-medium group-hover:text-cyan-300 transition-colors">
                <span>Explore connected future</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:ml-2 transition-all" />
              </div>
            </div>

            <div className="bg-slate-900/60 rounded-xl border border-cyan-500/20 p-6 hover:bg-slate-800/80 transition-all hover:scale-105 duration-300 group">
              <Globe className="w-12 h-12 text-cyan-400 mb-4 group-hover:text-cyan-300 transition-colors" />
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                Sustainable Tech
              </h3>
              <p className="text-gray-400 mb-4">
                Green technologies and solutions addressing environmental challenges, 
                promoting sustainability and conservation of resources.
              </p>
              <div className="flex items-center text-cyan-400 text-sm font-medium group-hover:text-cyan-300 transition-colors">
                <span>See eco-innovations</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:ml-2 transition-all" />
              </div>
            </div>

            <div className="bg-slate-900/60 rounded-xl border border-cyan-500/20 p-6 hover:bg-slate-800/80 transition-all hover:scale-105 duration-300 group">
              <Code className="w-12 h-12 text-cyan-400 mb-4 group-hover:text-cyan-300 transition-colors" />
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                Software Solutions
              </h3>
              <p className="text-gray-400 mb-4">
                Innovative applications, platforms, and software systems designed 
                to solve specific problems or enhance digital experiences.
              </p>
              <div className="flex items-center text-cyan-400 text-sm font-medium group-hover:text-cyan-300 transition-colors">
                <span>View software projects</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:ml-2 transition-all" />
              </div>
            </div>

            <div className="bg-slate-900/60 rounded-xl border border-cyan-500/20 p-6 hover:bg-slate-800/80 transition-all hover:scale-105 duration-300 group">
              <Database className="w-12 h-12 text-cyan-400 mb-4 group-hover:text-cyan-300 transition-colors" />
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                Blockchain & Fintech
              </h3>
              <p className="text-gray-400 mb-4">
                Decentralized solutions, cryptocurrency innovations, and financial 
                technology applications that are reshaping digital transactions.
              </p>
              <div className="flex items-center text-cyan-400 text-sm font-medium group-hover:text-cyan-300 transition-colors">
                <span>Discover blockchain projects</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:ml-2 transition-all" />
              </div>
            </div>

            <div className="bg-slate-900/60 rounded-xl border border-cyan-500/20 p-6 hover:bg-slate-800/80 transition-all hover:scale-105 duration-300 group">
              <Zap className="w-12 h-12 text-cyan-400 mb-4 group-hover:text-cyan-300 transition-colors" />
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                Hardware Prototypes
              </h3>
              <p className="text-gray-400 mb-4">
                Physical computing, robotics, and custom hardware developments 
                that push the boundaries of what's possible with technology.
              </p>
              <div className="flex items-center text-cyan-400 text-sm font-medium group-hover:text-cyan-300 transition-colors">
                <span>Explore hardware innovations</span>
                <ChevronRight className="w-4 h-4 ml-1 group-hover:ml-2 transition-all" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Visitor Information */}
        <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-6">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">Visitor Information</h2>
          <p className="text-gray-300 mb-6">
            Tech Expo is open to all Techniverse attendees. Interact with student innovators, 
            learn about cutting-edge projects, and get inspired by the next generation of technology.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-900/20 rounded-lg p-4 border border-cyan-500/10">
              <h4 className="font-medium text-cyan-300 mb-3">For Visitors</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-cyan-500 mr-2">•</span>
                  <span className="text-gray-300">Explore interactive demonstrations from different technology domains</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-500 mr-2">•</span>
                  <span className="text-gray-300">Participate in hands-on technology experiences with student innovators</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-500 mr-2">•</span>
                  <span className="text-gray-300">Vote for your favorite projects in the People's Choice Award</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-500 mr-2">•</span>
                  <span className="text-gray-300">Attend mini tech talks throughout the day</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-blue-900/20 rounded-lg p-4 border border-cyan-500/10">
              <h4 className="font-medium text-cyan-300 mb-3">Special Activities</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-cyan-500 mr-2">•</span>
                  <span className="text-gray-300">Innovation Challenge: Real-time problem-solving competitions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-500 mr-2">•</span>
                  <span className="text-gray-300">Tech Trivia: Test your knowledge about cutting-edge technologies</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-500 mr-2">•</span>
                  <span className="text-gray-300">Future Tech Panel: Discussions with industry experts and academicians</span>
                </li>
                <li className="flex items-start">
                  <span className="text-cyan-500 mr-2">•</span>
                  <span className="text-gray-300">Networking sessions with innovators and tech enthusiasts</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechExpo;