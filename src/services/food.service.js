import api from './api';

const foodService = {
  // Sections
  createSection: async (data) => {
    const response = await api.post('/vendor/menu-sections', data);
    return response.data;
  },

  updateSection: async (id, data) => {
    const response = await api.patch(`/vendor/menu-sections/${id}`, data);
    return response.data;
  },

  deleteSection: async (id) => {
    const response = await api.delete(`/vendor/menu-sections/${id}`);
    return response.data;
  },

  // Food Items
  createFoodItem: async (data) => {
    const response = await api.post('/vendor/food-items', data);
    return response.data;
  },

  updateFoodItem: async (id, data) => {
    const response = await api.patch(`/vendor/food-items/${id}`, data);
    return response.data;
  },

  deleteFoodItem: async (id) => {
    const response = await api.delete(`/vendor/food-items/${id}`);
    return response.data;
  },

  toggleAvailability: async (id, isAvailable) => {
    const response = await api.patch(`/vendor/food-items/${id}/availability`, { isAvailable });
    return response.data;
  },
};

export default foodService;
