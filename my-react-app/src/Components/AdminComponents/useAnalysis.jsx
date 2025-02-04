import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

export const useRegistrationAnalysis = () => {
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('excelFile', file);
      
      const response = await axios.post(
        `${import.meta.env.VITE_APP_BACKEND_URL}/api/analyze-registrations`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    }
  });
};