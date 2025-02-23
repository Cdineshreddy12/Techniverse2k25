import React from 'react';
import { Github, Linkedin, Mail, Globe } from 'lucide-react';

const DevelopersSection = () => {
  const developers = [
    {
      name: "Dileep Kumar Koda",
      role: "Asst. Professor, CSE Department",
      description: "WebTeam lead of Techniverse2k25",
      image: "https://aikyam.rguktsklm.ac.in/faculty/images/(2181510s)-b956b52b1079a396a683bc1f9d7276fd.jpeg",
      github: "https://github.com/yourusername",
      linkedin: "https://linkedin.com/in/yourusername",
      website: "https://rguktsklm.ac.in"
    },
    {
      name: "Chinta Dinesh Reddy",
      role: "FullStack Developer",
      description: "Developer of Techniverse2k25",
      image: "https://res.cloudinary.com/dxsupdl3t/image/upload/v1740306488/WhatsApp_Image_2025-02-23_at_15.57.34_aa5f07e1_er54ai.jpg",
      github: "https://github.com/Cdineshreddy12",
      linkedin: "https://www.linkedin.com/in/c-dinesh-reddy/",
      website: "https://www.techniverse25.rguktsklm.ac.in"
    }
  ];

  return (
    <div className="py-16 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 mt-8 sm:px-6 lg:px-8">
        {/* Enhanced Section Header */}
        <div className="text-center mb-16">
          <div className="relative inline-block">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Meet the Developers
            </h2>
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto mt-4 text-lg">
            The talented team behind TechniVerse, bringing innovation and technology together.
          </p>
        </div>

        {/* Enhanced Developer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {developers.map((dev, index) => (
            <div 
              key={index}
              className="relative group"
            >
              {/* Enhanced Animated Background */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
              
              {/* Card Content */}
              <div className="relative bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden 
                            transform transition-all duration-500 hover:scale-[1.02] hover:bg-slate-800">
                <div className="flex flex-col items-center p-8">
                  {/* Profile Image Container */}
                  <div className="relative w-40 h-40 mb-6">
                    {/* Decorative Ring */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 p-1 animate-spin-slow">
                      <div className="w-full h-full rounded-full bg-slate-800"></div>
                    </div>
                    {/* Image */}
                    <img 
                      src={dev.image} 
                      alt={dev.name}
                      className="absolute inset-1 w-[95%] h-[95%] object-cover rounded-full ring-2 ring-slate-700/50"
                    />
                    {/* Hover Effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Info Section */}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">{dev.name}</h3>
                    <div className="text-cyan-400 font-medium mb-3 text-lg">{dev.role}</div>
                    <p className="text-gray-400 mb-6">{dev.description}</p>

                    {/* Enhanced Social Links */}
                    <div className="flex items-center justify-center gap-4">
                      <a 
                        href={dev.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-slate-700/50 text-gray-400 hover:text-white hover:bg-slate-700 
                                 transition-all duration-300 transform hover:scale-110"
                      >
                        <Github className="w-5 h-5" />
                      </a>
                      <a 
                        href={dev.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-slate-700/50 text-gray-400 hover:text-white hover:bg-slate-700 
                                 transition-all duration-300 transform hover:scale-110"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                      <a 
                        href={dev.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-slate-700/50 text-gray-400 hover:text-white hover:bg-slate-700 
                                 transition-all duration-300 transform hover:scale-110"
                      >
                        <Globe className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Enhanced Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-tl from-purple-500/10 via-blue-500/10 
                              to-cyan-500/10 blur-2xl rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DevelopersSection;