import API_CONFIG from '../src/config/api.js';

const WORKSHOP_ENDPOINT = 'workshops';

export const workshopService = {
  async getAll() {
    try {
      const response = await fetch(API_CONFIG.getUrl(WORKSHOP_ENDPOINT + '/all'));
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.workshops;
    } catch (error) {
      console.error('Error fetching workshops:', error);
      throw error;
    }
  },

  async getStats() {
    try {
      const response = await fetch(API_CONFIG.getUrl(WORKSHOP_ENDPOINT + '/stats/overall'));
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      
      return {
        totalWorkshops: data.stats.totalWorkshops || 0,
        totalRegistrations: data.stats.totalRegistrations || 0,
        upcomingWorkshops: data.stats.activeWorkshops || 0,
        totalLearningHours: data.stats.totalLearningHours || 0,
        totalRevenue: data.stats.totalRevenue || 0,
        registrationStats: {
          openRegistrations: data.stats.registrationStats?.openRegistrations || 0,
          fullWorkshops: data.stats.registrationStats?.fullWorkshops || 0,
          totalSlots: data.stats.registrationStats?.totalSlots || 0,
          filledSlots: data.stats.registrationStats?.filledSlots || 0
        }
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  async getDepartmentStats(departmentId) {
    try {
      const response = await fetch(API_CONFIG.getUrl(`${WORKSHOP_ENDPOINT}/departments/${departmentId}/stats`));
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      
      return {
        totalWorkshops: data.stats.totalWorkshops || 0,
        totalRegistrations: data.stats.totalRegistrations || 0,
        activeWorkshops: data.stats.activeWorkshops || 0,
        totalLearningHours: data.stats.totalLearningHours || 0,
        totalRevenue: data.stats.totalRevenue || 0,
        registrationStats: data.stats.registrationStats || {}
      };
    } catch (error) {
      console.error('Error fetching department stats:', error);
      throw error;
    }
  },

  async createWorkshop(workshopData) {
    try {
      const formData = new FormData();
      
      // Ensure all required fields are present and properly formatted
      const preparedData = {
        ...workshopData,
        price: workshopData.price || 0,
        duration: {
          total: workshopData.duration?.total || 2,
          unit: workshopData.duration?.unit || 'hours'
        },
        registration: {
          isOpen: workshopData.registration?.isOpen || false,
          totalSlots: workshopData.registration?.totalSlots || 30,
          registeredCount: 0,
          startTime: workshopData.registration?.startTime || new Date().toISOString(),
          endTime: workshopData.registration?.endTime || new Date().toISOString()
        },
        // Ensure registrationEndTime is set
        registrationEndTime: workshopData.registration?.endTime || new Date().toISOString()
      };
      
      // Clean up any undefined or null values
      Object.keys(preparedData).forEach(key => {
        if (preparedData[key] === undefined || preparedData[key] === null) {
          delete preparedData[key];
        }
      });

      formData.append('workshopData', JSON.stringify(preparedData));
      
      // Handle file uploads
      if (workshopData.bannerDesktop?.file) {
        formData.append('bannerDesktop', workshopData.bannerDesktop.file);
      }
      if (workshopData.bannerMobile?.file) {
        formData.append('bannerMobile', workshopData.bannerMobile.file);
      }
      if (workshopData.lecturer?.photo?.file) {
        formData.append('lecturerPhoto', workshopData.lecturer.photo.file);
      }

      const response = await fetch(API_CONFIG.getUrl('workshops'), {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    } catch (error) {
      console.error('Error creating workshop:', error);
      throw error;
    }
  },

  async updateWorkshop(workshopId, workshopData) {
    try {
      const formData = new FormData();
      
      // Handle both URL string and file object formats for images
      const preparedData = {
        ...workshopData,
        bannerDesktop: workshopData.bannerDesktop?.url || workshopData.bannerDesktop,
        bannerMobile: workshopData.bannerMobile?.url || workshopData.bannerMobile,
        lecturer: {
          ...workshopData.lecturer,
          photo: workshopData.lecturer?.photo?.url || workshopData.lecturer?.photo
        },
        price: parseFloat(workshopData.price) || 0,
        duration: {
          total: parseInt(workshopData.duration?.total) || 1,
          unit: workshopData.duration?.unit || 'hours'
        },
        registration: {
          isOpen: Boolean(workshopData.registration?.isOpen),
          totalSlots: parseInt(workshopData.registration?.totalSlots) || 30,
          registeredCount: workshopData.registration?.registeredCount || 0,
          startTime: workshopData.registration?.startTime,
          endTime: workshopData.registration?.endTime
        },
        registrationEndTime: workshopData.registration?.endTime
      };
      console.log('prepared data',preparedData);
      formData.append('workshopData', JSON.stringify(preparedData));
      
      // Handle file uploads correctly
      if (workshopData.bannerDesktop?.file) {
        formData.append('bannerDesktop', workshopData.bannerDesktop.file);
      }
      if (workshopData.bannerMobile?.file) {
        formData.append('bannerMobile', workshopData.bannerMobile.file);
      }
      if (workshopData.lecturer?.photo?.file) {
        formData.append('lecturerPhoto', workshopData.lecturer.photo.file);
      }
   
      
      const response = await fetch(API_CONFIG.getUrl(`workshops/${workshopId}`), {
        method: 'PUT',
        body: formData
      });
  
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    } catch (error) {
      console.error('Error updating workshop:', error);
      throw error;
    }
  },
  // New method for updating workshop duration
  async updateDuration(workshopId, duration) {
    try {
      const response = await fetch(API_CONFIG.getUrl(`${WORKSHOP_ENDPOINT}/${workshopId}/duration`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(duration)
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    } catch (error) {
      console.error('Error updating workshop duration:', error);
      throw error;
    }
  },

  // New method for updating registration status
  async updateRegistrationStatus(workshopId, registrationData) {
    try {
      const response = await fetch(API_CONFIG.getUrl(`${WORKSHOP_ENDPOINT}/${workshopId}/registration`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    } catch (error) {
      console.error('Error updating registration status:', error);
      throw error;
    }
  },

  async deleteWorkshop(workshopId) {
    try {
      const response = await fetch(API_CONFIG.getUrl(`${WORKSHOP_ENDPOINT}/${workshopId}`), {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    } catch (error) {
      console.error('Error deleting workshop:', error);
      throw error;
    }
  },

  async getWorkshopsByDepartment(deptId, options = {}) {
    try {
      const { status, page, limit, search } = options;
      const queryParams = new URLSearchParams({
        ...(status && { status }),
        ...(page && { page: page.toString() }),
        ...(limit && { limit: limit.toString() }),
        ...(search && { search })
      });

      const url = API_CONFIG.getUrl(`${WORKSHOP_ENDPOINT}/departments/${deptId}/workshops?${queryParams}`);
      const response = await fetch(url);
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    } catch (error) {
      console.error('Error fetching department workshops:', error);
      throw error;
    }
  },

  async getOne(workshopId) {
    try {
      const response = await fetch(API_CONFIG.getUrl(`${WORKSHOP_ENDPOINT}/${workshopId}`));
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    } catch (error) {
      console.error('Error fetching workshop details:', error);
      throw error;
    }
  }
};