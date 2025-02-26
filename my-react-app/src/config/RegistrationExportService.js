import API_CONFIG from '../config/api';

// Registration export endpoints
export const registrationEndpoints = {
  listItems: 'registrations/list-items',
  exportEvent: (eventId) => `registrations/event/${eventId}`,
  exportWorkshop: (workshopId) => `registrations/workshop/${workshopId}`,
  stats: 'registrations/stats'
};

// Service factory that takes an API client instance
const createRegistrationExportService = (apiClient) => {
  // Get available exportable items (events, workshops, classes)
  const getExportableItems = async () => {
    try {
      const response = await apiClient.makeAuthenticatedRequest(registrationEndpoints.listItems);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch exportable items');
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching exportable items:', error);
      throw error;
    }
  };

  // Get event registrations with filters
  const getEventRegistrations = async (eventId, options = {}) => {
    try {
      const { format = 'json', class: studentClass, startDate, endDate } = options;
      
      // For CSV and Excel, we return the URL with auth token
      if (format === 'csv' || format === 'excel') {
        return { 
          url: getExportUrl(eventId, 'event', options),
          requiresAuth: true
        };
      }
      
      // Build query string
      const queryParams = [];
      if (studentClass) queryParams.push(`class=${encodeURIComponent(studentClass)}`);
      if (startDate) queryParams.push(`startDate=${encodeURIComponent(startDate)}`);
      if (endDate) queryParams.push(`endDate=${encodeURIComponent(endDate)}`);
      queryParams.push(`format=${format}`);
      
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      
      // For JSON, we fetch the data using the authenticated request
      const response = await apiClient.makeAuthenticatedRequest(
        `${registrationEndpoints.exportEvent(eventId)}${queryString}`
      );
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch event registrations');
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching event registrations:', error);
      throw error;
    }
  };

  // Get workshop registrations with filters
  const getWorkshopRegistrations = async (workshopId, options = {}) => {
    try {
      const { format = 'json', class: studentClass, startDate, endDate } = options;
      
      // For CSV and Excel, we return the URL with auth token
      if (format === 'csv' || format === 'excel') {
        return { 
          url: getExportUrl(workshopId, 'workshop', options),
          requiresAuth: true
        };
      }
      
      // Build query string
      const queryParams = [];
      if (studentClass) queryParams.push(`class=${encodeURIComponent(studentClass)}`);
      if (startDate) queryParams.push(`startDate=${encodeURIComponent(startDate)}`);
      if (endDate) queryParams.push(`endDate=${encodeURIComponent(endDate)}`);
      queryParams.push(`format=${format}`);
      
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      
      // For JSON, we fetch the data using the authenticated request
      const response = await apiClient.makeAuthenticatedRequest(
        `${registrationEndpoints.exportWorkshop(workshopId)}${queryString}`
      );
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch workshop registrations');
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching workshop registrations:', error);
      throw error;
    }
  };

  // Get overall registration statistics
  const getRegistrationStats = async () => {
    try {
      const response = await apiClient.makeAuthenticatedRequest(registrationEndpoints.stats);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch registration statistics');
      }
      
      return response.stats;
    } catch (error) {
      console.error('Error fetching registration statistics:', error);
      throw error;
    }
  };

  // Generate export URL - the auth token will be added by the apiClient
  const getExportUrl = (itemId, type, options = {}) => {
    const { format = 'json', class: studentClass, startDate, endDate } = options;
    
    // Build query parameters
    const queryParams = [];
    if (studentClass) queryParams.push(`class=${encodeURIComponent(studentClass)}`);
    if (startDate) queryParams.push(`startDate=${encodeURIComponent(startDate)}`);
    if (endDate) queryParams.push(`endDate=${encodeURIComponent(endDate)}`);
    queryParams.push(`format=${format}`);
    
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    
    const endpoint = type === 'event' 
      ? registrationEndpoints.exportEvent(itemId)
      : registrationEndpoints.exportWorkshop(itemId);
    
    return `${API_CONFIG.baseURL}/${endpoint}${queryString}`;
  };

  // Wrapper function for file exports that handles authentication
  const downloadExport = async (itemId, type, options = {}) => {
    try {
      // Get auth token
      const token = await apiClient.getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Create URL with query params
      const url = getExportUrl(itemId, type, options);
      
      // Create a hidden form to submit the request with authentication
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = url;
      form.target = '_blank';
      
      // Add auth token as hidden field
      const tokenField = document.createElement('input');
      tokenField.type = 'hidden';
      tokenField.name = 'token';
      tokenField.value = token;
      form.appendChild(tokenField);
      
      // Add coordinator info if available
      const coordinatorId = localStorage.getItem('coordinatorId');
      if (coordinatorId) {
        const coordField = document.createElement('input');
        coordField.type = 'hidden';
        coordField.name = 'coordinatorId';
        coordField.value = coordinatorId;
        form.appendChild(coordField);
      }
      
      // Submit form
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      
      return { success: true };
    } catch (error) {
      console.error('Error downloading export:', error);
      throw error;
    }
  };

  // Return the service object with all functions
  return {
    getExportableItems,
    getEventRegistrations,
    getWorkshopRegistrations,
    getRegistrationStats,
    getExportUrl,
    downloadExport
  };
};

export default createRegistrationExportService;