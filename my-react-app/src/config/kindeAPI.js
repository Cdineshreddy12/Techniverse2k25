import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import API_CONFIG from './api.js';

const TOKEN_KEY = 'kinde_auth_token';

export const createApiClient = () => {
  const { getToken } = useKindeAuth();
  
  // Cache token in localStorage
  const cacheToken = (token) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  };

  // Get cached token
  const getCachedToken = () => {
    return localStorage.getItem(TOKEN_KEY);
  };

  const makeAuthenticatedRequest = async (endpoint, options = {}) => {
    try {
      // Try to use cached token first
      let token = getCachedToken();
      
      // If no cached token, get a new one
      if (!token) {
        token = await getToken();
        if (token) {
          cacheToken(token);
        }
      }

      if (!token) {
        throw new Error('No authentication token available');
      }

      const url = API_CONFIG.getUrl(endpoint);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // If token expired or invalid, get a new one and retry
      if (response.status === 401) {
        const newToken = await getToken(true);
        if (newToken) {
          cacheToken(newToken);
          
          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json',
            },
          });
          return retryResponse;
        }
      }

      return response;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  };

  return {
      getUser: async (kindeId) => {
          const response = await makeAuthenticatedRequest(`user/${kindeId}`);
          
          if (response.status === 401) {
              throw new Error('Authentication failed');
          }

          const data = await response.json();
          
          // Handle 202 status explicitly
          if (response.status === 202) {
              return {
                  needsRegistration: true,
                  user: data.user
              };
          }

          // Handle success response
          if (response.ok) {
              return data;
          }

          // Handle other errors
          throw new Error(data.error || 'Failed to fetch user');
      },
      
      registerUser: async (userData) => {
          const response = await makeAuthenticatedRequest('register', {
              method: 'POST',
              body: JSON.stringify(userData)
          });

          const data = await response.json();

          if (!response.ok) {
              throw new Error(data.details || data.error || 'Registration failed');
          }

          return data;
      }
  };
};