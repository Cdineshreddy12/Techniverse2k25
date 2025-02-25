import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    Trash2, ArrowLeft, Calendar, Users, Shield, 
    Clock, ChevronDown, ChevronUp, CheckCircle 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, syncCart } from '../Redux/cartSlice';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import API_CONFIG from '../config/api';
import { toast } from 'react-hot-toast';
import PaymentHandler from './PaymentPage';

// Packages configuration
const packages = [
  {
    id: 1,
    name: "RGUKT Exclusive",
    subtitle: "Welcome, proud members of RGUKT University",
    options: [
      {
        id: 'rgukt-workshop',
        name: "Single Workshop",
        price: 1,
        features: [
          "1 Workshop Registration",
          "Workshop Certificate",
          "Workshop Materials",
          "Tech Fest ID Card"
        ]
      },
      {
        id: 'rgukt-all-events',
        name: "All Events",
        price: 1,
        features: [
          "Access to All Technical Events",
          "Access to All Non-Technical Events",
          "Tech Fest ID Card",
          "Certificate of Participation",
          "Event Schedule Booklet"
        ]
      },
      {
        id: 'rgukt-combo',
        name: "All Events + Workshop",
        price: 2,
        features: [
          "Access to All Technical Events",
          "Access to All Non-Technical Events",
          "1 Workshop Registration",
          "Workshop Certificate",
          "Workshop Materials",
          "Tech Fest ID Card",
          "Certificate of Participation",
          "Event Schedule Booklet"
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Guest Institution",
    subtitle: "Welcome, bright minds from partner institutions",
    options: [
      {
        id: 'guest-workshop',
        name: "Single Workshop",
        price: 499,
        features: [
          "1 Workshop Registration",
          "Workshop Certificate",
          "Workshop Materials",
          "Tech Fest ID Card"
        ]
      },
      {
        id: 'guest-all-events',
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
        id: 'guest-combo',
        name: "All Events + Workshop",
        price: 599,
        features: [
          "Access to All Technical Events",
          "Access to All Non-Technical Events",
          "1 Workshop Registration",
          "Workshop Certificate",
          "Workshop Materials",
          "Tech Fest ID Card",
          "Certificate of Participation",
          "Event Schedule Booklet"
        ]
      }
    ]
  }
];

const CartComponent = () => {
  const { user } = useKindeAuth();
  const [paymentSession, setPaymentSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [showComboDetails, setShowComboDetails] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Redux state with safe defaults
  const items = useSelector(state => state.cart.items || []);
  const workshops = useSelector(state => state.cart.workshops || []);
  const activeCombo = useSelector(state => state.cart.activeCombo);
  

  const [hasExistingRegistration, setHasExistingRegistration] = useState(false);
  const [existingRegistrationDetails, setExistingRegistrationDetails] = useState(null);

  const isHostInstitution = useMemo(() => {
    if (!user?.email) return false;
    const email = user.email.toLowerCase();
    
    // Check for all four RGUKT campus domains without 's' prefix requirement
    return /@rguktsklm\.ac\.in$/.test(email) || 
           /@rguktn\.ac\.in$/.test(email) || 
           /@rguktrkv\.ac\.in$/.test(email) || 
           /@rguktong\.ac\.in$/.test(email);
  }, [user?.email]);
  
  console.log('user email', user?.email);
  console.log('Is Host Institution:', isHostInstitution);
  
  const [hasWorkshop, setHasWorkshop] = useState(false);
  
  const relevantPackage = useMemo(() => 
    isHostInstitution ? packages[0] : packages[1]
  , [isHostInstitution]);

  // Calculate platform fee (2% of the total amount)
  const platformFee = useMemo(() => {
    if (!selectedCombo) return 0;
    return Math.ceil(selectedCombo.price * 0.02); // Round up to nearest integer
  }, [selectedCombo]);
  
  // Calculate total amount including platform fee
  const totalAmount = useMemo(() => {
    if (!selectedCombo) return 0;
    return selectedCombo.price + platformFee;
  }, [selectedCombo, platformFee]);

  // Workshop detection effect
  useEffect(() => {
    const workshopPresent = items.some(item => 
      item?.eventInfo?.tag?.toLowerCase?.()?.includes('workshop')
    ) || workshops.length > 0;
    
    setHasWorkshop(workshopPresent);

    if (!workshopPresent && selectedCombo?.name?.toLowerCase?.()?.includes('workshop')) {
      handleClearCombo();
    }
  }, [items, workshops, selectedCombo]);

  // Initial data fetch
  useEffect(() => {
    if (user?.id) {
      fetchActiveCombo();
      fetchCart();
    }
  }, [user]);

  // API Handlers
  const fetchActiveCombo = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(API_CONFIG.getUrl(`combo/active/${user.id}`));
      const data = await response.json();
      
      if (data.combo) {
        const packageType = isHostInstitution ? packages[0] : packages[1];
        const matchingCombo = packageType.options.find(opt => opt.id === data.combo.id);
        if (matchingCombo) {
          setSelectedCombo(matchingCombo);
        }
      }
    } catch (error) {
      console.error('Error fetching active combo:', error);
      toast.error('Failed to fetch package details');
    }
  };

  const fetchCart = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(API_CONFIG.getUrl(`cart/${user.id}`));
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch cart');
      }

      if (data.cart) {
        const processedEvents = (data.cart.events || []).map(event => ({
          ...event,
          fee: event.fee || 0
        }));

        const processedWorkshops = data.cart.workshops || [];

        dispatch(syncCart({
          items: processedEvents,
          workshops: processedWorkshops,
          activeCombo: data.cart.activeCombo || null
        }));

        if (data.cart.activeCombo) {
          const packageType = isHostInstitution ? packages[0] : packages[1];
          const matchingCombo = packageType.options.find(opt => opt.id === data.cart.activeCombo.id);
          setSelectedCombo(matchingCombo || data.cart.activeCombo);
        }
      } else {
        dispatch(syncCart({
          items: [],
          workshops: [],
          activeCombo: null
        }));
        setSelectedCombo(null);
      }
    } catch (error) {
      console.error('Cart fetch error:', error);
      toast.error("Failed to fetch cart items");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const checkExistingRegistration = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(API_CONFIG.getUrl(`registration/status/${user.id}`));
        const data = await response.json();
        
        setHasExistingRegistration(data.hasCompletedRegistration);
        if (data.hasCompletedRegistration) {
          setExistingRegistrationDetails(data.registrationDetails);
        }
      } catch (error) {
        console.error('Error checking registration status:', error);
      }
    };
  
    checkExistingRegistration();
  }, [user]);
  
  // Add this function to handle registration updates
  const handleUpdateRegistration = async () => {
    if (!user?.id) {
      toast.error('Please log in to continue');
      return;
    }
  
    if (items.length === 0 && workshops.length === 0) {
      toast.error('Your cart is empty. Add some events or a workshop first.');
      return;
    }
  
    // Check if the user is trying to update with workshops
    const hasExistingWorkshops = existingRegistrationDetails?.selectedWorkshops?.length > 0;
    
    if (hasExistingWorkshops && workshops.length > 0) {
      toast.error('You already have a workshop registered. Cannot add more workshops to an existing registration.');
      return;
    }
    
    // Allow only one workshop during registration update
    if (workshops.length > 1) {
      toast.error('Only one workshop is allowed for registration. Please remove one workshop from your cart.');
      return;
    }
  
    try {
      const response = await fetch(API_CONFIG.getUrl('registration/update'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kindeId: user.id,
          newEvents: items,
          newWorkshops: workshops
        })
      });
  
      const data = await response.json();
      
      if (data.success) {
        toast.success('Registration updated successfully!');
        // Clear cart after successful update
        dispatch(syncCart({ items: [], workshops: [], activeCombo: null }));
        navigate('/profile'); // Redirect to profile page
      } else {
        toast.error(data.error || 'Failed to update registration');
      }
    } catch (error) {
      console.error('Update registration error:', error);
      toast.error('Failed to update registration');
    }
  };

const getAvailableOptions = () => {
  if (!relevantPackage) return [];
  return relevantPackage.options;
};

  const handleClearCombo = async () => {
    if (!user?.id) return;

    try {
      await fetch(API_CONFIG.getUrl(`combo/clear/${user.id}`), {
        method: 'POST'
      });
      setSelectedCombo(null);
      toast.success('Package cleared');
    } catch (error) {
      console.error('Error clearing combo:', error);
      toast.error('Failed to clear package');
    }
  };

  const handleComboSelect = async (combo) => {
    if (!user?.id) {
      toast.error('Please log in to select a package');
      return;
    }
  
    if (!validateComboSelection(combo, items, workshops)) {
      return;
    }
  
    try {
      const response = await fetch(API_CONFIG.getUrl('combo/select'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kindeId: user.id,
          combo: {
            id: combo.id,
            name: combo.name,
            price: combo.price,
          }
        })
      });
  
      if (!response.ok) throw new Error('Failed to select combo');
  
      setSelectedCombo(combo);
      toast.success(`${combo.name} package selected!`);
    } catch (error) {
      console.error('Error selecting combo:', error);
      toast.error('Failed to select package');
    }
  };

  const removeItem = async (id, type) => {
    if (!user?.id) return;
  
    setLoading(true); // Show loading state
    
    try {
      const url = type === 'workshop' 
        ? API_CONFIG.getUrl(`cart/workshop/${user.id}/${id}`)
        : API_CONFIG.getUrl(`cart/${user.id}/${id}`);
  
      const response = await fetch(url, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
  
      if (!data.success) {
        throw new Error(data.error || 'Failed to remove item');
      }
  
      // After successful removal, fetch fresh cart data
      const cartResponse = await fetch(API_CONFIG.getUrl(`cart/${user.id}`));
      const cartData = await cartResponse.json();
      
      if (cartData.success && cartData.cart) {
        // Process events with complete data structure
        const processedEvents = (cartData.cart.events || []).map(event => ({
          ...event,
          eventInfo: {
            ...event.eventInfo,
            id: event.eventInfo?.id || event.id,
            title: event.eventInfo?.title || event.title,
            department: event.eventInfo?.department || event.department,
            tag: event.eventInfo?.tag || event.tag
          },
          fee: event.fee || 0,
          schedule: event.schedule || {},
          media: event.media || {}
        }));
  
        // Process workshops with complete data structure
        const processedWorkshops = (cartData.cart.workshops || []).map(workshop => ({
          ...workshop,
          id: workshop.id || workshop._id,
          title: workshop.title || '',
          departments: workshop.departments || [],
          price: workshop.price || 0,
          media: workshop.media || {},
          registration: workshop.registration || {},
          type: 'workshop'
        }));
  
        // Update Redux state with fresh data
        dispatch(syncCart({
          items: processedEvents,
          workshops: processedWorkshops,
          activeCombo: cartData.cart.activeCombo
        }));
  
        // Update combo if needed
        if (cartData.cart.activeCombo) {
          const packageType = isHostInstitution ? packages[0] : packages[1];
          const matchingCombo = packageType.options.find(opt => 
            opt.id === cartData.cart.activeCombo.id
          );
          setSelectedCombo(matchingCombo || cartData.cart.activeCombo);
        } else {
          setSelectedCombo(null);
        }
      }
  
      // Handle workshop-specific combo updates
      if (type === 'workshop' && selectedCombo?.name?.toLowerCase().includes('workshop')) {
        await handleClearCombo();
      }
  
      toast.success(`${type === 'workshop' ? 'Workshop' : 'Event'} removed from cart`);
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error("Failed to remove item");
    } finally {
      setLoading(false);
    }
  };

// Update the payment validation and include platform fee
const initiatePayment = async () => {
  if (!user?.id) {
    toast.error('Please log in to continue');
    return;
  }

  if (!selectedCombo) {
    toast.error('Please select a package to proceed');
    setShowComboDetails(true);
    return;
  }

  if (!validateComboSelection(selectedCombo, items, workshops)) {
    return;
  }

  try {
    const timestamp = Date.now();
    
    const response = await fetch(API_CONFIG.getUrl('payment/initiate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: totalAmount, // Use total amount including platform fee
        baseAmount: selectedCombo.price, // Original package price
        platformFee: platformFee, // Platform fee amount
        cartItems: items,
        workshops: workshops,
        kindeId: user.id,
        combo: selectedCombo,
        timestamp
      })
    });

    const data = await response.json();
    
    if (data.success) {
      // The session data structure should match what comes from the server
      setPaymentSession(data.registration); // Make sure this matches your backend response
      
      // Debug log to verify the data structure
      console.log('Payment Session Data:', data.registration);
    } else {
      toast.error(data.error || 'Payment initiation failed');
    }
  } catch (error) {
    console.error('Payment error:', error);
    toast.error('Failed to initiate payment');
  }
};

// Update the initial cart check
useEffect(() => {
  console.log('Cart Effect - User ID:', user?.id);
  if (user?.id) {
    fetchCart();
  }
}, [user]);

const validateComboSelection = (combo, items, workshops) => {
  // For single workshop package
  if (combo.name.toLowerCase().includes('single workshop')) {
    if (workshops.length === 0) {
      toast.error('Please add a workshop to select this package');
      return false;
    }
    if (workshops.length > 1) {
      // Allow up to 2 workshops in cart, but need to select one for package
      toast.error('Please select only one workshop for this package');
      return false;
    }
    if (items.length > 0) {
      toast.error('This package is for workshop only');
      return false;
    }
  }

  // For all events package
  if (combo.name.toLowerCase() === 'all events') {
    if (workshops.length > 0) {
      toast.error('This package does not include workshops');
      return false;
    }
  }

  // For combo package (all events + workshop)
  if (combo.name.toLowerCase().includes('all events + workshop')) {
    if (workshops.length === 0) {
      toast.error('Please add a workshop to select this package');
      return false;
    }
    if (workshops.length > 1) {
      toast.error('Please select only one workshop for this package');
      return false;
    }
  }

  return true;
};

// Update the empty cart check
const isCartEmpty = useSelector(state => {
  const items = state.cart.items;
  const workshops = state.cart.workshops;
  console.log('Cart State - Items:', items, 'Workshops:', workshops);
  return items.length === 0 && workshops.length === 0;
});

// Update your rendering condition
if (isCartEmpty && !loading) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A1B] to-[#1a1a3a] text-white p-4">
      <div className="max-w-7xl mx-auto pt-16">
        <div className="text-center py-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
            Your cart is empty
          </h2>
          <p className="text-gray-400 mb-6">Add some exciting events to get started!</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-2 md:px-8 md:py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-purple-500/25">
            <ArrowLeft size={20} />
            <span>Browse Events</span>
          </Link>
        </div>
      </div>
    </div>
  );
}


const CartItem = ({ item, type, onRemove }) => {
  const isWorkshop = type === 'workshop';
  
  // More robust property access with fallbacks
  const title = isWorkshop ? item?.title : item?.eventInfo?.title || 'Untitled';
  const departmentName = isWorkshop ? 
    item?.departments?.[0]?.name : 
    item?.eventInfo?.department?.name || 'General';
  const fee = isWorkshop ? item?.price : item?.fee || 0;
  const startTime = isWorkshop ? item?.registration?.startTime : item?.schedule?.startTime;
  const itemId = isWorkshop ? item?.id : item?.eventInfo?.id;
  const bannerImage = item?.media?.bannerDesktop || "/api/placeholder/400/300";

  if (!itemId) {
    console.warn('CartItem: Missing item ID', { item, type });
    return null;
  }

  return (
    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 hover:border-purple-500/50">
      <div className="flex gap-3">
        <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden">
          <img
            src={bannerImage}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-medium text-white line-clamp-1">
              {title}
            </h3>
            {departmentName && (
              <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                {departmentName}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-gray-400">
              {startTime && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(startTime).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold line-through text-purple-800">
                ₹{fee}
              </span>
              <button
                      onClick={() => onRemove(itemId, type)}
                      disabled={loading}
                      className={`p-1 text-red-400 hover:bg-red-400/10 rounded ${
                        loading ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                    >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// Package Selection Component
const PackageSelector = ({ packages, selectedCombo, onSelect, onClear, hasWorkshop }) => {
  return (
    <div className="space-y-4 px-2 pb-32 sm:px-4">
      {packages.map((combo) => (
        <div key={combo.id} 
             className={`p-4 rounded-lg border-2 transition-all ${
               selectedCombo?.id === combo.id 
                 ? 'border-purple-500 bg-purple-500/10' 
                 : 'border-slate-700'
             }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-base font-semibold text-white">{combo.name}</h4>
              <p className="text-lg font-bold text-purple-400 mt-1">₹{combo.price}</p>
            </div>
            
            <div className="flex items-center gap-2">
              {selectedCombo?.id === combo.id && (
                <button
                  onClick={() => onClear()}
                  className="px-3 py-1.5 text-sm rounded bg-red-500/20 text-red-400"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => onSelect(combo)}
                disabled={combo.name.toLowerCase().includes('workshop') && !hasWorkshop}
                className={`px-4 py-1.5 text-sm rounded-lg transition-all ${
                  selectedCombo?.id === combo.id
                    ? 'bg-purple-500 text-white'
                    : combo.name.toLowerCase().includes('workshop') && !hasWorkshop
                      ? 'bg-slate-600 text-gray-400 cursor-not-allowed'
                      : 'bg-slate-700 hover:bg-purple-500/50'
                }`}
              >
                {selectedCombo?.id === combo.id ? 'Selected' : 'Select'}
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="mt-3 text-xs text-gray-400">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {combo.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-purple-400" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
  
const BottomNav = ({ selectedCombo, platformFee, totalAmount, onPayment, onUpdateRegistration, hasExistingRegistration }) => {
  return (
    <div className="fixed bottom-0 inset-x-0 bg-slate-800/95 backdrop-blur-md border-t border-slate-700 p-3 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4">
            <Link 
              to="/"
              className="text-sm px-3 py-1.5 rounded bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Continue Shopping</span>
              <span className="sm:hidden">Back</span>
            </Link>
            
            {!hasExistingRegistration && selectedCombo && (
              <div className="text-right sm:text-left">
                <div className="flex flex-col">
                  <p className="text-xs text-gray-400">Package Price: <span className="text-purple-400 font-medium">₹{selectedCombo.price}</span></p>
                  <p className="text-xs text-gray-400">Platform Fee (2%): <span className="text-purple-400 font-medium">₹{platformFee}</span></p>
                  <p className="text-sm font-bold text-purple-400">Total: ₹{totalAmount}</p>
                </div>
              </div>
            )}
            
            {!hasExistingRegistration && !selectedCombo && (
              <div className="text-right sm:text-left">
                <p className="text-xs text-gray-400">
                  Select Package
                </p>
                <p className="text-sm font-bold text-purple-400">
                  ₹0
                </p>
              </div>
            )}
          </div>

          {hasExistingRegistration ? (
            <button
              onClick={onUpdateRegistration}
              disabled={items.length === 0 && workshops.length === 0}
              className="w-full sm:w-auto px-6 py-2 rounded text-sm font-medium transition-all bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Registration
            </button>
          ) : (
            <button
              onClick={onPayment}
              disabled={!selectedCombo}
              className={`w-full sm:w-auto px-6 py-2 rounded text-sm font-medium transition-all ${
                selectedCombo 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500' 
                  : 'bg-slate-700 cursor-not-allowed'
              }`}
            >
              {selectedCombo ? 'Proceed to Payment' : 'Select Package'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

  return (
    <div className="min-h-screen mt-16 bg-gradient-to-b from-[#0A0A1B] to-[#1a1a3a] text-white">
      {/* Header and Cart Items sections remain the same */}

      <div className="h-16 pt-16 md:pt-24 border-b border-slate-700/50">
                <div className="max-w-7xl mx-auto h-full px-4">
                    <div className="flex items-center justify-center h-full">
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                            Your Cart
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-2 md:px-4 pt-4 md:pt-8 pb-32">
    {/* Trust Badges */}
    <div className="flex justify-center gap-4 md:gap-8 mb-4 md:mb-8">
        <div className="flex items-center gap-1 md:gap-2 text-purple-400">
            <Shield size={16} className="md:w-5 md:h-5" />
            <span className="text-xs md:text-sm">Secure Payment</span>
        </div>
        <div className="flex items-center gap-1 md:gap-2 text-purple-400">
            <Clock size={16} className="md:w-5 md:h-5" />
            <span className="text-xs md:text-sm">Instant Registration</span>
        </div>
    </div>

    {/* Cart Items */}
    <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-2 md:gap-4">
        {loading ? (
            <div className="col-span-full flex justify-center py-12">
                <div>Loading.....</div>
            </div>
        ) : (
            <>
                {/* Events */}
                {items.map(item => (
                    <CartItem 
                        key={item.eventInfo?.id}
                        item={item}
                        type="event"
                        onRemove={removeItem}
                    />
                ))}
                
                {/* Workshops */}
                {workshops.map(workshop => (
                    <CartItem 
                        key={workshop.id}
                        item={workshop}
                        type="workshop"
                        onRemove={removeItem}
                    />
                ))}

                {/* Empty state */}
                {!loading && items.length === 0 && workshops.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <p className="text-gray-400 text-lg">Your cart is empty</p>
                    </div>
                )}
            </>
        )}
    </div>
</div>
      
      {/* Combo Selection Section */}
      {!hasExistingRegistration && (
      <PackageSelector
        packages={getAvailableOptions()}
        selectedCombo={selectedCombo}
        onSelect={handleComboSelect}
        onClear={handleClearCombo}
        hasWorkshop={hasWorkshop}
      />
    )}


      {/* Cart Summary - Fixed at bottom */}
      <BottomNav
        selectedCombo={selectedCombo}
        platformFee={platformFee}
        totalAmount={totalAmount}
        onPayment={initiatePayment}
        onUpdateRegistration={handleUpdateRegistration}
        hasExistingRegistration={hasExistingRegistration}
      />
      {paymentSession && (
        <PaymentHandler 
          sessionData={paymentSession}
          onClose={() => setPaymentSession(null)}
        />
      )}
    </div>
  );
};

export default CartComponent;