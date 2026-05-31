import useAuthStore from './authStore.js';

export const AuthProvider = ({ children }) => children;

export const useAuthContext = () => useAuthStore();
