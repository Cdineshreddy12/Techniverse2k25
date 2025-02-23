// src/components/routes/ProtectedRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { useAuth } from '../../src/contexts/AuthContext';

// Import or define LoadingSpinner component
const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center">
    <div className="w-10 h-10 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent" />
  </div>
);

const ProtectedRoute = React.memo(({ children, requireRegistration = false }) => {
  const { isAuthenticated, isLoading: kindeLoading } = useKindeAuth();
  const { 
    isRegistered, 
    isLoading: authLoading, 
    checkRegistration,
    isAdmin 
  } = useAuth();
  const location = useLocation();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const performInitialCheck = async () => {
      if (!isAuthenticated || initialCheckDone) return;

      try {
        await checkRegistration();
        if (isMounted) {
          setInitialCheckDone(true);
        }
      } catch (error) {
        console.error('Registration check failed:', error);
      }
    };

    performInitialCheck();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, checkRegistration, initialCheckDone]);

  // Show loading state until all checks are complete
  if (kindeLoading || authLoading || (!initialCheckDone && isAuthenticated)) {
    return <LoadingSpinner />;
  }

  // Not authenticated, redirect to home
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Admin bypass registration check
  if (isAdmin) {
    return children;
  }

  // Registration check for protected routes
  if (requireRegistration && !isRegistered) {
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  return children;
});

// Add display name for debugging
ProtectedRoute.displayName = 'ProtectedRoute';

export default ProtectedRoute;