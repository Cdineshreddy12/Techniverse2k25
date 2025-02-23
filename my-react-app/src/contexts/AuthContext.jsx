import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { useApi } from '../config/useApi.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const auth = useKindeAuth();
  const api = useApi();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Single initialization ref to prevent multiple checks
  const initialized = useRef(false);

  const getCombinedUserData = useCallback(() => {
    if (!auth.user) return null;
    return {
      id: auth.user.id,
      kindeId: auth.user.id,
      email: auth.user.email,
      name: `${auth.user.given_name} ${auth.user.family_name || ''}`.trim(),
      picture: auth.user.picture,
      registrationComplete: userData?.registrationComplete || false,
      ...(userData || {})
    };
  }, [auth.user, userData]);

  const checkRegistration = useCallback(async (force = false) => {
    // Skip if not authenticated or no user
    if (!auth.isAuthenticated || !auth.user?.id) {
      setIsLoading(false);
      return;
    }

    // Skip if already initialized and not forced
    if (initialized.current && !force) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Check admin status
      const permissions = await auth.getPermissions();
      const hasAdminPermission = permissions?.permissions?.includes('TECH_ADMIN') || false;
      setIsAdmin(hasAdminPermission);

      if (hasAdminPermission) {
        setIsRegistered(true);
        return;
      }

      // Check user registration
      const data = await api.getUser(auth.user.id);
      
      setIsRegistered(data.success && data.user && !data.needsRegistration);
      setUserData(data.success ? data.user : null);
      
      initialized.current = true;
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsRegistered(false);
      setIsAdmin(false);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  }, [auth, api]);

  // Initial auth state check
  useEffect(() => {
    if (auth.isAuthenticated && auth.user && !initialized.current) {
      checkRegistration();
    } else if (!auth.isLoading && !auth.isAuthenticated) {
      setIsLoading(false);
    }
  }, [auth.isAuthenticated, auth.isLoading, auth.user, checkRegistration]);

  const value = {
    isRegistered,
    isLoading,
    isAdmin,
    user: getCombinedUserData(),
    isAuthenticated: auth.isAuthenticated,
    login: auth.login,
    logout: auth.logout,
    checkRegistration,
    initialized: initialized.current
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};