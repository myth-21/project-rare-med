import api from './api';
export const login = (payload) => api.post('/auth/login', payload);
export const register = (payload) => api.post('/auth/register', payload);
export const forgotPassword = (payload) => api.post('/auth/forgot-password', payload);
export const getProfile = () => api.get('/auth/profile');
export const logout = () => {
  localStorage.removeItem('raremed_token');
  localStorage.removeItem('raremed_user');
};
