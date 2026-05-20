import { StateCreator } from 'zustand';
import { Club } from '@/types';
import { api } from '@/services/api';

export interface ClubSlice {
  clubs: Club[];
  isLoadingClubs: boolean;
  errorClubs: string | null;
  fetchClubs: () => Promise<void>;
}

export const createClubSlice: StateCreator<ClubSlice> = (set) => ({
  clubs: [],
  isLoadingClubs: false,
  errorClubs: null,
  fetchClubs: async () => {
    set({ isLoadingClubs: true, errorClubs: null });
    try {
      const response = await api.get('/clubs');
      set({ clubs: response.data.data, isLoadingClubs: false });
    } catch (error: any) {
      set({ errorClubs: error.message, isLoadingClubs: false });
    }
  },
});
