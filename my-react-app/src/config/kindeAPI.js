import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import API_CONFIG from './api.js';

export const createApiClient = () => {
  const { getToken } = useKindeAuth();
  
  const makeAuthenticatedRequest = async (endpoint, options = {}) => {
      try {
          const token = await getToken();
          if (!token) {
              throw new Error('No authentication token available');
          }

          const url = API_CONFIG.getUrl(endpoint);  // Using the endpoint parameter

          const response = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
          });

          // If token expired or invalid, retry once
          if (response.status === 401) {
              console.log('Token expired, refreshing...');
              const newToken = await getToken(true);
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