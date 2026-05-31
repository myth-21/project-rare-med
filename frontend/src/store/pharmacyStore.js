import { create } from 'zustand';

const usePharmacyStore = create((set) => ({
  selectedCity: '',
  setSelectedCity: (selectedCity) => set({ selectedCity }),
}));

export default usePharmacyStore;
