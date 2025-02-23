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

  // Add a ref to track initialization
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

 

  // Update checkRegistration to handle admin status properly
  const checkRegistration = useCallback(async () => {
    if (!auth.isAuthenticated || !auth.user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      // Check admin status first
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
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsRegistered(false);
      setIsAdmin(false);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  }, [auth, api]);


  // Add effect to monitor auth state changes
  useEffect(() => {
    if (!initialized.current && auth.isAuthenticated && auth.user) {
      initialized.current = true;
      checkRegistration();
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
    user: getCombinedUserData(),
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