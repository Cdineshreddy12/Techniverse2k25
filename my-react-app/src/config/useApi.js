// src/hooks/useApi.js
import { useMemo } from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { createApiClient } from '../config/kindeAPI';

export const useApi = () => {
  const auth = useKindeAuth();
  
  return useMemo(() => {
    if (!auth) {
      console.warn('Auth context not available');
      return null;
    }

    const apiClient = createApiClient(auth);

    return {
      ...apiClient,
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.isLoading,
      user: auth.user,
      login: auth.login,
      logout: auth.logout
    };
  }, [auth]);
};