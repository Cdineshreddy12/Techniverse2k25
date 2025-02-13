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
  const registrationChecked = useRef(false);
  const checkInProgress = useRef(false);
  const initialCheckDone = useRef(false);

  const checkAdminStatus = useCallback(async () => {
    if (!auth.user) return false;

    try {
      const permissions = await auth.getPermissions();
      return permissions?.permissions?.includes('TECH_ADMIN') || false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }, [auth]);

  const checkRegistration = useCallback(async (force = false) => {
    // Prevent concurrent checks
    if (checkInProgress.current && !force) return;
    
    // Skip if not authenticated or no user
    if (!auth.isAuthenticated || !auth.user?.id || !api) {
      setIsLoading(false);
      registrationChecked.current = true;
      return;
    }

    try {
      checkInProgress.current = true;

      // Check admin status first
      const adminStatus = await checkAdminStatus();
      if (adminStatus) {
        setIsAdmin(true);
        setIsRegistered(true);
        setIsLoading(false);
        registrationChecked.current = true;
        return;
      }

      // Skip if already checked and not forced
      if (registrationChecked.current && !force) {
        return;
      }

      const data = await api.getUser(auth.user.id);

      if (data.success && data.user && !data.needsRegistration) {
        setIsRegistered(true);
        setUserData(data.user);
      } else {
        setIsRegistered(false);
        setUserData(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsRegistered(false);
      setUserData(null);
    } finally {
      setIsLoading(false);
      registrationChecked.current = true;
      checkInProgress.current = false;
      initialCheckDone.current = true;
    }
  }, [auth.isAuthenticated, auth.user?.id, api, checkAdminStatus]);

  // Initial authentication check
  useEffect(() => {
    if (!initialCheckDone.current && auth.isAuthenticated) {
      checkRegistration();
    }
  }, [auth.isAuthenticated, checkRegistration]);

  // Reset state on logout
  useEffect(() => {
    if (!auth.isAuthenticated) {
      setIsRegistered(false);
      setIsAdmin(false);
      setUserData(null);
      registrationChecked.current = false;
      initialCheckDone.current = false;
    }
  }, [auth.isAuthenticated]);

  const value = {
    isRegistered,
    isLoading,
    isAdmin,
    user: userData || auth.user,
    isAuthenticated: auth.isAuthenticated,
    login: auth.login,
    logout: auth.logout,
    checkRegistration,
    registrationChecked: registrationChecked.current
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};