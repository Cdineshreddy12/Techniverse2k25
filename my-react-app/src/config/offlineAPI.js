import API_CONFIG from './api';

// Define all endpoint paths
export const offlineEndpoints = {
  // User related endpoints
  createUser: 'offline/create-offline-user',
  createRegistration: 'offline/create-offline-registration',
  updateRegistration: (registrationId) => `offline/update-registration/${registrationId}`,
  searchRegistration: 'offline/search-registration',
  checkIn: 'offline/check-in',

  // Event and workshop endpoints
  getEvents: 'departments/all/events',
  getWorkshops: 'workshops',

  // Statistics and reporting endpoints  
  getClassWiseStats: 'offline/class-wise-stats',
  getCoordinatorStats: (coordinatorId) => `offline/coordinator-stats/${coordinatorId}`,
  getCoordinatorsSummary: 'offline/coordinators-summary'
};

// Custom error class for offline API errors
export class OfflineAPIError extends Error {
  constructor(endpoint, message, originalError) {
    super(message);
    this.name = 'OfflineAPIError';
    this.endpoint = endpoint;
    this.originalError = originalError;
  }
}

// Main request handler with enhanced error handling
export const makeOfflineRequest = async (api, endpoint, options = {}) => {
  try {
    // Configure default options
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Merge options with defaults
    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };

    // Make the authenticated request
    const response = await api.makeAuthenticatedRequest(endpoint, finalOptions);
    
    // Check for success flag in response
    if (!response.success) {
      throw new OfflineAPIError(
        endpoint,
        response.error || 'Request failed with no error message',
        null
      );
    }
    
    return response;
  } catch (error) {
    // Log the error with endpoint information
    console.error(`Offline API Error (${endpoint}):`, error);

    // If it's already our custom error, throw it as is
    if (error instanceof OfflineAPIError) {
      throw error;
    }

    // Otherwise, wrap it in our custom error
    throw new OfflineAPIError(
      endpoint,
      error.message || 'An unexpected error occurred',
      error
    );
  }
};

// Helper function to check if an endpoint is a function that needs parameters
export const getEndpointPath = (endpoint, params = null) => {
  if (typeof endpoint === 'function') {
    if (!params) {
      throw new Error(`Endpoint requires parameters but none were provided`);
    }
    return endpoint(params);
  }
  return endpoint;
};