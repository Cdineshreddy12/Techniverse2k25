import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Diamond, Crown, Award, Sparkles, Globe, Rocket, Shield, Zap } from 'lucide-react';

const SponsorScroll = () => {
  const sponsors = {
    diamond: [
      {
        name: "TechCorp Global",
        logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80",
        description: "Leading Innovation Partner",
        details: "Pioneering technological advancement through innovative solutions.",
        icon: Globe
      },
      {
        name: "FutureStack",
        logo: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
        description: "Technology Excellence Partner",
        details: "Building the future of enterprise technology solutions.",
        icon: Rocket
      },
      {
        name: "CloudTech Solutions",
        logo: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
        description: "Cloud Infrastructure Partner",
        details: "Transforming businesses through cloud computing.",
        icon: Shield
      }
    ],
    gold: [
      {
        name: "InnovateNow",
        logo: "https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?w=800&q=80",
        description: "Digital Solutions Partner",
        details: "Creating innovative digital experiences.",
        icon: Zap
      },
      {
        name: "CloudTech Pro",
        logo: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80",
        description: "Cloud Infrastructure Partner",
        details: "Enterprise-grade cloud solutions.",
        icon: Shield
      },
      {
        name: "AI Solutions",
        logo: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&q=80",
        description: "AI Technology Partner",
        details: "Advanced business intelligence.",
        icon: Rocket
      }
    ],
    silver: [
      {
        name: "DevSecOps Inc",
        logo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
        description: "Security Partner",
        details: "Advanced DevSecOps practices.",
        icon: Shield
      },
      {
        name: "CyberShield",
        logo: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
        description: "Cybersecurity Partner",
        details: "Next-gen security solutions.",
        icon: Shield
      },
      {
        name: "DataFlow Systems",
        logo: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
        description: "Data Analytics Partner",
        details: "Actionable business insights.",
        icon: Zap
      }
    ]
  };

  const SponsorCard = ({ sponsor, tier, Icon }) => {
    const [isHovered, setIsHovered] = useState(false);
    const CustomIcon = sponsor.icon || Icon;
    
    const tierStyles = {
      diamond: {
        wrapper: "w-[260px] sm:w-[280px] md:w-[320px] lg:w-[360px] h-[200px] sm:h-[220px] md:h-[240px] lg:h-[280px]",
        gradient: "from-cyan-500 to-blue-500",
        border: "border-cyan-500/50",
        title: "text-cyan-400",
        icon: "text-cyan-400/50",
        badge: "bg-cyan-400/10 text-cyan-400"
      },
      gold: {
        wrapper: "w-[240px] sm:w-[260px] md:w-[300px] lg:w-[340px] h-[180px] sm:h-[200px] md:h-[220px] lg:h-[260px]",
        gradient: "from-amber-500 to-orange-500",
        border: "border-amber-500/50",
        title: "text-amber-400",
        icon: "text-amber-400/50",
        badge: "bg-amber-400/10 text-amber-400"
      },
      silver: {
        wrapper: "w-[220px] sm:w-[240px] md:w-[280px] lg:w-[320px] h-[160px] sm:h-[180px] md:h-[200px] lg:h-[240px]",
        gradient: "from-gray-400 to-slate-400",
        border: "border-gray-400/50",
        title: "text-gray-200",
        icon: "text-gray-300/50",
        badge: "bg-gray-400/10 text-gray-200"
      }
    };

    const style = tierStyles[tier];

    return (
      <div 
        className={`group relative ${style.wrapper} cursor-pointer transition-all duration-500`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`absolute -inset-1 bg-gradient-to-r ${style.gradient} rounded-2xl blur opacity-75 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-75'}`} />
        <div className={`relative h-full bg-slate-900/90 p-3 sm:p-4 md:p-6 rounded-2xl border ${style.border} flex flex-col justify-between transition-transform duration-500 ${isHovered ? 'scale-[1.02]' : ''}`}>
          <div className="flex-1">
            <div className="relative h-16 sm:h-20 md:h-24 lg:h-32 mb-2 sm:mb-3 md:mb-4 overflow-hidden rounded-lg">
              <img
                src={sponsor.logo}
                alt={sponsor.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
           
              <div className={`absolute top-2 right-2 ${style.badge} px-2 py-1  rounded-full text-xs font-medium`}>
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </div>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <CustomIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${style.title}`} />
                <h4 className={`text-base sm:text-lg md:text-xl font-bold ${style.title} truncate`}>{sponsor.name}</h4>
              </div>
              <p className="text-gray-300 font-medium text-xs sm:text-sm md:text-base truncate">{sponsor.description}</p>
              <p className="text-gray-400 text-xs md:text-sm line-clamp-2 hidden sm:block">{sponsor.details}</p>
            </div>
          </div>
          <Icon className={`absolute top-2 right-2 sm:top-4 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 ${style.icon}`} />
        </div>
      </div>
    );
  };

  const SponsorRow = ({ sponsors, tier, Icon, speed = 'normal' }) => {
    const [isPaused, setIsPaused] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);
    const scrollRef = useRef(null);
    const animationFrameRef = useRef(null);
    const touchInfo = useRef({
      startX: 0,
      startScrollLeft: 0,
      lastX: 0,
      lastTime: 0,
      velocity: 0
    });
  
    const speedValues = {
      slow: 60,
      normal: 45,
      fast: 30
    };
  
    const momentumScroll = useCallback((velocity) => {
      if (!containerRef.current) return;
  
      let currentVelocity = velocity;
      const friction = 0.95;
      const minVelocity = 0.1;
  
      const animate = () => {
        if (Math.abs(currentVelocity) < minVelocity) {
          cancelAnimationFrame(animationFrameRef.current);
          return;
        }
  
        if (containerRef.current) {
          containerRef.current.scrollLeft -= currentVelocity;
          handleInfiniteScroll();
          currentVelocity *= friction;
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };
  
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = requestAnimationFrame(animate);
    }, []);
  
    const handleInfiniteScroll = useCallback(() => {
      const container = containerRef.current;
      if (!container) return;

      const scrollWidth = container.scrollWidth / 2;
      
      if (container.scrollLeft <= 0) {
        container.scrollLeft = scrollWidth;
      } else if (container.scrollLeft >= scrollWidth) {
        container.scrollLeft = 0;
      }
    }, []);
  
    const handleTouchStart = useCallback((e) => {
      setIsPaused(true);
      setIsDragging(true);
      
      const touch = e.touches[0];
      touchInfo.current = {
        startX: touch.clientX,
        startScrollLeft: containerRef.current?.scrollLeft || 0,
        lastX: touch.clientX,
        lastTime: Date.now(),
        velocity: 0
      };
  
      cancelAnimationFrame(animationFrameRef.current);
    }, []);
  
    const handleTouchMove = useCallback((e) => {
      if (!isDragging || !containerRef.current) return;
      
      const touch = e.touches[0];
      const currentX = touch.clientX;
      const deltaX = currentX - touchInfo.current.lastX;
      const currentTime = Date.now();
      const deltaTime = currentTime - touchInfo.current.lastTime;
      
      if (deltaTime > 0) {
        touchInfo.current.velocity = deltaX / deltaTime * 16;
      }
  
      containerRef.current.scrollLeft = touchInfo.current.startScrollLeft - 
        (currentX - touchInfo.current.startX);
      
      handleInfiniteScroll();
  
      touchInfo.current.lastX = currentX;
      touchInfo.current.lastTime = currentTime;
    }, [isDragging, handleInfiniteScroll]);
  
    const handleTouchEnd = useCallback(() => {
      setIsDragging(false);
      
      if (Math.abs(touchInfo.current.velocity) > 1) {
        momentumScroll(touchInfo.current.velocity);
      }
  
      setTimeout(() => {
        if (!containerRef.current?.matches(':hover')) {
          setIsPaused(false);
        }
      }, 50);
    }, [momentumScroll]);
  
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
  
      const handleScroll = () => {
        handleInfiniteScroll();
      };
  
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
        cancelAnimationFrame(animationFrameRef.current);
      };
    }, [handleInfiniteScroll]);
  
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
  
      const handleWheel = (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          e.preventDefault();
          container.scrollLeft += e.deltaX;
          handleInfiniteScroll();
        }
      };
  
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }, [handleInfiniteScroll]);
  
    return (
      <div 
        ref={containerRef}
        className="relative overflow-x-scroll overflow-y-hidden touch-pan-x scrollbar-hide"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => !isDragging && setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          touchAction: 'pan-x',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <div 
          className="flex gap-3 sm:gap-4 md:gap-6 lg:gap-8 py-3 sm:py-4 md:py-6 lg:py-8 px-4"
          style={{
            background: 'linear-gradient(to right, transparent, transparent)'
          }}
        >
          <div 
            ref={scrollRef}
            className="flex gap-3 sm:gap-4 md:gap-6 lg:gap-8 animate-scroll"
            style={{
              animationDuration: `${speedValues[speed]}s`,
              animationPlayState: isPaused ? 'paused' : 'running'
            }}
          >
            {[...sponsors, ...sponsors].map((sponsor, index) => (
              <SponsorCard 
                key={`${sponsor.id}-${index}`}
                sponsor={sponsor}
                tier={tier}
                Icon={Icon}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const TierHeader = ({ icon: Icon, title, color, gradientFrom, gradientTo }) => (
    <div className="relative flex items-center justify-center mb-4 sm:mb-6 md:mb-8 lg:mb-12">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradientFrom} ${gradientTo} blur-3xl opacity-40`} />
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 bg-slate-900/90 px-4 sm:px-6 md:px-8 py-2 md:py-3 rounded-full border border-slate-700/50">
        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 ${color}`} />
        <h3 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ${color}`}>{title}</h3>
      </div>
    </div>
  );

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-24 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      <div className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20 relative px-4">
        <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-yellow-400 absolute top-0 right-1/3 animate-pulse" />
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 sm:mb-4">
          Our Valued Partners
        </h2>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300">Empowering Innovation Together</p>
      </div>

      <div className="max-w-[1920px] mx-auto space-y-12 sm:space-y-16 md:space-y-20 lg:space-y-24">
        <div className="relative">
          <TierHeader 
            icon={Diamond} 
            title="Diamond Partners"
            color="text-cyan-400"
            gradientFrom="from-cyan-500"
            gradientTo="to-blue-500"
          />
          <SponsorRow 
            sponsors={sponsors.diamond}
            tier="diamond"
            Icon={Diamond}
            speed="slow"
          />
        </div>

        <div className="relative">
          <TierHeader 
            icon={Crown} 
            title="Gold Partners"
            color="text-amber-400"
            gradientFrom="from-amber-500"
            gradientTo="to-orange-500"
          />
          <SponsorRow 
            sponsors={sponsors.gold}
            tier="gold"
            Icon={Crown}
            speed="normal"
          />
        </div>

        <div className="relative">
          <TierHeader 
            icon={Award} 
            title="Silver Partners"
            color="text-gray-300"
            gradientFrom="from-gray-400"
            gradientTo="to-slate-400"
          />
          <SponsorRow 
            sponsors={sponsors.silver}
            tier="silver"
            Icon={Award}
            speed="fast"
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .animate-scroll {
          animation: scroll linear infinite;
          will-change: transform;
        }
      `}</style>
    </section>
  );
};

export default SponsorScroll;