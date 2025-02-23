// AuthContext.jsx - Updated implementation
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
  
  const authState = useRef({
    registrationChecked: false,
    checkInProgress: false,
    initialCheckDone: false,
    lastCheck: null
  });

  // Improved check admin status
  const checkAdminStatus = useCallback(async () => {
    if (!auth.user) {
      console.log('No user found for admin check');
      return false;
    }
    try {
      const permissions = await auth.getPermissions();
      console.log('Admin check permissions:', permissions);
      const hasAdminPermission = permissions?.permissions?.includes('TECH_ADMIN') || false;
      console.log('Has admin permission:', hasAdminPermission);
      setIsAdmin(hasAdminPermission); // Directly update the state
      return hasAdminPermission;
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      return false;
    }
  }, [auth]);

  // Update checkRegistration to handle admin status properly
  const checkRegistration = useCallback(async (force = false) => {
    if (authState.current.checkInProgress && !force) return;
    
    if (!auth.isAuthenticated || !auth.user?.id) {
      setIsLoading(false);
      setIsAdmin(false);
      authState.current.registrationChecked = true;
      return;
    }

    try {
      authState.current.checkInProgress = true;
      setIsLoading(true);

      // Check admin status first
      const adminStatus = await checkAdminStatus();
      
      if (adminStatus) {
        setIsRegistered(true);
        setIsLoading(false);
        authState.current.registrationChecked = true;
        return;
      }

      // Only check regular user registration if not admin
      if (!adminStatus && api) {
        const data = await api.getUser(auth.user.id);
        setIsRegistered(data.success && data.user && !data.needsRegistration);
        setUserData(data.success && data.user ? data.user : null);
      }

    } catch (error) {
      console.error('Auth check failed:', error);
      setIsRegistered(false);
      setIsAdmin(false);
      setUserData(null);
    } finally {
      setIsLoading(false);
      authState.current.checkInProgress = false;
      authState.current.initialCheckDone = true;
      authState.current.registrationChecked = true;
    }
  }, [auth.isAuthenticated, auth.user?.id, api, checkAdminStatus]);

  // Add effect to monitor auth state changes
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      checkRegistration(true);
    } else {
      setIsAdmin(false);
      setIsRegistered(false);
      setUserData(null);
    }
  }, [auth.isAuthenticated, auth.user, checkRegistration]);

  // Debug logging
  useEffect(() => {
    console.log('Auth Context State:', {
      isAuthenticated: auth.isAuthenticated,
      isAdmin,
      isLoading,
      user: auth.user,
      registrationChecked: authState.current.registrationChecked
    });
  }, [auth.isAuthenticated, isAdmin, isLoading, auth.user]);

  const value = {
    isRegistered,
    isLoading,
    isAdmin,
    user: userData || auth.user,
    isAuthenticated: auth.isAuthenticated,
    login: auth.login,
    logout: auth.logout,
    checkRegistration,
    registrationChecked: authState.current.registrationChecked
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