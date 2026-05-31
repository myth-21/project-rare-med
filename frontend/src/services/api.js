import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('raremed_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isPublicRead =
      error.config?.method === 'get' &&
      (url.includes('/medicines') || url.includes('/pharmacies') || url.includes('/health'));
    if (error.response?.status === 401 && !isPublicRead) {
      localStorage.removeItem('raremed_token');
      localStorage.removeItem('raremed_user');
    }
    return Promise.reject(error);
  }
);

export default api;
