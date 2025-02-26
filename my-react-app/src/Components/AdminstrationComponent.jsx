import React, { useState, useEffect } from 'react';
import { 
  Users2, Sparkles, ChevronDown, Building2
} from 'lucide-react';

const AdministrationComponent = () => {
  const [expanded, setExpanded] = useState(true);
  const [animateHeader, setAnimateHeader] = useState(false);

  useEffect(() => {
    // Trigger header animation after component mount
    setAnimateHeader(true);
  }, []);

  const administrationData = {
    title: "Administrative Body",
    icon: Users2,
    color: "from-purple-500 to-indigo-600",
    members: [
      {
        name: "Prof. M. Vijaya Kumar", 
        role: "Vice Chancellor, RGUKT-AP", 
        designation: "Chief Patron",
        image: "https://res.cloudinary.com/dxsupdl3t/image/upload/v1740575576/WhatsApp_Image_2025-02-26_at_16.03.01_0ccd7b35_m38neh.jpg" // Placeholder for real image
      },
      {
        name: "Prof. Amarendra Kumar Sandra", 
        role: "Registrar, RGUKT-AP", 
        designation: "Patron",
        image: "https://res.cloudinary.com/dxsupdl3t/image/upload/v1740575593/WhatsApp_Image_2025-02-26_at_16.03.25_ddf0c589_sw1ufa.jpg"
      },
      {
        name: "Prof. K.V.G.D. Balaji", 
        role: "Director, RGUKT-SKLM", 
        designation: "Patron",
        image: "https://res.cloudinary.com/dxsupdl3t/image/upload/v1740575539/WhatsApp_Image_2025-02-26_at_16.02.13_63bc2f5b_ajgkn6.jpg"
      },
      {
        name: "Mr. Muni Rama Krishna", 
        role: "Administrative Officer", 
        designation: "Advisory Member",
        image: "https://res.cloudinary.com/dxsupdl3t/image/upload/v1740575508/WhatsApp_Image_2025-02-26_at_16.02.13_da2ba653_lwami1.jpg"
      },
      {
        name: "Mr. K Mohana Krishna Chowdary", 
        role: "Dean of Academics", 
        designation: "Advisory Member",
        image: "https://res.cloudinary.com/dxsupdl3t/image/upload/v1740575522/WhatsApp_Image_2025-02-26_at_16.02.13_d0802583_olbijp.jpg"
      },
      {
        name: "Mr. Ch Vasu", 
        role: "Finance Officer", 
        designation: "Advisory Member",
        image: "https://res.cloudinary.com/dxsupdl3t/image/upload/v1740575554/WhatsApp_Image_2025-02-26_at_16.02.14_faf3738e_zxzr9u.jpg"
      },
      {
        name: "Mr. Gedela Ravi", 
        role: "Dean, Student Welfare", 
        designation: "Advisory Member",
        image: "https://res.cloudinary.com/dxsupdl3t/image/upload/v1740575608/WhatsApp_Image_2025-02-26_at_16.05.11_f25a7e4f_jtbdbz.jpg"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-900 mt-12 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <div className="relative py-16 px-4 md:px-6">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20" />
        <div className="absolute top-0 inset-0 bg-slate-900 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,transparent_0%,black_100%)] pointer-events-none" />

        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${animateHeader ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full blur-md bg-gradient-to-r from-blue-600 to-indigo-600 opacity-75 animate-pulse"></div>
              <Building2 className="relative w-10 h-10 text-white p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mx-4">
              Administration
            </h1>
            <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
          </div>
          
          <p className="text-lg text-blue-200/80 font-medium max-w-2xl mx-auto">
            Leadership & Management Team
          </p>
        </div>

        {/* Administration Component */}
        <div className="max-w-5xl mx-auto">
          <div className="group backdrop-blur-xl transition-all duration-300">
            {/* Committee Header */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between p-5 bg-slate-800/50 border border-blue-500/20 
                      rounded-xl hover:bg-slate-800/70 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000" />
              
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-indigo-500/20">
                  <Users2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="text-lg font-semibold text-blue-100">{administrationData.title}</span>
                  <span className="text-xs text-blue-400/80 px-2 py-1 rounded-full bg-blue-500/10">
                    {administrationData.members.length} members
                  </span>
                </div>
              </div>
              
              <div className={`transform transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-5 h-5 text-blue-400" />
              </div>
            </button>

            {/* Members Cards */}
            {expanded && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {administrationData.members.map((member, idx) => (
                  <div 
                    key={idx}
                    className="border border-blue-500/20 rounded-xl overflow-hidden bg-slate-800/30 backdrop-blur-xl hover:bg-slate-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group"
                  >
                    <div className="p-4 flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="absolute -inset-1 rounded-full blur-sm bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
                        <img 
                          src={member.image} 
                          alt={member.name} 
                          className="w-32 h-32 rounded-full relative object-cover border-2 border-indigo-500/50"
                        />
                      </div>
                      
                      <div className="flex flex-col">
                        <h3 className="text-md font-semibold text-blue-100">{member.name}</h3>
                        <p className="text-sm text-blue-300 mt-1">{member.role}</p>
                        <span className="text-xs text-indigo-400 px-2 py-1 rounded-full bg-indigo-500/10 w-fit mt-2">
                          {member.designation}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdministrationComponent;