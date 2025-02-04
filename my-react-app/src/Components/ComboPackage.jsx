import React, { useState, memo, useEffect } from 'react';
import { Zap, Users, Gift, Star, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import toast from 'react-hot-toast';
import { usePackage } from './utils/PackageContext.jsx';
const ComboPackage = memo(() => {
  const { userPackage, refreshPackage, loading: packageLoading } = usePackage();
  const { user } = useKindeAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const isRGUKT = user?.email?.toLowerCase().startsWith('s');

 
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

  function CyberpunkSpinner() {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-neon-pink rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-neon-blue rounded-full animate-spin-reverse"></div>
        </div>
      </div>
    );
  }
 

 
  const renderPackageButton = (pkg, optionIdx) => {
    const isSelected = userPackage?.id === pkg.id && userPackage?.optionId === optionIdx;
    const isDisabled = !isRGUKT && pkg.id === 1;

    return (
      <button
        onClick={() => handlePackageSelect(pkg, optionIdx)}
        disabled={isDisabled || packageLoading}
        className={`mt-4 w-full py-3 rounded-lg font-bold text-center
          ${isSelected 
            ? 'bg-purple-600 text-white' 
            : isDisabled 
              ? 'bg-slate-600 text-gray-400 cursor-not-allowed'
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
      >
        {packageLoading ? 'Loading...' : isSelected ? 'Selected' : isDisabled ? 'Not Available' : 'Select Package'}
      </button>
    );
  };

  if (packageLoading) {
    return <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-2 border-cyan-500 rounded-full animate-spin border-t-transparent"></div>
    </div>;
  }

 
  return (
    <>
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
          Student Packages
        </h2>
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <span>Choose your package based on your institution</span>
          <Sparkles className="w-5 h-5 text-yellow-400" />
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
                <div key={idx} className="bg-slate-800/50 rounded-lg p-4">
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

export{ ComboPackage };