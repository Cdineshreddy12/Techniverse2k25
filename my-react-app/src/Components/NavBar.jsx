import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Menu, X, Home, Info, Clock, Users2, 
  Sparkles, ShoppingCart, LogOut, LogIn, User, Stars
} from 'lucide-react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Logo from './Logo';

const Navbar = ({ onScrollToSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  const { isLoading, isAuthenticated, user, login, logout } = useKindeAuth();
  const { items, total } = useSelector(state => state.cart);

  const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigationItems = [
    { title: 'Home', icon: <Home className="w-4 h-4" />, path: '/' },
    { title: 'About', icon: <Info className="w-4 h-4" />, path: '/about' },
    { title: 'Administration', icon: <Users2 className="w-4 h-4" />, path: '/administration' }
  ];



  const ShimmeringText = () => (
    <div className="relative group">
      <div className="relative flex items-center  overflow-hidden">
        {/* Main text container */}
        <div className="relative">
          <div className="text-2xl pt-2 pr-2 font-bold relative overflow-hidden italic">
            {/* Main text with enhanced T and V */}
            <span className="relative inline-block">
              {/* T with larger size */}
              <span className="inline-block text-[3rem] md:text-[4rem] font-bold text-cyan-400 transform hover:scale-110 transition-transform">
                T
              </span>
              <span className=" text-white md:text-[3rem] font-bold">
                echni
              </span>
            </span>
            
            <span className="relative inline-block">
              {/* V with larger size */}
              <span className="inline-block text-[3rem] md:text-[4rem]  font-bold text-purple-400 transform hover:scale-110 transition-transform">
                V
              </span>
              <span className="font-bold md:text-[3rem] text-white">
                erse
              </span>
            </span>
            
            {/* Primary shimmer */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20 absolute animate-shimmer" />
            </div>
            
            {/* Secondary shimmer */}
            <div className="absolute top-0 left-[-100%] w-full h-full">
              <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20 absolute animate-flash" />
            </div>
            
            {/* Hover underline effect */}
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
          </div>
        </div>
      </div>
      
      {/* Hover glow effect */}
      <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-blue-500/20 blur-xl animate-pulse-glow" />
      </div>
    </div>
  );
  

  const MobileMenuItem = ({ item }) => (
    <button
      onClick={() => {
        onScrollToSection(item.scrollTo);
        setIsOpen(false);
      }}
      className="w-full flex items-center space-x-3 px-6 py-4 hover:bg-white/10 transition-colors"
    >
      <span className="text-sky-400">{item.icon}</span>
      <span className="text-white font-medium">{item.title}</span>
    </button>
  );

// auth buttons
const AuthButtons = () => (
  <div className="flex items-center ml-4 pl-4 border-l border-white/10">
    {isAuthenticated ? (
      <>
        <Link 
          to="/profile"
          className="flex items-center space-x-2 text-white hover:text-sky-400 transition-colors group"
        >
          <User size={16} className="group-hover:animate-bounce-x" />
          <span className="font-medium">{user?.given_name || 'User'}</span>
        </Link>
        <button 
          onClick={logout}
          className="ml-4 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 group"
        >
          <LogOut size={16} className="group-hover:animate-bounce-x" />
          <span>Logout</span>
        </button>
      </>
    ) : (
      <button 
        onClick={login}
        className="ml-4 px-4 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 group"
      >
        <LogIn size={16} className="group-hover:animate-bounce-x" />
        <span>Login</span>
      </button>
    )}
  </div>
);


  return (
    <nav 
      ref={menuRef}
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'py-3 bg-black backdrop-blur-2xl border-b border-white/5' : 'py-5 bg-black'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo and Brand Section */}
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => onScrollToSection('home')}>
            <div className="flex ml-[-40px]">
              <Logo />
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center space-x-3">
            <Link 
              to="/cart"
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors group"
            >
              <ShoppingCart size={20} className="group-hover:animate-bounce-x" />
            </Link>
            <button
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              onClick={() => setIsOpen(true)}
            >
              <Menu size={20} className="hover:animate-pulse-subtle" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
          {navigationItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center space-x-2 group"
              >
                <span className="group-hover:animate-bounce-x">{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            ))}

          <Link 
            to="/cart"
            className="relative px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center space-x-2 group"
          >
            <div className="relative">
              <ShoppingCart className="w-4 h-4 group-hover:animate-bounce-x" />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </div>
            <span>Cart</span>
          </Link>



           <div>
                 <AuthButtons />
           </div>
            
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden fixed top-0 inset-0 bg-slate-900 z-50">
          <div className="flex justify-between items-center p-6 border-b border-white/10 bg-slate-800">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className='flex ml-[-50px]'>
                    <Logo />
                      <div className='left-[100px] top-2'>
                        <ShimmeringText />  
                      </div>
                </div>
                
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} className="hover:animate-pulse-subtle" />
            </button>
          </div>
          
          <div className="bg-slate-900">
            {navigationItems.map((item, index) => (
              <MobileMenuItem key={index} item={item} />
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;