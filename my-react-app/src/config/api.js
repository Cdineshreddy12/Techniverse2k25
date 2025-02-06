// src/config/api.js
const API_CONFIG = {
    baseURL: `${import.meta.env.VITE_APP_BACKEND_URL}/api`,
    getUrl: (endpoint) => {
        const cleanEndpoint = endpoint.replace(/^\/+|\/+$/g, '');
        const url = `${API_CONFIG.baseURL}/${cleanEndpoint}`;
        console.log('Generated URL:', url); // Debug URL construction
        return url;
      }
  };
  
  export default API_CONFIG;