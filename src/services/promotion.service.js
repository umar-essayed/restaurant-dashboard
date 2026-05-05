import api from './api';

const promotionService = {
  getPromotions: async (restaurantId) => {
    const response = await api.get(`/promotions/vendor/${restaurantId}`);
    return response.data;
  },

  createPromotion: async (restaurantId, data) => {
    const response = await api.post(`/promotions/vendor/${restaurantId}`, data);
    return response.data;
  },

  updatePromotion: async (restaurantId, id, data) => {
    const response = await api.patch(`/promotions/vendor/${restaurantId}/${id}`, data);
    return response.data;
  },

  deletePromotion: async (restaurantId, id) => {
    const response = await api.delete(`/promotions/vendor/${restaurantId}/${id}`);
    return response.data;
  }
};

export default promotionService;
