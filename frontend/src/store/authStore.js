import { create } from 'zustand';
import api from '../services/api';

const readSavedUser = () => {
  try {
    const savedUser = localStorage.getItem('raremed_user');
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    localStorage.removeItem('raremed_user');
    return null;
  }
};

const useAuthStore = create((set, get) => ({
  user: readSavedUser(),
  token: localStorage.getItem('raremed_token'),
  loading: false,
  setSession: ({ token, user }) => {
    if (token) localStorage.setItem('raremed_token', token);
    if (user !== undefined) localStorage.setItem('raremed_user', JSON.stringify(user));
    set({ token, user });
  },
  login: async (payload) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/login', payload);
      get().setSession(data);
      return data;
    } finally {
      set({ loading: false });
    }
  },
  register: async (payload) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/register', payload);
      get().setSession({ token: data.token, user: data.user });
      return data;
    } finally {
      set({ loading: false });
    }
  },
  refreshProfile: async () => {
    const { data } = await api.get('/auth/profile');
    localStorage.setItem('raremed_user', JSON.stringify(data.user));
    set({ user: data.user });
  },
  updateProfile: async (payload) => {
    const { data } = await api.put('/auth/profile', payload);
    localStorage.setItem('raremed_user', JSON.stringify(data.user));
    set({ user: data.user });
    return data.user;
  },
  logout: () => {
    localStorage.removeItem('raremed_token');
    localStorage.removeItem('raremed_user');
    set({ token: null, user: null });
  },
}));

export default useAuthStore;
