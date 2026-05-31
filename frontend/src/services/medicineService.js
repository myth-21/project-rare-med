import api from './api';
export const getMedicines = (params) => api.get('/medicines', { params });
export const getMedicine = (id) => api.get(`/medicines/${id}`);
