import React, { useState } from 'react';
import { Diamond, Crown, Award, Sparkles, Globe, Rocket, Shield, Zap } from 'lucide-react';

const SponsorScroll = () => {
  // Using actual sponsor data from the provided images
  const sponsors = {
    platinum: [
      {
        name: "Leo Global Overseas",
        logo: "https://res.cloudinary.com/dxsupdl3t/image/upload/v1740709537/WhatsApp_Image_2025-02-27_at_20.10.53_9f46e656_o0panb.jpg", // Replace with actual logo path
        description: "Platinum Sponsor",
        details: "Prime logo on all event materials and brochures",
        icon: Globe
      }
    ],
    diamond: [
      // This array is empty by default, showing we have no diamond sponsors yet
    ],
    gold: [
      // This array is empty by default, showing we have no gold sponsors yet
    ],
    silver: [
      // This array is empty by default, showing we have no silver sponsors yet
    ],
    bronze: [
      // This array is empty by default, showing we have no bronze sponsors yet
    ],
    food: [
      // This array is empty by default, showing we have no food sponsors yet
    ]
  };

  const SponsorCard = ({ sponsor, tier, Icon }) => {
    const [isHovered, setIsHovered] = useState(false);
    const CustomIcon = sponsor.icon || Icon;
    
    const tierStyles = {
      platinum: {
        wrapper: "w-full sm:w-full md:w-full max-w-md",
        gradient: "from-purple-500 to-pink-500",
        border: "border-purple-500/50",
        title: "text-purple-400",
        icon: "text-purple-400/50",
        badge: "bg-purple-400/10 text-purple-400"
      },
      diamond: {
        wrapper: "w-full sm:w-full md:w-full max-w-md",
        gradient: "from-cyan-500 to-blue-500",
        border: "border-cyan-500/50",
        title: "text-cyan-400",
        icon: "text-cyan-400/50",
        badge: "bg-cyan-400/10 text-cyan-400"
      },
      gold: {
        wrapper: "w-full sm:w-full md:w-full max-w-md",
        gradient: "from-amber-500 to-orange-500",
        border: "border-amber-500/50",
        title: "text-amber-400",
        icon: "text-amber-400/50",
        badge: "bg-amber-400/10 text-amber-400"
      },
      silver: {
        wrapper: "w-full sm:w-full md:w-full max-w-md",
        gradient: "from-gray-400 to-slate-400",
        border: "border-gray-400/50",
        title: "text-gray-200",
        icon: "text-gray-300/50",
        badge: "bg-gray-400/10 text-gray-200"
      },
      bronze: {
        wrapper: "w-full sm:w-full md:w-full max-w-md",
        gradient: "from-yellow-800 to-amber-800",
        border: "border-amber-800/50",
        title: "text-amber-700",
        icon: "text-amber-700/50",
        badge: "bg-amber-700/10 text-amber-700"
      },
      food: {
        wrapper: "w-full sm:w-full md:w-full max-w-md",
        gradient: "from-green-500 to-emerald-500",
        border: "border-green-500/50",
        title: "text-green-400",
        icon: "text-green-400/50",
        badge: "bg-green-400/10 text-green-400"
      }
    };

    const style = tierStyles[tier];

    return (
      <div 
        className={`group relative ${style.wrapper} cursor-pointer transition-all duration-300`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`absolute -inset-1 bg-gradient-to-r ${style.gradient} rounded-2xl blur opacity-75 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-75'}`} />
        <div className={`relative h-full bg-slate-900/90 p-4 sm:p-5 md:p-6 rounded-2xl border ${style.border} flex flex-col justify-between transition-transform duration-300 ${isHovered ? 'scale-[1.02]' : ''}`}>
          <div className="flex-1">
            <div className="relative h-40 sm:h-44 md:h-48 mb-4 overflow-hidden rounded-lg">
              <img
                src={sponsor.logo}
                alt={sponsor.name}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
           
              <div className={`absolute top-2 right-2 ${style.badge} px-2 py-1 rounded-full text-xs font-medium`}>
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CustomIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${style.title}`} />
                <h4 className={`text-lg sm:text-xl md:text-2xl font-bold ${style.title}`}>{sponsor.name}</h4>
              </div>
              <p className="text-gray-300 font-medium text-sm sm:text-base">{sponsor.description}</p>
              <p className="text-gray-400 text-sm line-clamp-2">{sponsor.details}</p>
            </div>
          </div>
          <Icon className={`absolute top-4 right-4 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${style.icon}`} />
        </div>
      </div>
    );
  };

  const SponsorGrid = ({ sponsors, tier, Icon }) => {
    // Only display the section if there are sponsors to show
    if (!sponsors || sponsors.length === 0) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 py-6 px-4">
        {sponsors.map((sponsor, index) => (
          <SponsorCard 
            key={`${sponsor.name}-${index}`}
            sponsor={sponsor}
            tier={tier}
            Icon={Icon}
          />
        ))}
      </div>
    );
  };

  const TierHeader = ({ icon: Icon, title, color, gradientFrom, gradientTo }) => (
    <div className="relative flex items-center justify-center mb-6 sm:mb-8 md:mb-10">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradientFrom} ${gradientTo} blur-3xl opacity-40`} />
      <div className="flex items-center gap-3 md:gap-4 bg-slate-900/90 px-6 md:px-8 py-3 rounded-full border border-slate-700/50">
        <Icon className={`w-6 h-6 md:w-8 md:h-8 ${color}`} />
        <h3 className={`text-xl md:text-2xl lg:text-3xl font-bold ${color}`}>{title}</h3>
      </div>
    </div>
  );

  // Check if there are any sponsors at all
  const hasPlatinumSponsors = sponsors.platinum && sponsors.platinum.length > 0;
  const hasDiamondSponsors = sponsors.diamond && sponsors.diamond.length > 0;
  const hasGoldSponsors = sponsors.gold && sponsors.gold.length > 0;
  const hasSilverSponsors = sponsors.silver && sponsors.silver.length > 0;
  const hasBronzeSponsors = sponsors.bronze && sponsors.bronze.length > 0;
  const hasFoodSponsors = sponsors.food && sponsors.food.length > 0;
  
  const hasAnySponsors = hasPlatinumSponsors || hasDiamondSponsors || hasGoldSponsors || 
                         hasSilverSponsors || hasBronzeSponsors || hasFoodSponsors;
  
  // If there are no sponsors at all, don't render the section
  if (!hasAnySponsors) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-30" />
      </div>
      
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 sm:mb-16 md:mb-20 relative px-4">
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-yellow-400 absolute top-0 right-1/3 opacity-70" />
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Our Valued Partners
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300">Empowering Innovation Together</p>
        </div>

        <div className="space-y-16 sm:space-y-20 md:space-y-24 lg:space-y-28">
          {/* Only render tier sections if they have sponsors */}
          {hasPlatinumSponsors && (
            <div className="relative">
              <TierHeader 
                icon={Sparkles} 
                title="Platinum Partners"
                color="text-purple-400"
                gradientFrom="from-purple-500"
                gradientTo="to-pink-500"
              />
              <SponsorGrid 
                sponsors={sponsors.platinum}
                tier="platinum"
                Icon={Sparkles}
              />
            </div>
          )}

          {hasDiamondSponsors && (
            <div className="relative">
              <TierHeader 
                icon={Diamond} 
                title="Diamond Partners"
                color="text-cyan-400"
                gradientFrom="from-cyan-500"
                gradientTo="to-blue-500"
              />
              <SponsorGrid 
                sponsors={sponsors.diamond}
                tier="diamond"
                Icon={Diamond}
              />
            </div>
          )}

          {hasGoldSponsors && (
            <div className="relative">
              <TierHeader 
                icon={Crown} 
                title="Gold Partners"
                color="text-amber-400"
                gradientFrom="from-amber-500"
                gradientTo="to-orange-500"
              />
              <SponsorGrid 
                sponsors={sponsors.gold}
                tier="gold"
                Icon={Crown}
              />
            </div>
          )}

          {hasSilverSponsors && (
            <div className="relative">
              <TierHeader 
                icon={Award} 
                title="Silver Partners"
                color="text-gray-300"
                gradientFrom="from-gray-400"
                gradientTo="to-slate-400"
              />
              <SponsorGrid 
                sponsors={sponsors.silver}
                tier="silver"
                Icon={Award}
              />
            </div>
          )}

          {hasBronzeSponsors && (
            <div className="relative">
              <TierHeader 
                icon={Shield} 
                title="Bronze Partners"
                color="text-amber-700"
                gradientFrom="from-yellow-800"
                gradientTo="to-amber-800"
              />
              <SponsorGrid 
                sponsors={sponsors.bronze}
                tier="bronze"
                Icon={Shield}
              />
            </div>
          )}

          {hasFoodSponsors && (
            <div className="relative">
              <TierHeader 
                icon={Zap} 
                title="Food Partners"
                color="text-green-400"
                gradientFrom="from-green-500"
                gradientTo="to-emerald-500"
              />
              <SponsorGrid 
                sponsors={sponsors.food}
                tier="food"
                Icon={Zap}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SponsorScroll;