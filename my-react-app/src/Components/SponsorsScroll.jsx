import React from 'react';
import { Diamond, Crown, Award, Sparkles } from 'lucide-react';

const SponsorScroll = () => {
  const sponsors = {
    diamond: [
      {
        name: "TechCorp Global",
        logo: "/api/placeholder/200/80",
        description: "Leading Innovation Partner"
      },
      {
        name: "FutureStack",
        logo: "/api/placeholder/200/80",
        description: "Technology Excellence Partner"
      },
      {
        name: "TechCorp Global",
        logo: "/api/placeholder/200/80",
        description: "Leading Innovation Partner"
      },
      {
        name: "FutureStack",
        logo: "/api/placeholder/200/80",
        description: "Technology Excellence Partner"
      },
      {
        name: "TechCorp Global",
        logo: "/api/placeholder/200/80",
        description: "Leading Innovation Partner"
      },
      {
        name: "FutureStack",
        logo: "/api/placeholder/200/80",
        description: "Technology Excellence Partner"
      }
    ],
    gold: [
      {
        name: "InnovateNow",
        logo: "/api/placeholder/200/80",
        description: "Digital Solutions Partner"
      },
      {
        name: "CloudTech Pro",
        logo: "/api/placeholder/200/80",
        description: "Cloud Infrastructure Partner"
      },
      {
        name: "AI Solutions",
        logo: "/api/placeholder/200/80",
        description: "AI Technology Partner"
      }
    ],
    silver: [
      {
        name: "DevSecOps Inc",
        logo: "/api/placeholder/200/80",
        description: "Security Partner"
      },
      {
        name: "CyberShield",
        logo: "/api/placeholder/200/80",
        description: "Cybersecurity Partner"
      },
      {
        name: "DataFlow Systems",
        logo: "/api/placeholder/200/80",
        description: "Data Analytics Partner"
      }
    ]
  };

  const TierHeader = ({ icon: Icon, title, color, gradientFrom, gradientTo }) => (
    <div className="relative flex items-center justify-center mb-8">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradientFrom} ${gradientTo} blur-2xl opacity-20`} />
      <div className="flex items-center gap-3 bg-slate-900/90 px-6 py-2 rounded-full border border-slate-700">
        <Icon className={`w-6 h-6 ${color}`} />
        <h3 className={`text-2xl font-bold ${color}`}>{title}</h3>
      </div>
    </div>
  );

  const SponsorScroller = ({ sponsors, direction = 'left', speed = 'normal' }) => {
    // Double the array for seamless loop
    const extendedSponsors = [...sponsors, ...sponsors];
    
    const speedClass = {
      slow: 'animate-scroll-slow',
      normal: 'animate-scroll-normal',
      fast: 'animate-scroll-fast'
    }[speed];

    const directionClass = direction === 'right' ? 'animate-scroll-reverse' : '';

    return (
      <div className="relative overflow-hidden">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-slate-950 to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-slate-950 to-transparent" />
        
        <div className="flex gap-8 py-4 overflow-hidden group">
          <div className={`flex gap-8 shrink-0 ${speedClass} ${directionClass} group-hover:pause-animation`}>
            {extendedSponsors.map((sponsor, index) => (
              <div key={index} className="shrink-0">
                {sponsor}
              </div>
            ))}
          </div>
          <div className={`flex gap-8 shrink-0 ${speedClass} ${directionClass} group-hover:pause-animation`}>
            {extendedSponsors.map((sponsor, index) => (
              <div key={index} className="shrink-0">
                {sponsor}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Prepare sponsor cards
  const diamondCards = sponsors.diamond.map((sponsor, index) => (
    <div key={index} className="group relative w-96">
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-25 
                    group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
      <div className="relative flex items-center bg-slate-900/90 p-6 rounded-2xl border border-slate-800
                    transition-all duration-300 group-hover:border-cyan-500/50">
        <div className="flex-1">
          <img
            src={sponsor.logo}
            alt={sponsor.name}
            className="w-40 h-16 object-contain mb-4 group-hover:scale-105 transition-transform"
          />
          <h4 className="text-xl font-bold text-cyan-400 mb-2">{sponsor.name}</h4>
          <p className="text-gray-400">{sponsor.description}</p>
        </div>
        <Diamond className="w-12 h-12 text-cyan-400/20 group-hover:text-cyan-400/50 transition-colors" />
      </div>
    </div>
  ));

  const goldCards = sponsors.gold.map((sponsor, index) => (
    <div key={index} className="group relative w-80">
      <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl blur opacity-20 
                    group-hover:opacity-75 transition duration-1000" />
      <div className="relative bg-slate-900/90 p-5 rounded-xl border border-slate-800
                    transition-all duration-300 group-hover:border-amber-500/50">
        <img
          src={sponsor.logo}
          alt={sponsor.name}
          className="w-32 h-12 object-contain mb-3 group-hover:scale-105 transition-transform"
        />
        <h4 className="text-lg font-bold text-amber-400 mb-1">{sponsor.name}</h4>
        <p className="text-gray-400 text-sm">{sponsor.description}</p>
        <Crown className="absolute top-3 right-3 w-8 h-8 text-amber-400/20 group-hover:text-amber-400/50 transition-colors" />
      </div>
    </div>
  ));

  const silverCards = sponsors.silver.map((sponsor, index) => (
    <div key={index} className="group relative w-72">
      <div className="absolute -inset-1 bg-gradient-to-r from-gray-500 to-slate-500 rounded-xl blur opacity-20 
                    group-hover:opacity-75 transition duration-1000" />
      <div className="relative bg-slate-900/90 p-4 rounded-xl border border-slate-800
                    transition-all duration-300 group-hover:border-gray-500/50">
        <img
          src={sponsor.logo}
          alt={sponsor.name}
          className="w-28 h-10 object-contain mb-2 group-hover:scale-105 transition-transform"
        />
        <h4 className="text-md font-bold text-gray-400 mb-1">{sponsor.name}</h4>
        <p className="text-gray-500 text-sm">{sponsor.description}</p>
        <Award className="absolute top-2 right-2 w-6 h-6 text-gray-400/20 group-hover:text-gray-400/50 transition-colors" />
      </div>
    </div>
  ));

  return (
    <section className="py-16 bg-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      {/* Header */}
      <div className="text-center mb-16 relative">
        <Sparkles className="w-8 h-8 text-yellow-400 absolute top-0 right-1/3 animate-pulse" />
        <h2 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Our Valued Partners
        </h2>
        <p className="text-gray-400 text-xl">Empowering Innovation Together</p>
      </div>

      <div className="max-w-full mx-auto space-y-20">
        {/* Diamond Tier */}
        <div className="relative">
          <TierHeader 
            icon={Diamond} 
            title="Diamond Partners"
            color="text-cyan-400"
            gradientFrom="from-cyan-500"
            gradientTo="to-blue-500"
          />
          <SponsorScroller sponsors={diamondCards} speed="slow" />
        </div>

        {/* Gold Tier */}
        <div className="relative">
          <TierHeader 
            icon={Crown} 
            title="Gold Partners"
            color="text-amber-400"
            gradientFrom="from-amber-500"
            gradientTo="to-orange-500"
          />
          <SponsorScroller sponsors={goldCards} direction="right" speed="normal" />
        </div>

        {/* Silver Tier */}
        <div className="relative">
          <TierHeader 
            icon={Award} 
            title="Silver Partners"
            color="text-gray-400"
            gradientFrom="from-gray-500"
            gradientTo="to-slate-500"
          />
          <SponsorScroller sponsors={silverCards} speed="fast" />
        </div>
      </div>

      <style jsx global>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes scroll-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }

        .animate-scroll-slow {
          animation: scroll 60s linear infinite;
        }

        .animate-scroll-normal {
          animation: scroll 45s linear infinite;
        }

        .animate-scroll-fast {
          animation: scroll 30s linear infinite;
        }

        .animate-scroll-reverse {
          animation-direction: reverse;
        }

        .group:hover .pause-animation {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default SponsorScroll;