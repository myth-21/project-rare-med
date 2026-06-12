import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setSession: ({ token, user }) => {
        if (token) {
          localStorage.setItem('raremed_token', token);
        } else {
          localStorage.removeItem('raremed_token');
        }
        set({ token, user });
      },
      login: async ({ email, password }) => {
        const data = await authService.login({ email, password });

        if (!data?.token || !data?.user) {
          throw new Error(data?.message || 'Login failed.');
        }

        get().setSession({ token: data.token, user: data.user });
        return data;
      },
      register: async ({ name, email, password, confirmPassword, phoneNumber }) => {
        const data = await authService.register({ name, email, password, confirmPassword, phoneNumber });

        if (!data?.token || !data?.user) {
          throw new Error(data?.message || 'Registration failed.');
        }

        get().setSession({ token: data.token, user: data.user });
        return data;
      },
      logout: () => {
        localStorage.removeItem('raremed_token');
        set({ token: null, user: null });
      },
      updateProfile: async (profileData) => {
        const data = await authService.updateProfile(profileData);
        if (!data?.user) {
          throw new Error(data?.message || 'Profile update failed.');
        }
        set({ user: data.user });
        return data.user;
      },
      refreshProfile: async () => {
        const token = get().token;
        if (!token) {
          return null;
        }

        const user = await authService.getProfile();
        set({ user });
        return user;
      },
    }),
    {
      name: 'rare-med-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    },
  ),
);

export default useAuthStore;
