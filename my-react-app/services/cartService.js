import axios from 'axios';

const API_URL = '/api/cart';

export const cartService = {
  addItem: async (workshopId) => {
    const response = await axios.post(`${API_URL}/add`, { workshopId });
    return response.data;
  },

  removeItem: async (workshopId) => {
    const response = await axios.post(`${API_URL}/remove`, { workshopId });
    return response.data;
  },

  getCart: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  checkout: async () => {
    const response = await axios.post(`${API_URL}/checkout`);
    return response.data;
  }
};