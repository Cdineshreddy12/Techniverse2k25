import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, Clock, Phone, Tag, Check, 
  ArrowLeft, Loader, IndianRupee, CalendarClock, MapPin, 
  ShoppingCart, AlertCircle, GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { store } from '../../Redux/mainStore';
import { addToCart } from '../../Redux/cartSlice';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import API_CONFIG from '../../config/api';

const WorkshopDetails = () => {
  const { departmentId, workshopId } = useParams();
  const navigate = useNavigate();
  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  
  const { user } = useKindeAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchWorkshopDetails();
  }, [departmentId, workshopId]);

  const fetchWorkshopDetails = async () => {
    try {
      const apiUrl = API_CONFIG.getUrl(`departments/${departmentId}/workshops/${workshopId}`);
      const response = await fetch(apiUrl);
      const data = await response.json();
  
      if (data.success) {
        setWorkshop(data.workshop);
      } else {
        throw new Error(data.error || 'Failed to fetch workshop details');
      }
    } catch (error) {
      toast.error(error.message);
      console.error('Error fetching workshop:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader className="w-6 h-6 text-indigo-500 animate-spin" />
          <span className="text-white">Loading workshop details...</span>
        </div>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Workshop Not Found</h2>
          <p className="text-gray-400 mb-6">The workshop you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const PriceDisplay = ({ workshop }) => (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-2.5">
          <IndianRupee className="w-full h-full text-white" />
        </div>
        <span className="text-gray-400 text-sm">Workshop Fee</span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-xl font-bold text-white line-through text-opacity-50">
            ₹{workshop.price}
          </p>
          <span className="text-sm text-emerald-400">
            Available in Combo Package
          </span>
        </div>
        <p className="text-sm text-gray-400">
          *Workshop can be bundled with event packages for best value
        </p>
        <div className="mt-4 px-4 py-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-400" />
            <p className="text-sm text-purple-400">
              RGUKT students get special combo rates
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  

  return (
    <div className="min-h-screen bg-slate-900 relative pb-24">
      {/* Hero Section */}
      <div className="h-[40vh] relative">
        <img 
          src={workshop.bannerDesktop || "/api/placeholder/1920/1080"} 
          alt={workshop.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Title and Description */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            {workshop.departments.map(dept => (
              <span key={dept._id} 
                className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${dept.color} text-white`}>
                {dept.shortName}
              </span>
            ))}
            <span className="px-3 py-1 rounded-full text-xs font-medium
                         bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
              {workshop.status}
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {workshop.title}
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-3xl whitespace-pre-wrap">
            {workshop.description}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-2.5">
                <CalendarClock className="w-full h-full text-white" />
              </div>
              <span className="text-gray-400 text-sm">Schedule</span>
            </div>
            <p className="text-xl font-bold text-white">
              {workshop.schedule.length} Sessions
            </p>
            <p className="text-sm text-gray-400">{formatDate(workshop.registrationEndTime)}</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 p-2.5">
                <Users className="w-full h-full text-white" />
              </div>
              <span className="text-gray-400 text-sm">Registrations</span>
            </div>
            <p className="text-xl font-bold text-white">{workshop.registrations}</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-2.5">
                <Clock className="w-full h-full text-white" />
              </div>
              <span className="text-gray-400 text-sm">Duration</span>
            </div>
            <p className="text-xl font-bold text-white">{workshop.totalLearningHours} Hours</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 p-2.5">
                <GraduationCap className="w-full h-full text-white" />
              </div>
              <span className="text-gray-400 text-sm">Lecturer</span>
            </div>
            <p className="text-xl font-bold text-white truncate">{workshop.lecturer.name}</p>
          </div>
        </div>

        {/* Lecturer Section */}
        <div className="bg-slate-800 rounded-xl p-6 sm:p-8 border border-slate-700 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">About the Lecturer</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3">
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-700">
                <img 
                  src={workshop.lecturer.photo || "/api/placeholder/400/400"} 
                  alt={workshop.lecturer.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <h3 className="text-xl font-bold text-white mb-2">{workshop.lecturer.name}</h3>
              <p className="text-lg text-indigo-400 mb-4">{workshop.lecturer.title}</p>
              <div className="space-y-3">
                {workshop.lecturer.specifications.map((spec, index) => (
                  <p key={index} className="text-gray-300">{spec}</p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Section */}
        {workshop.schedule.length > 0 && (
          <div className="bg-slate-800 rounded-xl p-6 sm:p-8 border border-slate-700 mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Workshop Schedule</h2>
            <div className="space-y-4">
              {workshop.schedule.map((session, index) => (
                <div key={session.id} className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="sm:w-48">
                      <p className="text-indigo-400 font-medium">{session.time}</p>
                    </div>
                    <div>
                      <p className="text-gray-300">{session.activity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-md border-t border-slate-700 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg 
                        bg-slate-800 hover:bg-slate-700 border border-slate-600 
                        text-white transition-all duration-300"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Back</span>
              </button>

              {/* Registration Info */}
              <div className="hidden md:block">
                <p className="text-gray-400 text-sm">Registration Closes</p>
                <p className="text-white font-medium">{formatDate(workshop.registrationEndTime)}</p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-6">
              {/* Pricing Info */}
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-gray-400 text-sm">Workshop Value</p>
                  <p className="text-base line-through text-gray-500">₹{workshop.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-purple-400" />
                  <p className="text-sm text-purple-400">Available in Combo Package</p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  if (!user?.id) {
                    toast.error('Please login to add to cart');
                    return;
                  }
                  
                  if (workshop.status !== 'upcoming') {
                    toast.error('Workshop registration is closed');
                    return;
                  }
                  
                  dispatch(addToCart({
                    type: 'workshop',
                    item: {
                      id: workshop._id,
                      title: workshop.title,
                      description: workshop.description,
                      departments: workshop.departments,
                      lecturer: workshop.lecturer,
                      price: workshop.price,
                      registration: workshop.registration,
                      media: {
                        bannerDesktop: workshop.bannerDesktop,
                        bannerMobile: workshop.bannerMobile
                      }
                    }
                  }));
                  toast.success('Workshop added to cart!');
                  navigate('/cart'); // Optionally navigate to cart after adding
                }}
                disabled={workshop.status !== 'upcoming'}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium
                          transition-all duration-300 shadow-lg
                          ${workshop.status === 'upcoming'
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 hover:shadow-purple-500/25'
                            : 'bg-slate-700 cursor-not-allowed'}`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>

          {/* Mobile Registration Date - Shows only on small screens */}
          <div className="md:hidden mt-2 text-center">
            <p className="text-gray-400 text-sm">Registration Closes</p>
            <p className="text-white font-medium">{formatDate(workshop.registrationEndTime)}</p>
          </div>
        </div>
    </div>
  );
};

export default WorkshopDetails;