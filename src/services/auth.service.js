import api from './api';

const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/email/login', { email, password });
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('isAuthenticated', 'true');
    }
    return response.data;
  },

  register: async (data) => {
    const response = await api.post('/auth/email/register', { ...data, role: 'VENDOR' });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
  },


};

export default authService;
