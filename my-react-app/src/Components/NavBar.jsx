import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Menu, X, Home, Info, Clock, Users2, 
  Sparkles, ShoppingCart, LogOut, LogIn, User, Stars,Newspaper,
  BadgeCheckIcon,
  TableColumnsSplit,
  TimerIcon,
  LucideAlignEndVertical,
  BotIcon
} from 'lucide-react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Logo from './Logo';
import {createApiClient} from '../config/kindeAPI'
const Navbar = ({ onScrollToSection }) => {

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const drawerRef = useRef(null);

  const { isLoading, isAuthenticated, user, login, logout } = useKindeAuth();
  const { items, total } = useSelector(state => state.cart);
  const [userData, setUserData] = useState(null);
  const api = createApiClient();
  const navigate = useNavigate();
  const userDataFetchRef = useRef(false);
   // Add this useEffect for fetching user data
   useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated && user?.id && !userDataFetchRef.current) {
        userDataFetchRef.current = true;
        try {
          const data = await api.getUser(user.id);
          
          if (data.needsRegistration) {
            navigate('/register');
            return;
          }
          
          if (data.success && data.user) {
            setUserData(data.user);
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          if (error.message === 'Authentication failed') {
            return;
          }
          navigate('/register');
        } finally {
          userDataFetchRef.current = false;
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated, user?.id]);


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
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

  // Desktop navigation items (without Devs)
  const desktopNavigationItems = [
    { title: 'Home', icon: <Home className="w-4 h-4" />, path: '/' },
    { title: 'Administration', icon: <Users2 className="w-4 h-4" />, path: '/administration' },
    { title: 'Events', icon: <BotIcon className="w-4 h-4" />, path: '/departments' },
    { title: 'Timeline', icon: <TimerIcon className="w-4 h-4" />, path: '/timeline' },
    { title: 'News', icon: <Newspaper className="w-4 h-4" />, path: '/news' },
    { title: 'Teams', icon: <TableColumnsSplit className="w-4 h-4" />, path: '/teams' },
    { title: 'Offline', icon: <LogIn className="w-4 h-4" />, path: '/offlineLogin' }
  ];

  // Mobile navigation items (includes Devs)
  const mobileNavigationItems = [
    { title: 'Home', icon: <Home className="w-4 h-4" />, path: '/' },
    { title: 'Administration', icon: <Users2 className="w-4 h-4" />, path: '/administration' },
    { title: 'Events', icon: <BotIcon className="w-4 h-4" />, path: '/departments' },
    { title: 'Timeline', icon: <TimerIcon className="w-4 h-4" />, path: '/timeline' },
    { title: 'News', icon: <Newspaper className="w-4 h-4" />, path: '/news' },
    { title: 'Sponsors', icon: <BadgeCheckIcon className="w-4 h-4" />, path: '/sponsors' },
    { title: 'Teams', icon: <TableColumnsSplit className="w-4 h-4" />, path: '/teams' },
    { title: 'Devs', icon: <Users2 className="w-4 h-4" />, path: '/developers' },
    { title: 'Offline', icon: <LogIn className="w-4 h-4" />, path: '/offlineLogin' }
  ];

  const MobileMenuItem = ({ item, onClick }) => (
    <Link
      to={item.path}
      onClick={onClick}
      className="w-full flex items-center space-x-3 px-6 py-4 hover:bg-white/10 transition-colors group"
    >
      <span className="text-sky-400 group-hover:scale-110 transition-transform duration-200">
        {item.icon}
      </span>
      <span className="text-white font-medium">{item.title}</span>
    </Link>
  );

  const MobileAuthButtons = () => (
    <div className="px-6 py-4 border-t border-white/10">
      {isAuthenticated ? (
        <div className="space-y-3">
          <Link 
            to="/profile"
            className="w-full flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
            onClick={() => setIsOpen(false)}
          >
            <User size={16} className="text-sky-400 group-hover:scale-110 transition-transform duration-200" />
            <span className="text-white font-medium">
              {userData?.name || user?.given_name || 'User'}
            </span>
          </Link>
          <button 
            onClick={() => {
              logout();
              setUserData(null);
              setIsOpen(false);
            }}
            className="w-full flex items-center space-x-3 p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 group"
          >
            <LogOut size={16} className="group-hover:scale-110 transition-transform duration-200" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      ) : (
        <button 
          onClick={() => {
          
            login();
            setIsOpen(false);
          }}
          className="w-full flex items-center space-x-3 p-3 rounded-lg bg-sky-500/40 hover:bg-sky-500/20 text-sky-400 group"
        >
          <LogIn size={16} className="group-hover:scale-110 transition-transform duration-200" />
          <span className="font-medium">Login</span>
        </button>
      )}
    </div>
  );


    // Modify your AuthButtons component to use userData
    const AuthButtons = () => (
      <div className="flex items-center ml-4 pl-4 border-l border-white/10">
        {isAuthenticated ? (
          <>
            <Link 
              to="/profile"
              className="flex items-center space-x-2 text-white hover:text-sky-400 transition-colors group"
            >
              <User size={16} className="group-hover:animate-bounce-x" />
              <span className="font-medium">
                {userData?.name || user?.given_name || 'User'}
              </span>
            </Link>
            <button 
              onClick={() => {
                logout();
                setUserData(null); // Clear user data on logout
              }}
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
          <div className="flex items-center  group cursor-pointer" onClick={() => onScrollToSection('home')}>
            <div className="flex ml-[-50px] ">
              <Logo />
            </div>
          </div>

          <div className="lg:hidden flex items-center">
            <Link 
              to="/cart"
              className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors group"
            >
              <ShoppingCart size={20} className="group-hover:animate-bounce-x" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
            <button
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              onClick={() => setIsOpen(true)}
            >
              <Menu size={20} className="hover:animate-pulse-subtle" />
            </button>
          </div>

          <div className="hidden lg:flex items-center ">
            {desktopNavigationItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center space-x-1 group"
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

            <AuthButtons />
          </div>
        </div>
      </div>

      {/* Mobile Menu with Animation */}
      <div 
        className={`fixed inset-0 bg-black backdrop-blur-sm transition-opacity duration-400 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsOpen(false)}
      >
        <div
          ref={drawerRef}
          className={`fixed top-0 right-0 w-80 h-full bg-black shadow-xl transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-6 border-b border-white/10 bg-slate-900">
            <div className="flex items-center space-x-3">
              
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full bg-white/30 hover:bg-white/10 text-gray-200 hover:text-white transition-colors group"
            >
              <X size={24} className="group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>
          
          <div className="py-4 bg-black ">
            {mobileNavigationItems.map((item, index) => (
              <MobileMenuItem 
                key={index} 
                item={item} 
                onClick={() => setIsOpen(false)}
              />
            ))}
            
            <Link
              to="/cart"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center space-x-3 px-6 py-4 hover:bg-white/10 transition-colors group"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform duration-200" />
                {items.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </div>
              <span className="text-white font-medium">Cart</span>
            </Link>

            <MobileAuthButtons />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;