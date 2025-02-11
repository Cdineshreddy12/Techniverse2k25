import React, { useState, useEffect } from 'react';
import { 
    Trash2, ArrowLeft, Calendar, Users, Shield, 
    Clock, Star, ChevronDown, ChevronUp, CheckCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, clearCart } from '../Redux/cartSlice.js';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { useNavigate } from 'react-router-dom';
import API_CONFIG from '../config/api.js';
import { toast } from 'react-hot-toast';
import PaymentHandler from './PaymentPage.jsx';
import { addToCart } from '../Redux/cartSlice.js';
import { syncCart } from '../Redux/cartSlice.js';
// Combo packages data
const packages = [
  {
    id: 1,
    name: "RGUKT Exclusive",
    subtitle: "Welcome, proud members of RGUKT University",
    options: [
      {
        id: 'rgukt-all',
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
        id: 'rgukt-workshop',
        name: "All Events + Workshop",
        price: 299,
        features: [
          "All Events Package Benefits",
          "1 Workshop Registration",
          "Workshop Certificate",
          "Workshop Materials"
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
        id: 'guest-all',
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
        id: 'guest-workshop',
        name: "All Events + Workshop",
        price: 599,
        features: [
          "All Events Package Benefits",
          "1 Workshop Registration",
          "Workshop Certificate",
          "Workshop Materials"
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
  const cartItems = useSelector(state => state.cart.items);
  const isHostInstitution = user?.email?.toLowerCase().startsWith('s');
  const [hasWorkshop, setHasWorkshop] = useState(false);
  // Get relevant package based on user's institution
  const relevantPackage = isHostInstitution ? packages[0] : packages[1];

  // Cart items from Redux
const items = useSelector(state => state.cart.items);
const workshops = useSelector(state => state.cart.workshops);
const activeCombo = useSelector(state => state.cart.activeCombo);

  // Calculate original total (without combo)
const calculateOriginalTotal = () => {
  const eventsTotal = items.reduce((sum, item) => sum + (item.registration?.fee || 0), 0);
  const workshopsTotal = workshops.reduce((sum, item) => sum + (item.price || 0), 0);
  return eventsTotal + workshopsTotal;
};

// Calculate final total (with combo if selected)
const calculateFinalTotal = () => {
  if (activeCombo) {
    return activeCombo.price;
  }
  return calculateOriginalTotal();
};

  // Calculate savings
  const calculateSavings = () => {
    if (!selectedCombo) return 0;
    return calculateOriginalTotal() - selectedCombo.price;
  };

  const handleClearCombo = async () => {
    try {
      await fetch(API_CONFIG.getUrl(`combo/clear/${user.id}`), {
        method: 'POST'
      });
      setSelectedCombo(null);
    } catch (error) {
      console.error('Error clearing combo:', error);
    }
  };

   // Check if cart has workshop when cart items change
   useEffect(() => {
    const workshopPresent = cartItems.some(item => 
      item.eventInfo.tag.toLowerCase().includes('workshop')
    );
    setHasWorkshop(workshopPresent);

    // If workshop is removed and workshop combo is selected, clear selection
    if (!workshopPresent && selectedCombo?.name.toLowerCase().includes('workshop')) {
      handleClearCombo();
    }
  }, [cartItems]);

  useEffect(() => {
    if (user?.id) {
      fetchActiveCombo();
      fetchCart();
    }
  }, [user]);

  const fetchActiveCombo = async () => {
    try {
      const response = await fetch(API_CONFIG.getUrl(`combo/active/${user.id}`));
      const data = await response.json();
      
      if (data.combo) {
        // Find matching combo from packages
        const packageType = isHostInstitution ? packages[0] : packages[1];
        const matchingCombo = packageType.options.find(opt => opt.id === data.combo.id);
        if (matchingCombo) {
          setSelectedCombo(matchingCombo);
        }
      }
    } catch (error) {
      console.error('Error fetching active combo:', error);
    }
  };

  const validateComboSelection = () => {
    if (!selectedCombo) {
      toast.error('Please select a package to proceed');
      setShowComboDetails(true);
      return false;
    }

    if (selectedCombo.name.toLowerCase().includes('workshop') && !hasWorkshop) {
      toast.error('Your selected package includes workshop but no workshop in cart');
      return false;
    }

    return true;
  };

  const getAvailableOptions = () => {
    const options = relevantPackage.options.filter(option => {
      // If it's a workshop package, only show if cart has workshop
      if (option.name.toLowerCase().includes('workshop')) {
        return hasWorkshop;
      }
      return true;
    });
    return options;
  };

  // Handle combo selection
  const handleComboSelect = async (combo) => {
    if (combo.name.toLowerCase().includes('workshop') && !hasWorkshop) {
      toast.error('Please add a workshop to your cart first');
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

  const initiatePayment = async () => {
    if (!validateCart()) return;

    try {
      const response = await fetch(API_CONFIG.getUrl('payment/initiate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: calculateFinalTotal(),
          cartItems,
          kindeId: user.id,
          combo: {
            id: selectedCombo.id,
            name: selectedCombo.name,
            price: selectedCombo.price
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setPaymentSession(data.sessionData);
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

  const fetchCart = async () => {
    try {
      setLoading(true);
      const url = API_CONFIG.getUrl(`cart/${user.id}`);
      console.log('Fetching cart from:', url);
  
      const response = await fetch(url);
      const data = await response.json();
      console.log('Cart API Response:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch cart');
      }
  
      // Check if data.cart exists
      if (data.cart) {
        console.log('Processing cart data:', data.cart);
  
        // Process events
        const processedEvents = data.cart.events.map(event => ({
          ...event,
          fee: event.fee || 0
        }));
        console.log('Processed events:', processedEvents);
  
        // Process workshops if they exist
        const processedWorkshops = data.cart.workshops || [];
        console.log('Processed workshops:', processedWorkshops);
  
        // Sync cart data with Redux store
        dispatch(syncCart({
          items: processedEvents,
          workshops: processedWorkshops,
          activeCombo: data.cart.activeCombo || null
        }));
  
        // Update combo if exists
        if (data.cart.activeCombo) {
          const packageType = isHostInstitution ? packages[0] : packages[1];
          const matchingCombo = packageType.options.find(opt => opt.id === data.cart.activeCombo.id);
          setSelectedCombo(matchingCombo || data.cart.activeCombo);
        }
  
        // Update workshop presence
        const hasWorkshopItem = processedEvents.some(item => 
          item.eventInfo?.tag?.toLowerCase().includes('workshop')
        ) || processedWorkshops.length > 0;
        
        setHasWorkshop(hasWorkshopItem);
      } else {
        console.log('No cart data found, clearing state');
        dispatch(syncCart({
          items: [],
          workshops: [],
          activeCombo: null
        }));
        setSelectedCombo(null);
        setHasWorkshop(false);
      }
  
    } catch (error) {
      console.error('Cart fetch error details:', error);
      toast.error(error.message || "Failed to fetch cart items");
    } finally {
      setLoading(false);
    }
  };
  
  
  

  const removeItem = async (id, type) => {
    try {
      const url = type === 'workshop' 
        ? API_CONFIG.getUrl(`cart/workshop/${user.id}/${id}`)
        : API_CONFIG.getUrl(`cart/${user.id}/${id}`);
  
      const response = await fetch(url, { 
        method: 'DELETE'
      });
  
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to remove item');
      }
  
      // Remove from Redux store
      dispatch(removeFromCart({ id, type }));
      
      // Refresh cart data
      fetchCart();
      
      toast.success(`${type === 'workshop' ? 'Workshop' : 'Event'} removed from cart`);
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error(error.message || "Failed to remove item");
      // Refresh cart to ensure consistency
      fetchCart();
    }
  };
  
  


  const validateCart = () => {
    if (!selectedCombo) {
      toast.error('Please select a package to proceed');
      setShowComboDetails(true);
      return false;
    }
  
    // Check if cart has workshop
    const hasWorkshop = cartItems.some(item => 
      item.type === 'workshop' || 
      (item.eventInfo?.tag && item.eventInfo.tag.toLowerCase().includes('workshop'))
    );
  
    if (selectedCombo.name.toLowerCase().includes('workshop') && !hasWorkshop) {
      toast.error('Your selected package includes workshop but no workshop in cart');
      return false;
    }
  
    return true;
  };


  // Also update the check for empty cart to include both items and workshops
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


  const renderCartItem = (item, type = 'event') => {
    if (!item) return null;
  
    const isWorkshop = type === 'workshop';
    const title = isWorkshop ? item.title : item.eventInfo?.title;
    const departmentName = isWorkshop ? 
      item.departments?.[0]?.name : 
      item.eventInfo?.department?.name;
    const fee = isWorkshop ? item.price : item.fee;
    const startTime = isWorkshop ? 
      item.registration?.startTime : 
      item.schedule?.startTime;
  
    // Skip rendering if essential data is missing
    if (!title || !item.id) return null;
  
    return (
      <div
        key={item.id}
        onClick={() => navigate(isWorkshop 
          ? `/workshops/${item.id}`
          : `/departments/${item.eventInfo?.department?.id}/events/${item.id}`
        )}
        className="group bg-slate-800/50 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-4 border border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer"
      >
        <div className="flex gap-2 md:gap-4">
          {/* Image */}
          <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden">
            <img
              src={item.media?.bannerDesktop || "/api/placeholder/400/300"}
              alt={title}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
            />
          </div>
  
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between gap-2">
              <div className="space-y-1">
                <h3 className="text-sm md:text-base font-semibold truncate group-hover:text-purple-400 transition-colors">
                  {title}
                </h3>
                {departmentName && (
                  <p className="text-xs md:text-sm text-gray-400 truncate">
                    {departmentName}
                  </p>
                )}
  
                {/* Item Details */}
                <div className="flex flex-col md:flex-row gap-1 md:gap-4 text-xs md:text-sm">
                  {startTime && (
                    <div className="flex items-center gap-1 text-gray-300">
                      <Calendar size={12} className="md:w-4 md:h-4 text-purple-400" />
                      <span>{new Date(startTime).toLocaleDateString()}</span>
                    </div>
                  )}
                  {!isWorkshop && item.registration?.type && (
                    <div className="flex items-center gap-1 text-gray-300">
                      <Users size={12} className="md:w-4 md:h-4 text-purple-400" />
                      <span>
                        {item.registration.type === 'team' 
                          ? `Team (${item.registration.maxTeamSize} max)` 
                          : 'Individual'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
  
              {/* Price and Actions */}
              <div className="flex flex-col items-end justify-between">
                <p className="text-base md:text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                  ₹{fee || 0}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item.id, type);
                  }}
                  className="p-1 md:p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all duration-300"
                >
                  <Trash2 size={16} className="md:w-5 md:h-5" />
                </button>
              </div>
            </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
                      {loading ? (
                        <div className="col-span-full flex justify-center py-12">
                            <div>Loading.....</div>
                        </div>
                      ) : (
                        <>
                          {/* Debug info */}
                          {/* {process.env.NODE_ENV === 'development' && (
                            <div className="col-span-full mb-4 p-4 bg-slate-800 rounded-lg">
                              <pre className="text-xs text-slate-400">
                                {JSON.stringify({ items, workshops, activeCombo }, null, 2)}
                              </pre>
                            </div>
                          )} */}

                          {/* Events */}
                          {items.map(item => (
                            <div key={item.id}>
                              {renderCartItem(item, 'event')}
                            </div>
                          ))}
                          
                          {/* Workshops */}
                          {workshops.map(item => (
                            <div key={item.id}>
                              {renderCartItem(item, 'workshop')}
                            </div>
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
      <div className="max-w-7xl mx-auto px-4 pb-24">
        <div className="bg-slate-800/50 rounded-xl p-4 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-purple-400">Select Your Package</h3>
              <p className="text-sm text-gray-400">
                {hasWorkshop ? 
                  "Workshop detected in cart - all packages available" : 
                  "Add a workshop to unlock workshop packages"}
              </p>
            </div>
            <button 
              onClick={() => setShowComboDetails(!showComboDetails)}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-all"
            >
              {showComboDetails ? <ChevronUp /> : <ChevronDown />}
            </button>
          </div>
          
          {/* Existing combo options rendering with updated selection handling */}
          {showComboDetails && (
            <div className="mt-4 space-y-4">
              {getAvailableOptions().map((combo) => (
                <div key={combo.id} 
                     className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                       selectedCombo?.id === combo.id 
                         ? 'border-purple-500 bg-purple-500/10' 
                         : 'border-slate-700 hover:border-purple-400'
                     }`}>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h4 className="text-lg font-bold">{combo.name}</h4>
                      <p className="text-2xl font-bold text-purple-400">₹{combo.price}</p>
                    </div>
                    <div className="flex gap-2">
                      {selectedCombo?.id === combo.id && (
                        <button
                          onClick={handleClearCombo}
                          className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                        >
                          Clear
                        </button>
                      )}
                      <button
                        onClick={() => handleComboSelect(combo)}
                        className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                          selectedCombo?.id === combo.id
                            ? 'bg-purple-500 text-white'
                            : combo.name.toLowerCase().includes('workshop') && !hasWorkshop
                              ? 'bg-slate-600 text-gray-400 cursor-not-allowed'
                              : 'bg-slate-700 hover:bg-purple-500/50'
                        }`}
                        disabled={combo.name.toLowerCase().includes('workshop') && !hasWorkshop}
                      >
                        {selectedCombo?.id === combo.id ? (
                          <span className="flex items-center gap-2">
                            <CheckCircle size={16} />
                            Selected
                          </span>
                        ) : combo.name.toLowerCase().includes('workshop') && !hasWorkshop ?
                          'Add Workshop First' : 'Select Package'}
                      </button>
                    </div>
                  </div>
                  {/* Existing features list */}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>  

      {/* Cart Summary - Fixed at bottom */}
      <div className="fixed bottom-0 inset-x-0 bg-slate-800/95 backdrop-blur-md border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 hover:border-purple-500/50 transition-all duration-300">
                <ArrowLeft size={16} />
                <span>Continue Shopping</span>
              </Link>
              <div>
                {selectedCombo ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-400">Original Price:</p>
                      <p className="text-sm line-through text-gray-500">₹{calculateOriginalTotal()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-400">Package Price:</p>
                      <p className="text-xl font-bold text-purple-400">₹{calculateFinalTotal()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-green-400">You Save:</p>
                      <p className="text-sm font-bold text-green-400">₹{calculateSavings()}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-400">Total Amount</p>
                    <p className="text-xl font-bold text-purple-400">₹{calculateFinalTotal()}</p>
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={initiatePayment}
              className="w-full md:w-auto px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 font-medium shadow-lg hover:shadow-purple-500/25 transform hover:scale-105"
            >
              {selectedCombo ? 'Proceed to Payment' : 'Select Package to Continue'}
            </button>
          </div>
        </div>
      </div>

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