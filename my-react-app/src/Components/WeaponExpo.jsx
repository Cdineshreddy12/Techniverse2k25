import React, { useEffect } from 'react';
import { 
  Shield, Target, Crosshair, Calendar, Clock, MapPin, 
  Users, Award, Eye, AlertTriangle, Info, Phone, Mail, User
} from 'lucide-react';

const WeaponExpo = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Coordinator data
  const coordinators = [
    {
      name: "Jaisheel",
      studentId: "S220015",
      email: "s220015@rguktsklm.ac.in",
      phone: "9618906525",
      photo: "https://res.cloudinary.com/dxsupdl3t/image/upload/v1740712051/WhatsApp_Image_2025-02-28_at_01.04.54_050718da_ag6vpp.jpg",
      department: "Weapon Expo(POC)",
      class: "E1"
    },
    {
      name: "Capt. Priya Singh",
      studentId: "S221048",
      email: "s221048@rguktsklm.ac.in",
      phone: "9494521368",
      photo: "https://res.cloudinary.com/dxsupdl3t/image/upload/v1740712072/WhatsApp_Image_2025-02-28_at_01.04.55_cfc675c7_bet8s8.jpg",
      department: "Weapon Expo Coordinator",
      class: "E1"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-slate-950 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15),transparent_70%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-12 md:mb-16 text-center">
          <div className="relative inline-block mb-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg blur opacity-25"></div>
            <div className="relative rounded-lg bg-slate-900 border border-red-500/30 p-2 flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-500 mr-2" />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
                Weapon Expo
              </h1>
              <Shield className="w-6 h-6 text-red-500 ml-2" />
            </div>
          </div>
          
          <p className="text-xl text-red-200 font-semibold max-w-3xl mx-auto">
            Power, Precision, and Protection!
          </p>
          
          <p className="mt-4 text-gray-400 max-w-3xl mx-auto">
            A thrilling event in Techniverse, where armed forces and police forces showcase 
            their advanced weaponry, tactical gear, and defense technology.
          </p>
        </div>

        {/* Main Image */}
        <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl shadow-red-500/10 border border-red-500/20">
          <div className="aspect-video w-full relative bg-slate-900">
            {/* Placeholder image for military/defense showcase */}
            <img 
              src="https://res.cloudinary.com/dxsupdl3t/image/upload/v1740555773/WhatsApp_Image_2025-02-26_at_00.07.06_2b36a6ae_chavyp.jpg" 
              alt="Weapon Expo Display" 
              className="w-full h-full object-fit"
            />
            
          </div>
        </div>

        {/* Event Details Card */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="md:col-span-2 bg-slate-900/70 backdrop-blur-sm rounded-xl border border-red-500/20 p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-red-400 mb-6 flex items-center">
              <Info className="w-5 h-5 mr-2" />
              Event Details
            </h2>
            
            <div className="space-y-6">
              <p className="text-gray-300 leading-relaxed">
                The Weapon Expo offers a rare glimpse into the world of security and warfare, highlighting 
                the strength, innovation, and strategy behind modern defense systems. Visitors will 
                experience live demonstrations, cutting-edge equipment, and learn about the evolution 
                of military and law enforcement technology all in one place!
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-red-500/10">
                  <h3 className="text-lg font-semibold text-red-300 mb-3">Key Highlights</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Target className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Advanced tactical equipment showcase</span>
                    </li>
                    <li className="flex items-start">
                      <Target className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Live demonstrations by security forces</span>
                    </li>
                    <li className="flex items-start">
                      <Target className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Interactive security technology displays</span>
                    </li>
                    <li className="flex items-start">
                      <Target className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Expert talks on defense innovation</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4 border border-red-500/10">
                  <h3 className="text-lg font-semibold text-red-300 mb-3">What to Expect</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Crosshair className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Military and police tech demonstrations</span>
                    </li>
                    <li className="flex items-start">
                      <Crosshair className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Historical to cutting-edge weapons display</span>
                    </li>
                    <li className="flex items-start">
                      <Crosshair className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Security innovations and protective gear</span>
                    </li>
                    <li className="flex items-start">
                      <Crosshair className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Photography opportunities with equipment</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Logistics */}
          <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-red-500/20 p-6 shadow-xl">
            <h2 className="text-xl font-bold text-red-400 mb-6">Event Information</h2>
            
            <div className="space-y-5">
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-200">Date</p>
                  <p className="text-gray-400">March 8-9, 2025</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-200">Time</p>
                  <p className="text-gray-400">10:00 AM - 6:00 PM</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-200">Venue</p>
                  <p className="text-gray-400">Main Exhibition Hall, RGUKT-Srikakulam</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Users className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-200">Audience</p>
                  <p className="text-gray-400">Open to all students and faculty</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Award className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-200">Entry</p>
                  <p className="text-gray-400">Free with Techniverse pass</p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-red-500/20">
                <div className="bg-red-900/20 rounded-lg p-4 flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-300">Important Note</p>
                    <p className="text-gray-300 text-sm">
                      Photography restrictions may apply to certain exhibits.
                      Please follow all safety instructions from the staff.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Coordinators Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-red-400 mb-6 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Event Coordinators
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coordinators.map((coordinator, index) => (
              <div key={index} className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-red-500/20 p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  {/* Coordinator Image */}
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-red-500/30 flex-shrink-0">
                    <img 
                      src={coordinator.photo} 
                      alt={coordinator.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Coordinator Details */}
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-bold text-white">{coordinator.name}</h3>
                    <p className="text-red-400">{coordinator.department}</p>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-center sm:justify-start text-gray-300">
                        <User className="w-4 h-4 text-red-500 mr-2" />
                        <span>ID: {coordinator.studentId}</span>
                      </div>
                      
                      <div className="flex items-center justify-center sm:justify-start text-gray-300">
                        <Phone className="w-4 h-4 text-red-500 mr-2" />
                        <span>{coordinator.phone}</span>
                      </div>
                      
                      <div className="flex items-center justify-center sm:justify-start text-gray-300">
                        <Mail className="w-4 h-4 text-red-500 mr-2" />
                        <span>{coordinator.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Safety Notice */}
        <div className="bg-orange-950/30 border border-orange-500/20 rounded-xl p-6 mb-12">
          <h3 className="text-xl font-bold text-orange-400 mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Visitor Information
          </h3>
          <p className="text-gray-300 mb-4">
            All weapons and equipment on display are under strict security measures 
            and supervised by professional personnel at all times. The exhibition focuses 
            on educational aspects of defense technology and security innovations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/60 rounded-lg p-4 border border-orange-500/10">
              <h4 className="font-medium text-orange-300 mb-2">Guidelines for Visitors</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Follow all instructions from security personnel
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Do not touch equipment without permission
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Maintain a safe distance from demonstrations
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Photography allowed in designated areas only
                </li>
              </ul>
            </div>
            <div className="bg-slate-900/60 rounded-lg p-4 border border-orange-500/10">
              <h4 className="font-medium text-orange-300 mb-2">Benefits of Attending</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Educational insights into defense systems
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Career information in security sectors
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Understanding of modern security challenges
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  Appreciation of technology evolution
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeaponExpo;