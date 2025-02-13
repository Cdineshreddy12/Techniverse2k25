// src/config/kindeAPI.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export const createApiClient = (auth) => {
  const getAuthToken = async () => {
    console.log('Getting auth token, auth state:', { 
      isAuthenticated: auth?.isAuthenticated,
      hasGetToken: Boolean(auth?.getToken)
    });

    try {
      if (!auth?.isAuthenticated) {
        console.log('Not authenticated, returning null token');
        return null;
      }

      const token = await auth.getToken?.();
      console.log('Token retrieval result:', { hasToken: Boolean(token) });

      if (!token) {
        console.warn('No token available, user might need to log in again');
        return null;
      }

      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  const makeAuthenticatedRequest = async (endpoint, options = {}) => {
    console.log('Making authenticated request to:', endpoint);
    console.log('Request options:', options);

    try {
      if (!auth?.isAuthenticated) {
        console.log('Not authenticated, returning early');
        return {
          success: false,
          error: 'Not authenticated',
          needsAuthentication: true
        };
      }

      const token = await getAuthToken();
      if (!token) {
        console.log('No token available, returning auth required');
        return {
          success: false,
          error: 'Authentication required',
          needsAuthentication: true
        };
      }

      const url = `${BASE_URL}/${endpoint}`;
      console.log('Making fetch request to:', url);
      
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Raw response:', response);

        let data;
        try {
          data = await response.json();
          console.log('Parsed response data:', data);
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          data = null;
        }

        if (!response.ok) {
          // Handle 404 specifically as needing registration
          if (response.status === 404) {
            console.log('User not found, needs registration');
            return {
              success: false,
              needsRegistration: true,
              error: 'User not found'
            };
          }

          if (response.status === 401) {
            console.log('Authentication failed response');
            return {
              success: false,
              error: 'Authentication failed',
              needsAuthentication: true
            };
          }

          return {
            success: false,
            error: data?.error || 'Request failed',
            statusCode: response.status
          };
        }

        return {
          success: true,
          ...data
        };
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        // Check if it's a network error
        if (!window.navigator.onLine) {
          return {
            success: false,
            error: 'Network error - Please check your internet connection'
          };
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error.message || 'Request failed'
      };
    }
  };

  return {
    getUser: async (kindeId) => {
      console.log('getUser called with kindeId:', kindeId);
      
      if (!kindeId || !auth?.isAuthenticated) {
        console.log('Invalid user request:', { kindeId, isAuthenticated: auth?.isAuthenticated });
        return { 
          success: false,
          needsRegistration: true, 
          user: null 
        };
      }
      
      const response = await makeAuthenticatedRequest(`users/${kindeId}`);
      console.log('getUser response:', response);
      
      if (response.statusCode === 404 || (response.error && response.error.includes('not found'))) {
        console.log('User needs registration based on response');
        return {
          success: false,
          needsRegistration: true,
          user: null
        };
      }
      
      return response;
    },

    registerUser: async (userData) => {
      console.log('registerUser called with:', userData);
      
      if (!auth?.isAuthenticated) {
        console.log('Not authenticated for registration');
        return {
          success: false,
          error: 'Authentication required',
          needsAuthentication: true
        };
      }

      const response = await makeAuthenticatedRequest('users/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      
      console.log('Registration response:', response);
      return response;
    }
  };
};