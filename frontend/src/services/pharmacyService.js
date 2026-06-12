import api from './api';
export const getPharmacies = (params) => api.get('/pharmacies', { params });
export const getNearbyPharmacies = (params) => api.get('/pharmacies/nearby', { params });
export const getPharmacy = (id) => api.get(`/pharmacies/${id}`);
