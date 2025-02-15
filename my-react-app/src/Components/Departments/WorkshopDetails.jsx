import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, Clock, Tag, Loader, 
  IndianRupee, CalendarClock, ShoppingCart, 
  GraduationCap, Star, ArrowLeft, Mail, Link as LinkIcon
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
  const dispatch = useDispatch();
  const { user } = useKindeAuth();

  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!user?.id) {
      toast.error('Please login to add to cart');
      return;
    }
    
    if (!isRegistrationAllowed(workshop)) {
      toast.error('Workshop registration is not available');
      return;
    }
  
    try {
      setAddingToCart(true);
      
      const existingWorkshop = store.getState().cart.workshops.find(item => 
        item.id === workshop._id
      );
      
      if (existingWorkshop) {
        toast.error('Workshop already in cart!');
        return;
      }
  
      const backendResponse = await addToBackendCart(user.id, workshop);
      
      if (backendResponse.success) {
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
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Failed to add workshop to cart');
    } finally {
      setAddingToCart(false);
    }
  };
  

  useEffect(() => {
    const fetchWorkshopDetails = async () => {
      try {
        const response = await fetch(
          API_CONFIG.getUrl(`departments/${departmentId}/workshops/${workshopId}`)
        );
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

    fetchWorkshopDetails();
  }, [departmentId, workshopId]);


  // First, add a helper function to determine if registration is allowed
const isRegistrationAllowed = (workshop) => {
  return workshop.registrationStatus === 'open' && 
         workshop.registration.registeredCount < workshop.registration.totalSlots;
};


const addToBackendCart = async (kindeId, workshop) => {
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


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader className="w-6 h-6 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Workshop Not Found</h2>
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

  const LecturerCard = ({ lecturer }) => (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <div className="flex gap-6">
        <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-700 shrink-0">
          <img 
            src={lecturer.photo || "/api/placeholder/200/200"} 
            alt={lecturer.name}
            className="w-full h-full object-cover"
          />
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

  console.log('worshop status',workshop.registrationStatus );
  console.log('worshop status type ',typeof workshop.registrationStatus );
  return (
    <div className="min-h-screen bg-slate-900 pb-24">
      {/* Hero Section */}
      <div className="h-[40vh] relative">
        <img 
          src={workshop.bannerDesktop || "/api/placeholder/1920/1080"} 
          alt={workshop.title}
          className="w-full h-full object-cover"
        />
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
                    !workshop.registration.isOpen ? 'Registration Closed' :
                    workshop.registration.registeredCount >= workshop.registration.totalSlots??'Add to Cart'}
                  </span>
                </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopDetails;