import { create } from 'zustand';

const useAlertStore = create((set) => ({
  preferences: { email: true, inApp: true },
  setPreferences: (preferences) => set({ preferences }),
}));

export default useAlertStore;
