import api from './api';
export const getReports = (params) => api.get('/reports', { params });
export const createReport = (payload) => api.post('/reports', payload);
