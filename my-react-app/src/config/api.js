// src/config/api.js
const BASE_URL = window.location.origin;
const API_CONFIG = {
    baseURL: BASE_URL,
    getUrl: (endpoint) => {
      const cleanEndpoint = endpoint.replace(/^\/+|\/+$/g, '');
      const url = `${BASE_URL}/api/${cleanEndpoint}`;
      console.log('API Call URL:', url); // Debug
      return url;
    }
  };
  
  export default API_CONFIG;