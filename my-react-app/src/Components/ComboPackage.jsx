import React, { useState, memo, useEffect } from 'react';
import { Zap, Users, Gift, Star, Sparkles, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import toast from 'react-hot-toast';
import { usePackage } from './utils/PackageContext.jsx';

// Add custom shimmer animation
const customStyles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .animate-shimmer {
    animation: shimmer 2s infinite linear;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.05) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
  }
`;

const ComboPackage = memo(() => {
  const { userPackage, refreshPackage, loading: packageLoading } = usePackage();
  const { user } = useKindeAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const isRGUKT = user?.email?.toLowerCase().startsWith('s');

  useEffect(() => {
    // Add custom styles to document
    const styleSheet = document.createElement("style");
    styleSheet.innerText = customStyles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const packages = [
    {
      id: 1,
      name: "RGUKT Students",
      subtitle: "Special pricing for RGUKT students",
      icon: Zap,
      options: [
        {
          name: "All Events",
          price: 199,
          features: [
            "Access to All Technical Events",
            "Access to All Non-Technical Events",
            "Tech Fest ID Card",
            "Certificate of Participation",
            "Event Schedule Booklet"
          ]
        },
        {
          name: "All Events + Workshop",
          price: 299,
          features: [
            "All Events Package Benefits",
            "1 Workshop Registration",
            "Workshop Certificate",
            "Workshop Materials"
          ]
        }
      ],
      cardGradient: "from-blue-900/30 via-slate-900 to-blue-900/30"
    },
    {
      id: 2,
      name: "Non-RGUKT Students",
      subtitle: "For students from other institutions",
      icon: Users,
      options: [
        {
          name: "All Events",
          price: 499,
          features: [
            "Access to All Technical Events",
            "Access to All Non-Technical Events",
            "Tech Fest ID Card",
            "Certificate of Participation",
            "Event Schedule Booklet"
          ]
        },
        {
          name: "All Events + Workshop",
          price: 599,
          features: [
            "All Events Package Benefits",
            "1 Workshop Registration",
            "Workshop Certificate",
            "Workshop Materials"
          ]
        }
      ],
      cardGradient: "from-purple-900/30 via-slate-900 to-purple-900/30"
    }
  ];

  const handlePackageSelect = async (pkg, optionIdx) => {
    try {
      if (!user?.id) {
        toast.error('Please log in first');
        return;
      }

      if (!isRGUKT && pkg.id === 1) {
        toast.error('This package is only for RGUKT students');
        return;
      }

      const selectedOption = pkg.options[optionIdx];
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/combo/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kindeId: user.id,
          combo: {
            id: pkg.id,
            optionId: optionIdx,
            name: pkg.name,
            optionName: selectedOption.name,
            price: selectedOption.price,
            features: selectedOption.features
          }
        })
      });

      if (response.ok) {
        await refreshPackage();
        toast.success('Package selected successfully!');
        const departmentsSection = document.getElementById('departments-section');
        if (departmentsSection) {
          departmentsSection.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        throw new Error('Failed to select package');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const renderPackageButton = (pkg, optionIdx) => {
    const isSelected = userPackage?.id === pkg.id && userPackage?.optionId === optionIdx;
    const isDisabled = !isRGUKT && pkg.id === 1;

    return (
      <button
        onClick={() => handlePackageSelect(pkg, optionIdx)}
        disabled={isDisabled || packageLoading}
        className={`mt-4 w-full py-3 rounded-lg font-bold text-center transform transition-all duration-300
          ${isSelected 
            ? 'bg-purple-600 text-white scale-105' 
            : isDisabled 
              ? 'bg-slate-600 text-gray-400 cursor-not-allowed'
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600 hover:scale-105'}`}
      >
        {packageLoading ? 'Loading...' : isSelected ? 'Selected' : isDisabled ? 'Not Available' : 'Select Package'}
      </button>
    );
  };

  if (packageLoading) {
    return (
      <div className="min-h-[600px] p-8 relative overflow-hidden">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400  mb-4">
            Combos Will Be Revealed Soon
          </h2>
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-bounce" />
            <span className="text-xl text-white">Stay tuned for exciting combo packages</span>
            <Sparkles className="w-5 h-5 text-yellow-400 animate-bounce delay-100" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
          {[1, 2].map((idx) => (
            <div 
              key={idx}
              className="relative rounded-2xl overflow-hidden transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${idx * 200}ms` }}
            >
              {/* Shimmer effect overlay */}
              <div className="absolute inset-0 animate-shimmer" />
              
              {/* Card content */}
              <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-6 h-[500px]">
                <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
                
                {/* Lock icon container */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center ">
                    <Lock className="w-10 h-10 text-purple-400" />
                  </div>
                  
                  {/* Placeholder lines with gradient */}
                  <div className="space-y-4 w-full max-w-[80%]">
                    <div className="h-6 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded animate-pulse" />
                    <div className="h-4 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded animate-pulse w-3/4 mx-auto" />
                    <div className="h-4 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded animate-pulse w-2/3 mx-auto" />
                  </div>
                  
                  {/* Price placeholder */}
                  <div className="mt-4 w-32 h-12 bg-gradient-to-r from-blue-500 via-purple-500/20 to-blue-500 rounded-lg flex items-center justify-center">
                    <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse">
                      ₹ ???
                    </div>
                  </div>
                </div>
                
                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-blue-500/20 rotate-45 transform -translate-x-8 -translate-y-8" />
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/20 rotate-45 transform translate-x-8 translate-y-8" />
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8 text-gray-100">
          <p>Get ready for an amazing deal!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
          Student Packages
        </h2>
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          <span>Choose your package based on your institution</span>
          <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
        </div>
      </div>
 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        {packages.map(pkg => (
          <div 
            key={pkg.id}
            className={`relative rounded-2xl transition-all duration-300 transform hover:scale-105
              bg-gradient-to-br ${pkg.cardGradient} p-6`}
            onMouseEnter={() => setIsHovered(pkg.id)}
            onMouseLeave={() => setIsHovered(null)}
          >
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <pkg.icon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                <p className="text-gray-400">{pkg.subtitle}</p>
              </div>
 
              {pkg.options.map((option, idx) => (
                <div key={idx} className="bg-slate-800/50 rounded-lg p-4 transition-all duration-300 hover:bg-slate-800/70">
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-bold mb-2">{option.name}</h4>
                    <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                      ₹{option.price}
                    </p>
                  </div>
 
                  <div className="space-y-3">
                    {option.features.map((feature, fidx) => (
                      <div key={fidx} className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
 
                  {renderPackageButton(pkg, idx)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
});

export { ComboPackage };