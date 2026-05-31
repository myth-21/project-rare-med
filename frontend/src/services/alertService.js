import api from './api';
export const getAlerts = () => api.get('/alerts');
export const createAlert = (payload) => api.post('/alerts', payload);
