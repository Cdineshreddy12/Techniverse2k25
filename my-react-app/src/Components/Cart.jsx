import React from 'react';
import { 
    Trash2, 
    ArrowLeft,
    Calendar,
    Users,
    Shield,
    Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, clearCart } from '../Redux/cartSlice.js';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { useNavigate } from 'react-router-dom';
import { useState,useEffect } from 'react';
import API_CONFIG from '../config/api.js';
import { addToCart } from '../Redux/cartSlice.js';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PaymentHandler from './PaymentPage.jsx';
  
const CartComponent = () => {
  const { user } = useKindeAuth();
  const [paymentSession, setPaymentSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cartItems = useSelector(state => state.cart.items);

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const initiatePayment = async () => {
    try {
      const response = await fetch(API_CONFIG.getUrl('payment/initiate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: calculateTotal(),
          cartItems,
          kindeId: user.id
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


  useEffect(() => {
    if (user?.id) {
      fetchCart();
    }
  }, [user])

  const fetchCart = async () => {
    try {
      setLoading(true);
      const url=API_CONFIG.getUrl(`cart/${user.id}`)
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
  
      // Ensure we have a valid cart array
      const validCart = Array.isArray(data.cart) ? data.cart : [];
      
      // Update Redux store
      dispatch(clearCart());
      validCart.forEach(item => {
        if (item && item.id) { // Only add valid items
          dispatch(addToCart(item));
        }
      });
  
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error("Failed to fetch cart..");
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
        const url=API_CONFIG.getUrl(`cart/${user.id}/${itemId}`)
      await fetch(url, { 
        method: 'DELETE'
      });
      
      // Remove from Redux immediately for instant UI update
      dispatch(removeFromCart(itemId));
      
      // Verify backend state
      fetchCart();
      
      toast.success("Item removed from cart");
    } catch (error) {
      // If backend fails, refresh cart to ensure consistency
      fetchCart();
      toast.error("Failed to remove item");
    }
  };


  const calculateTotal = () => {
      return cartItems.reduce((sum, item) => sum + item.registration.fee, 0);
  };

  const handlePaymentSuccess = () => {
    // Clear cart and show success message
    dispatch(clearCart());
    toast.success('Payment successful!');
    navigate('/dashboard/registrations');
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
  

  if (loading) {
      return <CyberpunkSpinner />;
  }

  if (cartItems.length === 0) {
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



    return (
        <div className="min-h-screen mt-16 bg-gradient-to-b from-[#0A0A1B] to-[#1a1a3a] text-white">
            {/* Header */}
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
                    {cartItems.map(item => (
                        <div
                        key={item.eventInfo.id}
                        onClick={() => navigate(`/departments/${item.eventInfo.department.id}/events/${item.eventInfo.id}`)}
                        className="group bg-slate-800/50 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-4 border border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer"
                       >
                            <div className="flex gap-2 md:gap-4">
                                {/* Image */}
                                <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden">
                                    <img
                                        src={item.media.bannerDesktop || "/api/placeholder/400/300"}
                                        alt={item.eventInfo.title}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between gap-2">
                                        <div className="space-y-1">
                                            <h3 className="text-sm md:text-base font-semibold truncate group-hover:text-purple-400 transition-colors">
                                                {item.eventInfo.title}
                                            </h3>
                                            <p className="text-xs md:text-sm text-gray-400 truncate">
                                                {item.eventInfo.department.name}
                                            </p>

                                            {/* Event Details */}
                                            <div className="flex flex-col md:flex-row gap-1 md:gap-4 text-xs md:text-sm">
                                                <div className="flex items-center gap-1 text-gray-300">
                                                    <Calendar size={12} className="md:w-4 md:h-4 text-purple-400" />
                                                    <span>{new Date(item.schedule.startTime).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-300">
                                                    <Users size={12} className="md:w-4 md:h-4 text-purple-400" />
                                                    <span>
                                                        {item.registration.type === 'team' 
                                                            ? `Team (${item.registration.maxTeamSize} max)` 
                                                            : 'Individual'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Price and Actions */}
                                        <div className="flex flex-col items-end justify-between">
                                            <p className="text-base md:text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                                                ₹{item.registration.fee}
                                            </p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent event from bubbling up
                                                    removeItem(item.id); // Use item.id instead of item.eventInfo.id
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
                    ))}
                </div>

                {paymentSession && (
                    <PaymentHandler 
                      sessionData={paymentSession}
                      onClose={() => setPaymentSession(false)}
                    />
                  )}


                {/* Cart Summary - Fixed at bottom */}
                <div className="fixed bottom-0 inset-x-0 bg-slate-800/95 backdrop-blur-md border-t border-slate-700">
                    <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
                        <div className="flex flex-row md:flex-row md:items-center justify-between gap-3 md:gap-4">
                            <div className="flex flex-row md:flex-row md:items-center gap-3 md:gap-6">
                                <Link
                                    to="/"
                                    className="flex items-center justify-center md:justify-start gap-2 px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 hover:border-purple-500/50 transition-all duration-300 text-sm md:text-base"
                                >
                                    <ArrowLeft size={16} />
                                    <span>Continue Shopping</span>
                                </Link>
                                <div className="text-center md:text-left">
                                    <p className="text-xs md:text-sm text-gray-400">Total Amount</p>
                                    <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                                        ₹{calculateTotal()}
                                    </p>
                                </div>
                            </div>
                            <button 
                              onClick={initiatePayment}
                              className="w-full md:w-auto px-6 md:px-8 py-2 md:py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 font-medium shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 text-sm md:text-base"
                            >
                              Proceed to Payment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartComponent;