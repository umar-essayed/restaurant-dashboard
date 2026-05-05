import api from './api';

const reviewService = {
  getRestaurantReviews: async (restaurantId, page = 1, limit = 20) => {
    const response = await api.get(`/reviews/restaurant/${restaurantId}`, {
      params: { page, limit }
    });
    return response.data;
  },

  replyToReview: async (reviewId, reply) => {
    const response = await api.patch(`/reviews/${reviewId}/reply`, { reply });
    return response.data;
  }
};

export default reviewService;
