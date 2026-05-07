import api from './api';

const driverService = {
  getAvailableDrivers: async () => {
    const response = await api.get('/drivers/available');
    return response.data;
  },
};

export default driverService;
