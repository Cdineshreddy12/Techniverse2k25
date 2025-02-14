const BASE_URL = import.meta.env.VITE_APP_BACKEND_URL || window.location.origin;

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
      console.error('Token retrieval error:', error);
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

      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

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

  return {
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