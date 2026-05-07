import api from './api';

const driverService = {
  async getAvailableDrivers(lat, lng) {
    const params = new URLSearchParams();
    if (lat) params.append('lat', lat);
    if (lng) params.append('lng', lng);
    
    const response = await api.get(`/drivers/available?${params.toString()}`);
    return response.data;
  },
};

export default driverService;
