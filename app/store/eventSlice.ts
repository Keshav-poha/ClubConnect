import { StateCreator } from 'zustand';
import { Event } from '@/types';
import { api } from '@/services/api';

export interface EventSlice {
  events: Event[];
  featuredEvents: Event[];
  isLoadingEvents: boolean;
  errorEvents: string | null;
  fetchEvents: (page?: number, limit?: number) => Promise<void>;
  fetchFeaturedEvents: () => Promise<void>;
}

export const createEventSlice: StateCreator<EventSlice> = (set) => ({
  events: [],
  featuredEvents: [],
  isLoadingEvents: false,
  errorEvents: null,
  fetchEvents: async (page = 1, limit = 20) => {
    set({ isLoadingEvents: true, errorEvents: null });
    try {
      const response = await api.get('/events', { params: { page, limit } });
      set({ events: response.data.data, isLoadingEvents: false });
    } catch (error: any) {
      set({ errorEvents: error.message, isLoadingEvents: false });
    }
  },
  fetchFeaturedEvents: async () => {
    set({ isLoadingEvents: true, errorEvents: null });
    try {
      const response = await api.get('/events', { params: { featured: true } });
      set({ featuredEvents: response.data.data, isLoadingEvents: false });
    } catch (error: any) {
      set({ errorEvents: error.message, isLoadingEvents: false });
    }
  },
});
