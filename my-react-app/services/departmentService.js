// services/departmentService.js
import axios from 'axios';

const API_URL = 'http://localhost:4000/api/departments';

export const departmentService = {
  getAll: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  getOne: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  }
};