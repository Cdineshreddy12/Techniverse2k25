import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center">
    <div className="w-10 h-10 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent" />
  </div>
);

export const ProtectedRoute = React.memo(({ children, requireRegistration = false }) => {
  const { isAuthenticated, isRegistered, isLoading } = useAuth();
  const location = useLocation();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Please login to continue');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requireRegistration && !isRegistered) {
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  return children;
});

export const RequireRole = React.memo(({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const userRoles = user?.roles || [];
  const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));

  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
});