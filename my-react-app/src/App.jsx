// implement lazy loads

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from "./Components/NavBar";
// Only lazy load routes that aren't immediately needed
const AdminDashboard = lazy(() => import('./Components/AdminComponents/AdminComponents.jsx'));
const UserProfile = lazy(() => import('./Components/UserProfile.jsx'));
import  DepartmentLayout from './Components/Departments/DepartmentLayout.jsx';
import { store } from './Redux/mainStore.js';
import { Provider } from 'react-redux';
// Eagerly load main page components for better initial load
import TechniverseHome from "./Components/HomePage";
import AboutPage from "./Components/About";
import DepartmentEvents from "./Components/DepartmentEvents";
import Footer from './Components/Footer.jsx';
import PaymentPage from './Components/PaymentPage.jsx';
import QRTesting from './Components/QrTesting.jsx';
// Department components can be lazy loaded
const Events = lazy(() => import('./Components/Departments/Events.jsx'));
const WorkshopDetails = lazy(() => import('./Components/Departments/WorkshopDetails.jsx'));
const EventDetails = lazy(() => import('./Components/Departments/EventDetails.jsx'));
const Workshops = lazy(() => import('./Components/Departments/Workshops.jsx'));
import EventValidation from './Components/EventValidation/EventValidation.jsx';
import TestValidation from './Components/EventValidation/TestValidation.jsx';
import CartComponent from './Components/Cart.jsx';
import SponsorScroll from './Components/SponsorsScroll.jsx';
import DepartmentForm from './Components/AdminComponents/DepartmentForm.jsx';
import EventsManager from './Components/AdminComponents/EventManager.jsx';
import WorkshopsManager from './Components/AdminComponents/WorkshopManager.jsx';

import { KindeProvider, useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { Toaster } from 'react-hot-toast';
import RegistrationForm from './Components/RegistrationForm.jsx';
import toast from 'react-hot-toast';
import UnauthorizedPage from './Components/unAuthorisedPage.jsx';
import PaymentHandler from './Components/AdminComponents/PaymentTest.jsx';
import ExportRegistrations from './Components/AdminComponents/exportRegistrations.jsx';
import NewsForm from './Components/AdminComponents/NewsFormComponent.jsx';
import MapEditor from './Components/AdminComponents/MapEditor';
import { PackageProvider } from './Components/utils/PackageContext.jsx';
import AdministrationPage from './Components/AdminstrationComponent.jsx';

// tanstack query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import IntroAnimation from './Components/AdminComponents/IntroAnimation.jsx';

// Simplified loading spinner
const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
    <div className="w-12 h-12 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent" />
  </div>
);

// Scroll restoration
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Main content with optimized background
const MainContent = () => (
  <div className="bg-slate-950">
    <div className="relative">
      {/* Single gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/50 to-slate-950" />
      
      <div className="relative">
        <TechniverseHome />
        <AboutPage />
        <SponsorScroll/>
        <Footer />
      </div>
    </div>
  </div>
);

// protected route
const RegisteredRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useKindeAuth();
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [checkingRegistration, setCheckingRegistration] = React.useState(true);
  const location = useLocation();
  const checkAttempted = React.useRef(false);

  // Debug states with more detail
  console.log('RegisteredRoute Render:', {
    isAuthenticated,
    isLoading,
    userId: user?.id,
    isRegistered,
    checkingRegistration,
    currentPath: location.pathname,
    checkAttempted: checkAttempted.current
  });

  React.useEffect(() => {
    let isMounted = true;

    const checkRegistration = async () => {
      // Prevent multiple checks
      if (checkAttempted.current) {
        console.log('Check already attempted, skipping');
        return;
      }

      console.log('Starting registration check:', {
        isAuthenticated,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });

      if (!isAuthenticated || !user?.id) {
        console.log('Skipping check - Auth Status:', {
          isAuthenticated,
          userId: user?.id,
          reason: !isAuthenticated ? 'Not authenticated' : 'No user ID'
        });
        if (isMounted) {
          setCheckingRegistration(false);
        }
        return;
      }

      try {
        console.log(`API Request to: http://localhost:4000/api/user/${user.id}`);
        const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/api/user/${user.id}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        });

        console.log('API Response:', {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Data Received:', {
          fullData: data,
          keys: Object.keys(data),
          dataType: typeof data
        });

        // More detailed existence check
        const userExists = Boolean(
          data && 
          (typeof data === 'object') && 
          !Array.isArray(data) && 
          Object.keys(data).length > 0
        );

        console.log('Registration Check Result:', {
          userExists,
          dataValidation: {
            isDefined: Boolean(data),
            isObject: typeof data === 'object',
            isNotArray: !Array.isArray(data),
            hasKeys: Object.keys(data).length > 0
          }
        });

        if (isMounted) {
          setIsRegistered(userExists);
          setCheckingRegistration(false);
          checkAttempted.current = true;

          if (!userExists) {
            console.warn('User data missing or invalid');
            toast.error('Please complete registration to continue');
          } else {
            console.log('Registration confirmed successfully');
          }
        }
      } catch (error) {
        console.error('Registration Check Error:', {
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });

        if (isMounted) {
          setIsRegistered(false);
          setCheckingRegistration(false);
          checkAttempted.current = true;
          toast.error(`Registration check failed: ${error.message}`);
        }
      }
    };

    // Only run check if authenticated and not already checked
    if (isAuthenticated && !checkAttempted.current) {
      checkRegistration();
    }

    return () => {
      isMounted = false;
    };
  }, [user?.id, isAuthenticated]);

  // State-based routing with detailed logging
  if (isLoading) {
    console.log('⏳ Loading state active');
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    console.log('🚫 Not authenticated - redirecting to home');
    return <Navigate to="/" />;
  }

  if (checkingRegistration) {
    console.log('🔄 Registration check in progress');
    return <LoadingSpinner />;
  }

  if (!isRegistered) {
    console.log('📝 Not registered - redirecting to register', {
      checkAttempted: checkAttempted.current,
      timestamp: new Date().toISOString()
    });
    return <Navigate to="/register" />;
  }

  console.log('✅ All checks passed - rendering protected content');
  return children;
};

// Enhanced ProtectedRoute with debugging
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useKindeAuth();
  const location = useLocation();

  console.log('ProtectedRoute State:', {
    isAuthenticated,
    isLoading,
    currentPath: location.pathname
  });

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('Showing authentication toast');
      if (location.pathname === '/cart') {
        toast.error('Please login first to access your cart');
      } else {
        toast.error('Please login first to access this page');
      }
    }
  }, [isAuthenticated, isLoading, location.pathname]);

  if (isLoading) return <LoadingSpinner />;
  return isAuthenticated ? children : <Navigate to="/" />;
};

// Enhanced RequireRole with debugging
const RequireRole = ({ children, allowedRoles }) => {
  const { isLoading, isAuthenticated, user } = useKindeAuth();

  console.log('RequireRole State:', {
    isLoading,
    isAuthenticated,
    userRoles: user?.roles,
    allowedRoles
  });

  if (isLoading) {
    console.log('Loading state');
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  const userRoles = user?.roles || [];
  const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));

  console.log('Role check:', {
    userRoles,
    hasRequiredRole
  });

  if (!hasRequiredRole) {
    console.log('Insufficient roles, redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('Role check passed, rendering children');
  return children;
};

// tanstack query
const queryClient = new QueryClient();




function App() {
  return (
    <QueryClientProvider client={queryClient}>
     <Provider store={store}>
      <KindeProvider
        clientId={import.meta.env.VITE_APP_KINDE_CLIENT_ID}
        domain={import.meta.env.VITE_APP_KINDE_ISSUER_URL}
        redirectUri={import.meta.env.VITE_APP_KINDE_REDIRECT_URL}
        logoutUri={import.meta.env.VITE_APP_KINDE_POST_LOGOUT_URL}
      >
        <PackageProvider>
        <div className="bg-slate-950 min-h-screen">
          <ScrollToTop />
          <Toaster 
            position="top-right" 
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '10px',
              },
            }} 
          />
          
          <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm">
            <Navbar />
          </div>

          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<MainContent />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              {/* Protected Routes that require authentication */}
              <Route path="/register" element={<ProtectedRoute><RegistrationForm /></ProtectedRoute>} />
              <Route path="/profile" element={<RegisteredRoute><UserProfile /></RegisteredRoute>} />
              <Route path="/cart" element={<RegisteredRoute><CartComponent /></RegisteredRoute>} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/intro" element={<IntroAnimation />} />
              <Route path="/administration" element={<AdministrationPage/>} />
              <Route path="/payment" element={<RegisteredRoute><PaymentHandler /></RegisteredRoute>} />
              <Route path="/registrations" element={<RegisteredRoute><ExportRegistrations /></RegisteredRoute>} />
              
              {/* Department and Events Routes */}
              <Route path="/departments" element={<DepartmentLayout />}>
                <Route path=":departmentId/events" element={<Events />} />
                <Route path=":departmentId/workshops" element={<Workshops />} />
                <Route path=":departmentId/events/:eventId" element={<EventDetails />} />
                <Route path=":departmentId/workshops/:workshopId" element={<WorkshopDetails />} />
              </Route>

              <Route path="/event-validation" element={<EventValidation />} />
              <Route path="/test-validation" element={<TestValidation />} />

              {/* Admin Dashboard Routes */}

              {/* removed Registered Route here ,you can add after converting to https */}
              <Route path="/adminDashboard" element={<AdminDashboard />}>
                <Route path="departments" element={<DepartmentForm />} />
                <Route path="events" element={<EventsManager />} />
                <Route path="news" element={<NewsForm />} />
                <Route path="maps" element={<MapEditor />} />
                <Route path="workshops" element={<WorkshopsManager />} />
              </Route>
            </Routes>
          </Suspense>
        </div>
        </PackageProvider>
      </KindeProvider>
      </Provider>
    </QueryClientProvider>
  );
}

export default App;