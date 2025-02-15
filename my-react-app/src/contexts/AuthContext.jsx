// AuthContext.jsx
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

  // Add persistent token storage
// In AuthContext.jsx
const persistToken = useCallback(async () => {
  try {
    const token = await auth.getToken();
    if (token) {
      // Extend token lifetime
      const expiryTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      // Store all necessary auth data
      localStorage.setItem('kinde_auth_token', token);
      localStorage.setItem('kinde_token_expiry', expiryTime.toISOString());
      localStorage.setItem('kinde_user', JSON.stringify(auth.user));
      
      console.log('Token stored successfully', {
        hasToken: true,
        expiry: expiryTime,
        userId: auth.user?.id
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Token persistence failed:', error);
    return false;
  }
}, [auth]);

  // want to check the exact case to remove the token
  // Restore token on mount or after redirect
// In AuthContext.jsx
const restoreToken = useCallback(async () => {
  try {
    const storedToken = localStorage.getItem('kinde_auth_token');
    const tokenExpiry = localStorage.getItem('kinde_token_expiry');
    const storedUser = localStorage.getItem('kinde_user');

    if (!storedToken || !tokenExpiry) {
      console.log('No stored token or expiry found');
      return false;
    }

    const expiryDate = new Date(tokenExpiry);
    const currentDate = new Date();

    if (expiryDate <= currentDate) {
      console.log('Token expired, cleaning up');
      localStorage.removeItem('kinde_auth_token');
      localStorage.removeItem('kinde_token_expiry');
      localStorage.removeItem('kinde_user');
      return false;
    }

    console.log('Valid token found', {
      hasToken: true,
      expiry: expiryDate,
      user: storedUser ? JSON.parse(storedUser) : null
    });
    
    return true;
  } catch (error) {
    console.error('Token restoration failed:', error);
    return false;
  }
}, []);

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
    if (checkInProgress.current && !force) return;
    
    if (!auth.isAuthenticated || !auth.user?.id || !api) {
      setIsLoading(false);
      registrationChecked.current = true;
      return;
    }

    try {
      checkInProgress.current = true;

      // Store token whenever checking registration
      await persistToken();

      const adminStatus = await checkAdminStatus();
      if (adminStatus) {
        setIsAdmin(true);
        setIsRegistered(true);
        setIsLoading(false);
        registrationChecked.current = true;
        return;
      }

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
  }, [auth.isAuthenticated, auth.user?.id, api, checkAdminStatus, persistToken]);

  // Add authentication restoration on mount
  useEffect(() => {
    const initAuth = async () => {
      const hasValidToken = await restoreToken();
      if (hasValidToken && !auth.isAuthenticated && auth.login) {
        try {
          await auth.login();
        } catch (error) {
          console.error('Error restoring auth:', error);
        }
      }
    };

    initAuth();
  }, [auth.isAuthenticated, auth.login, restoreToken]);

  // Initial authentication check
  useEffect(() => {
    if (!initialCheckDone.current && auth.isAuthenticated) {
      checkRegistration();
    }
  }, [auth.isAuthenticated, checkRegistration]);

  // Reset state on logout
  useEffect(() => {
    if (!auth.isAuthenticated) {
      localStorage.removeItem('kinde_auth_token');
      localStorage.removeItem('kinde_token_expiry');
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
