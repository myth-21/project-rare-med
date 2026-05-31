import api from './api';
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminAnalytics = () => api.get('/admin/analytics');
