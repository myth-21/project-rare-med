import { create } from 'zustand';

const useMedicineStore = create((set) => ({
  saved: [],
  recentSearches: [],
  saveMedicine: (medicine) => set((state) => ({ saved: [medicine, ...state.saved.filter((item) => item._id !== medicine._id)].slice(0, 12) })),
  addSearch: (term) => set((state) => ({ recentSearches: [term, ...state.recentSearches.filter((item) => item !== term)].slice(0, 8) })),
}));

export default useMedicineStore;
