import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, Clock, Tag, Loader, 
  IndianRupee, CalendarClock, ShoppingCart, 
  GraduationCap, Star, ArrowLeft, Mail, Link as LinkIcon,
  Image as ImageIcon, CheckCircle, BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { store } from '../../Redux/mainStore';
import { addToCart } from '../../Redux/cartSlice';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import API_CONFIG from '../../config/api';

// Fetch workshop function
const fetchWorkshopDetails = async ({ departmentId, workshopId }) => {
  const response = await fetch(
    API_CONFIG.getUrl(`departments/${departmentId}/workshops/${workshopId}`)
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch workshop details');
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch workshop details');
  }
  
  return data.workshop;
};

// Add to cart function
const addToBackendCart = async ({ kindeId, workshop }) => {
  if (!workshop?._id) {
    throw new Error('Invalid workshop data...');
  }
  
  const workshopItem = {
    workshopId: workshop._id,
    price: workshop.price
  };

  const url = API_CONFIG.getUrl('cart/workshop/add');
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      kindeId,
      item: workshopItem
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to add workshop to cart');
  }
  
  return response.json();
};

const WorkshopDetails = () => {
  const { departmentId, workshopId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useKindeAuth();
  const [imageError, setImageError] = useState(false);

  // Using TanStack Query for fetching workshop details
  const { 
    data: workshop, 
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['workshop', departmentId, workshopId],
    queryFn: () => fetchWorkshopDetails({ departmentId, workshopId }),
    staleTime: 1000 * 60 * 30, // 30 minutes - data considered fresh for half an hour
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours - keep unused data in cache for a day
    retry: 2,
    onError: (error) => {
      toast.error(error.message);
      console.error('Error fetching workshop:', error);
    }
  });

  // Using TanStack Mutation for adding to cart
  const { mutate: addWorkshopToCart, isLoading: addingToCart } = useMutation({
    mutationFn: addToBackendCart,
    onSuccess: (data) => {
      if (data.success) {
        dispatch(addToCart({
          type: 'workshop',
          item: {
            id: workshop._id,
            title: workshop.title,
            description: workshop.description,
            departments: workshop.departments,
            lecturers: workshop.lecturers,
            price: workshop.price,
            registration: workshop.registration,
            media: {
              bannerDesktop: workshop.bannerDesktop,
              bannerMobile: workshop.bannerMobile
            }
          }
        }));
        toast.success('Workshop added to cart!');
        navigate('/cart');
      }
    },
    onError: (error) => {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Failed to add workshop to cart');
    }
  });

  // Helper function to determine if registration is allowed
  const isRegistrationAllowed = (workshop) => {
    return workshop.registrationStatus === 'open' && 
           workshop.registration.registeredCount < workshop.registration.totalSlots;
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!user?.id) {
      toast.error('Please login to add to cart');
      return;
    }
    
    if (!isRegistrationAllowed(workshop)) {
      toast.error('Workshop registration is not available');
      return;
    }
  
    // Check for existing item in Redux store
    const existingWorkshop = store.getState().cart.workshops.find(item => 
      item.id === workshop._id
    );
    
    if (existingWorkshop) {
      toast.error('Workshop already in cart!');
      return;
    }

    // Use the mutation
    addWorkshopToCart({
      kindeId: user.id,
      workshop: workshop
    });
  };

  // Handle image loading errors
  const handleImageError = () => {
    setImageError(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (isError || !workshop) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Workshop Not Found</h2>
          <p className="text-gray-400 mb-6">{error?.message || "The workshop you're looking for doesn't exist."}</p>
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

  const LecturerCard = ({ lecturer }) => {
    const [lecturerImageError, setLecturerImageError] = useState(false);
    
    return (
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div className="flex gap-6">
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-700 shrink-0 flex items-center justify-center">
            {!lecturer.photo || lecturerImageError ? (
              <div className="w-full h-full bg-indigo-900/30 flex flex-col items-center justify-center">
                <ImageIcon className="w-8 h-8 text-indigo-400 mb-1" />
                <span className="text-xs text-indigo-300">{lecturer.name?.charAt(0) || "L"}</span>
              </div>
            ) : (
              <img 
                src={lecturer.photo}
                alt={lecturer.name}
                className="w-full h-full object-cover"
                onError={() => setLecturerImageError(true)}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-1">{lecturer.name}</h3>
            <p className="text-indigo-400 text-sm mb-2">{lecturer.title}</p>
            <p className="text-gray-400 text-sm mb-3">{lecturer.role}</p>
            {lecturer.specifications?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {lecturer.specifications.map((spec, idx) => (
                  <span key={idx} className="px-2 py-1 bg-slate-700 rounded-lg text-xs text-gray-300">
                    {spec}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Prerequisites and Outcomes Section
  const PrerequisitesAndOutcomes = () => {
    if (!workshop.prerequisites?.length && !workshop.outcomes?.length) {
      return null;
    }

    return (
      <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {workshop.prerequisites?.length > 0 && (
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-semibold text-white">Prerequisites</h2>
            </div>
            <ul className="space-y-3">
              {workshop.prerequisites.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="mt-1 text-indigo-400">•</div>
                  <p className="text-gray-300">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {workshop.outcomes?.length > 0 && (
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-semibold text-white">What You'll Learn</h2>
            </div>
            <ul className="space-y-3">
              {workshop.outcomes.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="mt-1 text-indigo-400">•</div>
                  <p className="text-gray-300">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-24">
      {/* Hero Section */}
      <div className="h-[40vh] relative">
        {imageError || !workshop.bannerDesktop ? (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-violet-800 flex flex-col items-center justify-center">
            <ImageIcon className="w-16 h-16 text-indigo-300 mb-4 opacity-60" />
            <h1 className="text-2xl md:text-3xl font-bold text-white text-center px-4">{workshop.title}</h1>
          </div>
        ) : (
          <img 
            src={workshop.bannerDesktop} 
            alt={workshop.title}
            className="w-full h-full object-contain"
            onError={handleImageError}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 -mt-20 relative">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {workshop.departments.map(dept => (
              <span key={dept._id} 
                className={`px-3 py-1 rounded-full text-xs font-medium ${dept.color} text-white`}>
                {dept.shortName}
              </span>
            ))}
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
              {workshop.status}
            </span>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-6">{workshop.title}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className="text-sm text-gray-400">Duration</p>
                  <p className="text-white">{workshop.totalLearningHours} Hours</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className="text-sm text-gray-400">Seats</p>
                  <p className="text-white">
                    {workshop.registration.registeredCount}/{workshop.registration.totalSlots}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-3">
                <IndianRupee className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className="text-sm text-gray-400">Price</p>
                  <p className="text-white">₹{workshop.price}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-3">
                <CalendarClock className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className="text-sm text-gray-400">Registration Ends</p>
                  <p className="text-white">
                    {new Date(workshop.registrationEndTime).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">About the Workshop</h2>
            <p className="text-gray-300 leading-relaxed">{workshop.description}</p>
          </div>
        </div>

        {/* Prerequisites and Outcomes Section */}
        <PrerequisitesAndOutcomes />

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Workshop Timing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-sm text-gray-400">Duration</p>
                <p className="text-white">
                  {new Date(workshop.workshopTiming.startDate).toLocaleDateString()} - 
                  {new Date(workshop.workshopTiming.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-sm text-gray-400">Daily Schedule</p>
                <p className="text-white">
                  {workshop.workshopTiming.dailyStartTime} - 
                  {workshop.workshopTiming.dailyEndTime} 
                  ({workshop.workshopTiming.timeZone})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lecturers */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Workshop Leaders</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {workshop.lecturers?.map((lecturer, index) => (
              <LecturerCard key={index} lecturer={lecturer} />
            ))}
          </div>
        </div>

        {/* Schedule */}
        {workshop.schedule?.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Workshop Schedule</h2>
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              {workshop.schedule.map((session, index) => (
                <div key={index} className="p-4 border-b border-slate-700 last:border-0">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="sm:w-48">
                      <p className="text-indigo-400 font-medium">{session.time}</p>
                    </div>
                    <p className="text-gray-300">{session.activity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-xl border-t border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-purple-400">
                <Star className="w-4 h-4 inline mr-1" />
                Available in Combo Package
              </p>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!isRegistrationAllowed(workshop) || addingToCart}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium
                      ${isRegistrationAllowed(workshop) && !addingToCart
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500'
                        : 'bg-slate-700 cursor-not-allowed'}`}
            >
              {addingToCart ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
              <span>
                {addingToCart ? 'Adding to Cart...' : 
                !isRegistrationAllowed(workshop) ? 
                  (workshop.registration.registeredCount >= workshop.registration.totalSlots ? 
                    'Sold Out' : 'Registration Closed') : 
                  'Add to Cart'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopDetails;