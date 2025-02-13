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

    // Create API client with auth object
    const client = createApiClient(auth);

    return {
      ...client,
      isAuthenticated: auth.isAuthenticated,
      hasValidToken: Boolean(auth.getToken)
    };
  }, [auth]);
};