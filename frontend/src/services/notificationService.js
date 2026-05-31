import api from './api.js';

const createAlert = async (payload, token) => {
  return api.request('/admin/alerts', 'POST', payload, token);
};

const getAlerts = async (token) => {
  return api.request('/admin/alerts/my', 'GET', null, token);
};

const updateAlert = async (id, payload, token) => {
  return api.request(`/admin/alerts/${id}`, 'PUT', payload, token);
};

const deleteAlert = async (id, token) => {
  return api.request(`/admin/alerts/${id}`, 'DELETE', null, token);
};

export default { createAlert, getAlerts, updateAlert, deleteAlert };
