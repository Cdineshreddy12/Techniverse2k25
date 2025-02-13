import API_CONFIG from '../src/config/api.js';

const WORKSHOP_ENDPOINT = 'workshops';

export const workshopService = {
  async getAll() {
    try {
      const response = await fetch(API_CONFIG.getUrl(WORKSHOP_ENDPOINT));
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
      
      // Handle banner images
      if (workshopData.bannerDesktop?.file) {
        formData.append('bannerDesktop', workshopData.bannerDesktop.file);
      } else if (workshopData.bannerDesktop instanceof Blob) {
        formData.append('bannerDesktop', workshopData.bannerDesktop);
      }
  
      if (workshopData.bannerMobile?.file) {
        formData.append('bannerMobile', workshopData.bannerMobile.file);
      } else if (workshopData.bannerMobile instanceof Blob) {
        formData.append('bannerMobile', workshopData.bannerMobile);
      }
  
      // Handle lecturer photos
      workshopData.lecturers?.forEach((lecturer, index) => {
        if (lecturer.photo?.file) {
          formData.append(`lecturerPhoto_${index}`, lecturer.photo.file);
        } else if (lecturer.photo instanceof Blob) {
          formData.append(`lecturerPhoto_${index}`, lecturer.photo);
        }
      });
  
      // Clean the data before sending
      const cleanData = {
        ...workshopData,
        // Remove blob URLs and file objects
        bannerDesktop: typeof workshopData.bannerDesktop === 'string' ? workshopData.bannerDesktop : null,
        bannerMobile: typeof workshopData.bannerMobile === 'string' ? workshopData.bannerMobile : null,
        lecturers: workshopData.lecturers?.map(lecturer => ({
          ...lecturer,
          photo: typeof lecturer.photo === 'string' ? lecturer.photo : null
        }))
      };
  
      // Append the cleaned workshop data
      formData.append('workshopData', JSON.stringify(cleanData));
  
      const response = await fetch(API_CONFIG.getUrl('workshops'), {
        method: 'POST',
        body: formData
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw {
          status: response.status,
          message: data.error || 'Failed to create workshop',
          details: data
        };
      }
  
      return data;
    } catch (error) {
      console.error('Error creating workshop:', error);
      throw error;
    }
  }
,

async updateWorkshop(workshopId, workshopData) {
  try {
    const formData = new FormData();
    
    // Handle banner images
    if (workshopData.bannerDesktop?.file) {
      formData.append('bannerDesktop', workshopData.bannerDesktop.file);
    }
    if (workshopData.bannerMobile?.file) {
      formData.append('bannerMobile', workshopData.bannerMobile.file);
    }
    
    // Handle lecturer photos
    workshopData.lecturers?.forEach((lecturer, index) => {
      if (lecturer.photo?.file) {
        formData.append(`lecturerPhoto_${index}`, lecturer.photo.file);
      }
    });

    // Clean data for JSON
    const cleanData = {
      ...workshopData,
      bannerDesktop: workshopData.bannerDesktop?.url || workshopData.bannerDesktop || null,
      bannerMobile: workshopData.bannerMobile?.url || workshopData.bannerMobile || null,
      lecturers: workshopData.lecturers?.map(lecturer => ({
        name: lecturer.name,
        title: lecturer.title,
        role: lecturer.role,
        photo: lecturer.photo?.url || lecturer.photo || null, // Handle both string and object formats
        specifications: lecturer.specifications || [],
        order: lecturer.order || 0
      }))
    };

    // Append cleaned data as JSON
    formData.append('workshopData', JSON.stringify(cleanData));

    const response = await fetch(API_CONFIG.getUrl(`workshops/${workshopId}`), {
      method: 'PUT',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw {
        status: response.status,
        message: errorData.error || 'Failed to update workshop',
        details: errorData
      };
    }

    const data = await response.json();
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

      // Updated URL structure to match server routes
      const url = API_CONFIG.getUrl(`departments/${deptId}/workshops?${queryParams}`);
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