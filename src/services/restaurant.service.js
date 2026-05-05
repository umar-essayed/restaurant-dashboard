import api from './api';

const restaurantService = {
  getMyRestaurants: async () => {
    const response = await api.get('/vendor/restaurants/my');
    return response.data;
  },

  createRestaurant: async (data) => {
    const response = await api.post('/vendor/restaurants', data);
    return response.data;
  },

  updateRestaurant: async (id, data) => {
    const response = await api.patch(`/vendor/restaurants/${id}`, data);
    return response.data;
  },

  updateDeliverySettings: async (id, data) => {
    const response = await api.patch(`/vendor/restaurants/${id}/delivery-settings`, data);
    return response.data;
  },

  toggleOpen: async (id, isOpen) => {
    const response = await api.patch(`/vendor/restaurants/${id}/toggle-open`, { isOpen });
    return response.data;
  },

  getStats: async (id) => {
    const response = await api.get(`/vendor/restaurants/${id}/stats`);
    return response.data;
  },
  
  getMenu: async (id) => {
    const response = await api.get(`/vendor/restaurants/${id}/menu`);
    return response.data;
  },

  getAnalytics: async (id, range = 'thisWeek') => {
    const response = await api.get(`/vendor/restaurants/${id}/analytics`, {
      params: { range }
    });
    return response.data;
  }
};

export default restaurantService;
