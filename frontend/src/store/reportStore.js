import { create } from 'zustand';

const useReportStore = create((set) => ({
  statusFilter: '',
  setStatusFilter: (statusFilter) => set({ statusFilter }),
}));

export default useReportStore;
