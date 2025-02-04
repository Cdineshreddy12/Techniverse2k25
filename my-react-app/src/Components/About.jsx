import React from 'react';

const AboutPage = () => {
  return (
    <div className="min-h-screen mt-[-18%] sm:mt-[-8%] bg-gradient-to-br from-slate-950 via-indigo-950 to-black relative overflow-hidden">
      {/* Enhanced Background Glow Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Main center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px]">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl animate-pulse-slow" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent blur-2xl" />
        </div>

        {/* Additional ambient glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-300" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500" />
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent" 
             style={{
               backgroundImage: `radial-gradient(circle at center, rgba(255,255,255,0.03) 0.5px, transparent 1px)`,
               backgroundSize: '24px 24px'
             }} />
      </div>

      <div className="max-w-7xl mx-auto py-20 relative">
        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 mb-16">
          About TechniVerse
        </h1>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Video Section */}
          <div className="w-full lg:w-1/2">
            <div className="group relative rounded-xl overflow-hidden transition-transform hover:-translate-y-1 duration-300">
              {/* Enhanced Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-50 transition duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20 rounded-xl opacity-30 blur-xl group-hover:opacity-50 transition duration-300" />
              
              <div className="relative rounded-xl overflow-hidden bg-slate-900/90 border border-slate-800/50 backdrop-blur-sm">
                <div className="aspect-video">
                  <iframe 
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                    title="TechniVerse 2K24"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Text Content Section */}
          <div className="w-full lg:w-1/2">
            <div className="group relative">
              {/* Content glow background */}
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition duration-500" />
              
              <div className="relative space-y-8 p-8 rounded-xl bg-slate-900/80 border border-slate-800/50 backdrop-blur-sm hover:border-slate-700/50 transition-colors duration-300">
                <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                  TechniVerse-2K25
                </h2>
                
                <div className="space-y-6 text-gray-300 leading-relaxed">
                  <p className="text-lg">
                    An exciting convergence of innovation, expertise, and collaboration in the realm of technology.
                    TechniVerse offers an utopia where students immerse themselves in trending technology,
                    build network with peers and gain industrial knowledge.
                  </p>

                  <p className="text-lg">
                    Our event serves as a platform for enthusiasts to exchange ideas and bring up new advancements
                    in current technology. We are dedicated to provide hands-on experience for highly demanded
                    workshops and guest lectures.
                  </p>

                  <p className="text-lg font-medium bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    Join us in TechniVerse-2K25, an unbound voyage into the technical world.
                  </p>
                </div>

                {/* Enhanced Interactive Button */}
                <button className="group relative px-6 py-3 rounded-lg overflow-hidden">
                  {/* Button glow background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300 group-hover:opacity-80" />
                  <div className="relative flex items-center gap-2 text-white font-semibold">
                    Explore More
                    <svg 
                      className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M13 7l5 5m0 0l-5 5m5-5H6" 
                      />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;