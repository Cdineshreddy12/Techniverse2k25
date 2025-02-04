import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, AlertCircle, ChevronLeft, Check,ArrowLeft } from 'lucide-react';
const WorkshopDetails = () => {
  const { id, department } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleRegistration = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  const workshop = {
    id,
    title: "Web Development Bootcamp",
    date: "2025-02-15",
    time: "10:00 AM - 4:00 PM",
    duration: "6 Hours",
    venue: "Main Seminar Hall",
    capacity: 100,
    seatsAvailable: 35,
    image: "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=1200",
    registration: {
      deadline: "2025-02-10",
      fee: "₹500",
      status: "Open",
      earlyBirdDiscount: "10% off until Jan 31"
    },
    description: "Join us for an intensive hands-on workshop covering modern web development technologies and practices. Learn from industry experts and build real-world applications.",
    schedule: [
      { time: "10:00 AM - 10:30 AM", activity: "Registration and Kit Distribution" },
      { time: "10:30 AM - 11:30 AM", activity: "Introduction to Web Technologies" },
      { time: "11:30 AM - 1:00 PM", activity: "Hands-on Session I" },
      { time: "1:00 PM - 2:00 PM", activity: "Lunch Break" },
      { time: "2:00 PM - 3:30 PM", activity: "Hands-on Session II" },
      { time: "3:30 PM - 4:00 PM", activity: "Project Showcase and Certificate Distribution" }
    ],
    prerequisites: [
      "Basic understanding of HTML and CSS",
      "Laptop with Node.js installed",
      "Code editor (VS Code recommended)",
      "Basic JavaScript knowledge"
    ],
    benefits: [
      "Hands-on experience with industry tools",
      "Certificate of completion",
      "Project portfolio",
      "Networking opportunities"
    ]
  };

  const fadeInClass = isLoading ? 'opacity-0' : 'opacity-100 translate-y-0';

  return (
    <div className="min-h-screen bg-slate-900 pb-24">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className="bg-green-600 text-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Check size={20} />
              <p className="font-semibold">Checkout  in Cart!</p>
            </div>
            <p className="text-sm text-center">
              Explore more workshops and courses in our catalog
            </p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative h-96 mb-8">
        <div className="absolute inset-0">
          <img 
            src={workshop.image || "/api/placeholder/1200/400"}
            alt={workshop.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-20 h-full max-w-6xl mx-auto px-4 flex flex-col justify-end pb-8">
          <div className={`transition-all duration-500 ${fadeInClass}`}>
            <div className="flex  z-[0] flex-wrap gap-3 mb-4">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm 
                           backdrop-blur-sm flex items-center gap-2">
                Workshop
              </span>
              <span className="px-3 py-1 bg-slate-800/80 text-slate-300 rounded-full text-sm 
                           backdrop-blur-sm flex items-center gap-2">
                <Clock className="w-4 h-4" /> {workshop.duration}
              </span>
              <span className="px-3 py-1 bg-slate-800/80 text-slate-300 rounded-full text-sm 
                           backdrop-blur-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {workshop.venue}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white  mb-4 drop-shadow-lg">{workshop.title}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className={`transition-all duration-500 delay-100 ${fadeInClass}`}>
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-4">About the Workshop</h2>
                <p className="text-slate-300 leading-relaxed">{workshop.description}</p>
              </div>
            </div>

            {/* Schedule */}
            <div className={`transition-all duration-500 delay-200 ${fadeInClass}`}>
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  Schedule
                </h2>
                <div className="space-y-3">
                  {workshop.schedule.map((item, index) => (
                    <div 
                      key={index}
                      className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-900 rounded-lg border border-slate-700"
                    >
                      <div className="sm:w-48 font-medium text-indigo-300">
                        {item.time}
                      </div>
                      <div className="flex-1 text-slate-300">
                        {item.activity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Prerequisites & Benefits */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-all duration-500 delay-300 ${fadeInClass}`}>
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-indigo-400" />
                  Prerequisites
                </h2>
                <ul className="space-y-3">
                  {workshop.prerequisites.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-slate-300">
                      <span className="text-indigo-400 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  What You'll Get
                </h2>
                <ul className="space-y-3">
                  {workshop.benefits.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-slate-300">
                      <span className="text-emerald-400 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Registration Info - Side Panel */}
          <div className={`transition-all duration-500 delay-400 ${fadeInClass}`}>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 lg:sticky lg:top-6">
              <h2 className="text-xl font-semibold text-white mb-4">Registration Details</h2>
              
              <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                <p className="text-indigo-300 font-medium">Early Bird Discount Available</p>
                <p className="text-indigo-200 text-sm mt-1">
                  {workshop.registration.earlyBirdDiscount}
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                    <p className="text-slate-400 mb-1 text-sm">Registration Fee</p>
                    <p className="text-white text-lg font-semibold">{workshop.registration.fee}</p>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                    <p className="text-slate-400 mb-1 text-sm">Registration Deadline</p>
                    <p className="text-white text-lg font-semibold">{workshop.registration.deadline}</p>
                  </div>
                  <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                    <p className="text-slate-400 mb-1 text-sm">Available Seats</p>
                    <p className="text-white text-lg font-semibold">
                      {workshop.seatsAvailable} / {workshop.capacity}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Registration Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-md border-t border-slate-700 p-4 z-[100]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">

          <div className='flex gap-10'>
              <button 
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg 
                          bg-slate-800 hover:bg-slate-700 border border-slate-600 
                          text-white transition-all duration-300"
                >
                  <ArrowLeft size={18} />
                  <span className="hidden sm:inline">Back</span>
                </button>

              <div>
                <p className="text-white font-semibold text-lg">{workshop.registration.fee}</p>
                <p className="text-gray-400 text-sm">Registration Fee</p>
              </div>
          </div>
          <button 
            onClick={handleRegistration}
            disabled={showSuccess}
            className={`px-6 py-3 rounded-lg text-white font-medium
                     transition-all duration-300
                     ${showSuccess 
                       ? 'bg-green-600 cursor-not-allowed'
                       : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500'
                     }`}
          >
            {showSuccess ? 'Added to Cart' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkshopDetails;