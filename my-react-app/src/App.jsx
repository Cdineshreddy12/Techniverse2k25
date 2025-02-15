import React, { Suspense, lazy } from 'react';
import {  Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { store } from './Redux/mainStore.js';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { KindeProvider, useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { PackageProvider } from './Components/utils/PackageContext.jsx';
import { useEffect } from 'react';
// Immediately needed components
import Navbar from "./Components/NavBar";
import Footer from './Components/Footer.jsx';
import UnauthorizedPage from './Components/unAuthorisedPage.jsx';
import NewsDetail from './Components/NewsDetail.jsx';
import NewsList from './Components/NewsList.jsx';
import { createApiClient } from './config/kindeAPI.js';
import { AuthProvider } from '../src/contexts/AuthContext.jsx';
import { useAuth } from '../src/contexts/AuthContext.jsx';
import PaymentVerify from './Components/paymentVerify.jsx';
import ValidationPage from './Components/offlineValidation.jsx';
import ReceiptPage from './Components/OfflineReceipt.jsx';
// Lazy load components based on route priority
const TechniverseHome = lazy(() => import("./Components/HomePage"));
const AboutPage = lazy(() => import("./Components/About"));
const SponsorScroll = lazy(() => import('./Components/SponsorsScroll.jsx'));

// Admin and dashboard components (load when needed)
const AdminDashboard = lazy(() => import('./Components/AdminComponents/AdminComponents.jsx'));
const DepartmentForm = lazy(() => import('./Components/AdminComponents/DepartmentForm.jsx'));
const EventsManager = lazy(() => import('./Components/AdminComponents/EventManager.jsx'));
const WorkshopsManager = lazy(() => import('./Components/AdminComponents/WorkshopManager.jsx'));

// User related components
const UserProfile = lazy(() => import('./Components/UserProfile.jsx'));
const RegistrationForm = lazy(() => import('./Components/RegistrationForm.jsx'));
const CartComponent = lazy(() => import('./Components/Cart.jsx'));

// Department related components
const DepartmentLayout = lazy(() => import('./Components/Departments/DepartmentLayout.jsx'));
const Events = lazy(() => import('./Components/Departments/Events.jsx'));
const Workshops = lazy(() => import('./Components/Departments/Workshops.jsx'));
const EventDetails = lazy(() => import('./Components/Departments/EventDetails.jsx'));
const WorkshopDetails = lazy(() => import('./Components/Departments/WorkshopDetails.jsx'));

// Other components
const EventValidation = lazy(() => import('./Components/EventValidation/EventValidation.jsx'));
const TestValidation = lazy(() => import('./Components/EventValidation/TestValidation.jsx'));
const PaymentHandler = lazy(() => import('./Components/AdminComponents/PaymentTest.jsx'));
const ExportRegistrations = lazy(() => import('./Components/AdminComponents/exportRegistrations.jsx'));
const NewsForm = lazy(() => import('./Components/AdminComponents/NewsFormComponent.jsx'));
const AdministrationPage = lazy(() => import('./Components/AdminstrationComponent.jsx'));
const IntroAnimation = lazy(() => import('./Components/AdminComponents/IntroAnimation.jsx'));
import PaymentFailure from './Components/paymentFailure.jsx';
import PaymentSuccess from './Components/paymentSuccess.jsx';
import TeamShowcase from './Components/TeamShowCase.jsx';
import ManualRegistration from './Components/offlineRegistrationPage.jsx';
// Optimized loading spinner
const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center">
    <div className="w-10 h-10 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent" />
  </div>
);

// Optimized scroll restoration
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    const timeoutId = setTimeout(() => window.scrollTo(0, 0), 0);
    return () => clearTimeout(timeoutId);
  }, [pathname]);
  return null;
};

// Main content with optimized rendering
const MainContent = React.memo(() => (
  <div className="bg-slate-950">
    <div className="relative">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/50 to-slate-950" />
      <div className="relative">
        <Suspense fallback={<LoadingSpinner />}>
          <TechniverseHome />
          <AboutPage />
          {/* <SponsorScroll /> */}
          <Footer />
        </Suspense>
      </div>
    </div>
  </div>
));

// Enhanced error boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
          <div className="text-center p-8 bg-slate-800 rounded-lg shadow-xl">
            <h2 className="text-xl text-red-400 mb-4">Something went wrong</h2>
            <button 
              className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}


const ProtectedRoute = React.memo(({ children, requireRegistration = false }) => {
  const { isAuthenticated, isLoading: kindeLoading } = useKindeAuth();
  const { 
    isRegistered, 
    isLoading: authLoading, 
    registrationChecked,
    isAdmin 
  } = useAuth();
  const location = useLocation();

  const isLoading = kindeLoading || authLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Skip registration check for admins
  if (isAdmin) {
    return children;
  }

  // Only check registration if explicitly required
  if (requireRegistration && !isRegistered && registrationChecked) {
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  return children;
});

const AdminRoute = React.memo(({ children }) => {
  const { isAuthenticated, isLoading: kindeLoading } = useKindeAuth();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const location = useLocation();

  const isLoading = kindeLoading || authLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    toast.error('Please login to continue');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    toast.error('Access denied. Admin privileges required.');
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
});

// Optimized protected routes
const RegisteredRoute = React.memo(({ children }) => {
  const { isAuthenticated, isLoading, user } = useKindeAuth();
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [checkingRegistration, setCheckingRegistration] = React.useState(true);
  const location = useLocation();
  const checkAttempted = React.useRef(false);

  // Create API client
  const api = React.useMemo(() => createApiClient(), []);

  React.useEffect(() => {
    let isMounted = true;

    const checkRegistration = async () => {
      if (checkAttempted.current || !isAuthenticated || !user?.id) {
        if (isMounted) setCheckingRegistration(false);
        return;
      }

      try {
        const data = await api.getUser(user.id);

        if (data?.needsRegistration) {
          if (isMounted) {
            setIsRegistered(false);
            setCheckingRegistration(false);
            checkAttempted.current = true;
            toast.error('Please complete registration to continue');
          }
          return;
        }

        if (data?.success && data?.user) {
          if (isMounted) {
            setIsRegistered(true);
            setCheckingRegistration(false);
            checkAttempted.current = true;
          }
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Registration Check Error:', error);
        if (isMounted) {
          setIsRegistered(false);
          setCheckingRegistration(false);
          checkAttempted.current = true;
          
          if (error.message === 'Authentication failed') {
            toast.error('Authentication failed. Please try logging in again.');
          } else {
            toast.error('Registration check failed. Please try again.');
          }
        }
      }
    };

    if (isAuthenticated && !checkAttempted.current) {
      checkRegistration();
    }

    return () => {
      isMounted = false;
    };
  }, [user?.id, isAuthenticated, api]);

  if (isLoading || checkingRegistration) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/" />;
  if (!isRegistered) return <Navigate to="/register" />;
  
  return children;
});


console.log("Kinde Env Variables...:");
console.log("VITE_KINDE_CLIENT_ID:", import.meta.env.VITE_APP_KINDE_CLIENT_ID);
console.log("VITE_KINDE_ISSUER_URL:", import.meta.env.VITE_APP_KINDE_ISSUER_URL);
console.log("VITE_KINDE_REDIRECT_URL:", import.meta.env.VITE_APP_KINDE_REDIRECT_URL);
console.log("VITE_APP_KINDE_POST_LOGOUT_URL:", import.meta.env.VITE_APP_KINDE_POST_LOGOUT_URL);
console.log("VITE_APP_API_BASE_URL:", import.meta.env.VITE_APP_API_BASE_URL);



// const RequireRole = React.memo(({ children, allowedRoles }) => {
//   const { isLoading, isAuthenticated, user } = useKindeAuth();

//   if (isLoading) return <LoadingSpinner />;
//   if (!isAuthenticated) return <Navigate to="/login" replace />;

//   const userRoles = user?.roles || [];
//   const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));

//   if (!hasRequiredRole) return <Navigate to="/unauthorized" replace />;
//   return children;
// });

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {

  const { isAuthenticated, login: kindeLogin } = useKindeAuth()

    // Check for cached auth on mount
    useEffect(() => {
      const checkAuth = async () => {
        try {
          const cachedToken = localStorage.getItem('kinde_auth_token');
          if (cachedToken && !isAuthenticated && kindeLogin) {
            await kindeLogin();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      };
      
      checkAuth();
    }, [isAuthenticated, kindeLogin]);
  // Prefetch critical components
  React.useEffect(() => {
    const prefetchComponents = async () => {
      const promises = [
        import("./Components/HomePage"),
        import("./Components/About"),
        import('./Components/SponsorsScroll.jsx')
      ];
      await Promise.all(promises);
    };
    prefetchComponents();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <KindeProvider
          clientId={import.meta.env.VITE_APP_KINDE_CLIENT_ID}
          domain={import.meta.env.VITE_APP_KINDE_ISSUER_URL}
          redirectUri={import.meta.env.VITE_APP_KINDE_REDIRECT_URL}
          logoutUri={import.meta.env.VITE_APP_KINDE_POST_LOGOUT_URL}
        >
        <AuthProvider>
          <PackageProvider>
            <ErrorBoundary>
              <div className="bg-slate-950 min-h-screen">
                <ScrollToTop />
                <Toaster 
                  position="top-right" 
                  toastOptions={{
                    duration: 1000,
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
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/intro" element={<IntroAnimation />} />
                    <Route path="/news" element={<NewsList />} />
                    <Route path="/sponsors" element={<SponsorScroll/>} />
                    <Route path="/teams" element={<TeamShowcase/>} />
                    <Route path="/news/:newsId" element={<NewsDetail />} />
                 
                    <Route 
                        path="/payment/verify" 
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <PaymentVerify />
                          </Suspense>
                        } 
                      />
                      <Route 
                        path="/payment/success" 
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <PaymentSuccess />
                          </Suspense>
                        } 
                      />
                      <Route 
                        path="/payment/failure" 
                        element={
                          <Suspense fallback={<LoadingSpinner />}>
                            <PaymentFailure />
                          </Suspense>
                        } 
                      />

                    {/* Protected Routes */}
                    <Route path="/register" element={
                     <ProtectedRoute requireRegistration={false}>
                        <RegistrationForm />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute requireRegistration={true}>
                               <UserProfile />
                        </ProtectedRoute>
                    } />
                    <Route path="/cart" element={
                        <ProtectedRoute requireRegistration={true}>
                             <CartComponent />
                        </ProtectedRoute>
                    } />
                    <Route path="/administration" element={<AdministrationPage />} />
                    <Route path="/payment" element={
                      <RegisteredRoute>
                        <PaymentHandler />
                      </RegisteredRoute>
                    } />
                    <Route path="/registrations" element={
                      <RegisteredRoute>
                        <ExportRegistrations />
                      </RegisteredRoute>
                    } />
                    
                    {/* Department Routes */}
                    <Route path="/departments" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <DepartmentLayout />
                      </Suspense>
                    }>
                      <Route path=":departmentId/events" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <Events />
                        </Suspense>
                      } />
                      <Route path=":departmentId/workshops" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <Workshops />
                        </Suspense>
                      } />
                      <Route path=":departmentId/events/:eventId" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <EventDetails />
                        </Suspense>
                      } />
                      <Route path=":departmentId/workshops/:workshopId" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <WorkshopDetails />
                        </Suspense>
                      } />
                    </Route>

                    {/* Validation Routes */}
                    
                    <Route path="/test-validation" element={<TestValidation />} />

                    {/* Admin Routes */}
                    <Route path="/adminDashboard" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <AdminRoute>
                             <AdminDashboard />
                        </AdminRoute>
                      </Suspense>
                    }>
                      <Route path="departments" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ProtectedRoute requireRegistration={false}>
                                <DepartmentForm />
                          </ProtectedRoute>
                        </Suspense>
                      } />


                    <Route path="registerOffline" element={<ManualRegistration/>} />
                    <Route path="validateOffline" element={<ValidationPage />} />
                    <Route path="print-receipt/:receiptNumber" element={<ReceiptPage />} />


                     <Route path="validation" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <ProtectedRoute requireRegistration={false}>
                                <EventValidation />
                          </ProtectedRoute>
                        </Suspense>
                      } />


                      <Route path="events" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <EventsManager />
                        </Suspense>
                      } />
                      <Route path="news" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <NewsForm />
                        </Suspense>
                      } />
                      <Route path="workshops" element={
                        <Suspense fallback={<LoadingSpinner />}>
                          <WorkshopsManager />
                        </Suspense>
                      } />
                    </Route>
                  </Routes>
                </Suspense>
              </div>
            </ErrorBoundary>
          </PackageProvider>
          </AuthProvider>
        </KindeProvider>
      </Provider>
    </QueryClientProvider>
  );
}

export default App;