import api from './api';

const orderService = {
  getVendorOrders: async (restaurantId, filters = {}) => {
    const response = await api.get('/vendor/orders', {
      params: { restaurantId, ...filters },
    });
    return response.data;
  },

  updateStatus: async (orderId, status) => {
    const response = await api.patch(`/vendor/orders/${orderId}/status`, { status });
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  dispatchOrder: async (id) => {
    const response = await api.post(`/vendor/orders/${id}/dispatch`);
    return response.data;
  },
};

export default orderService;
