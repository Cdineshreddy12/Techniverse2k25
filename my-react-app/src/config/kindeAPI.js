const BASE_URL = (import.meta.env.VITE_APP_BACKEND_URL || window.location.origin) + '/api';
import { offlineEndpoints } from "./offlineAPI";
export const createApiClient = (auth) => {
  const getAuthToken = async () => {
    try {
      if (!auth?.isAuthenticated) {
        console.log('Not authenticated');
        return null;
      }

      const token = await auth.getToken();
      return token;
    } catch (error) {
      console.error('Token retrieval error..:', error);
      return null;
    }
  };

  const makeAuthenticatedRequest = async (endpoint, options = {}) => {
    try {
      const token = await getAuthToken();
      
      if (!token) {
        return {
          success: false,
          error: 'Authentication required',
          needsAuthentication: true
        };
      }

      const url = `${BASE_URL}/${endpoint}`;
      console.log(`Making ${options.method || 'GET'} request to:`, url);

        // Simplified request options
    const requestOptions = {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Coordinator-ID': localStorage.getItem('coordinatorId'),
        'X-Coordinator-Name': localStorage.getItem('coordinatorName'),
        ...options.headers,
      }
    };

    const response = await fetch(url, requestOptions);
    const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Request failed');
      }

      return {
        success: true,
        ...data
      };
    } catch (error) {
      console.error('Request failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };


  const detectCoordinator = async () => {
    try {
      const user = await auth.getUser();
      localStorage.setItem('coordinatorId', user.id);
      localStorage.setItem('coordinatorName', user.given_name ? 
        `${user.given_name} ${user.family_name || ''}` : user.name);
      localStorage.setItem('coordinatorEmail', user.email);
      return user;
    } catch (error) {
      console.error('Error detecting coordinator:', error);
      return null;
    }
  };

  return {
    detectCoordinator,
    getCoordinatorStats: async () => {
      const coordinatorId = localStorage.getItem('coordinatorId');
      if (!coordinatorId) {
        throw new Error('Coordinator ID not found');
      }
      // Execute the endpoint function to get the URL
      const endpoint = offlineEndpoints.getCoordinatorStats(coordinatorId);
      return makeAuthenticatedRequest(endpoint);
    },
    getCoordinatorsSummary: async () => {
      return makeAuthenticatedRequest(offlineEndpoints.getCoordinatorsSummary);
    },
    makeAuthenticatedRequest,
    // Get user profile
    getUser: async (kindeId) => {
      console.log('Getting user:', kindeId);
      return makeAuthenticatedRequest(`users/${kindeId}`);
    },

    // Register user
    registerUser: async (userData) => {
      console.log('Registering user:', userData);
      return makeAuthenticatedRequest('users/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    },

    // Get latest registration
    getLatestRegistration: async (kindeId) => {
      console.log('Getting latest registration for:', kindeId);
      return makeAuthenticatedRequest(`users/${kindeId}/registrations/latest`);
    },

    // Get registration by order ID
    getRegistrationByOrderId: async (orderId) => {
      console.log('Getting registration for order:', orderId);
      return makeAuthenticatedRequest(`registration/${orderId}`);
    },

    // Get all registrations
    getAllRegistrations: async (kindeId) => {
      console.log('Getting all registrations for:', kindeId);
      return makeAuthenticatedRequest(`users/${kindeId}/registrations`);
    }
  };
};