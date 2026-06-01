import { StateCreator } from 'zustand';
import { Event } from '@/types';
import { api } from '@/services/api';

const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

export interface EventSlice {
  events: Event[];
  featuredEvents: Event[];
  isLoadingEvents: boolean;
  isFetchingMore: boolean;
  errorEvents: string | null;
  currentPage: number;
  hasMore: boolean;
  timeFilter: 'upcoming' | 'past';
  setTimeFilter: (filter: 'upcoming' | 'past') => void;
  fetchEvents: (page?: number, limit?: number, clubId?: string, timeFilter?: 'upcoming' | 'past') => Promise<void>;
  loadMoreEvents: (limit?: number, clubId?: string) => Promise<void>;
  fetchFeaturedEvents: () => Promise<void>;
}

export const createEventSlice: StateCreator<EventSlice> = (set, get) => ({
  events: [],
  featuredEvents: [],
  isLoadingEvents: false,
  isFetchingMore: false,
  errorEvents: null,
  currentPage: 1,
  hasMore: true,
  timeFilter: 'upcoming',
  setTimeFilter: (timeFilter) => set({ timeFilter }),
  fetchEvents: async (page = 1, limit = 20, clubId?: string, timeFilter?: 'upcoming' | 'past') => {
    const activeTimeFilter = timeFilter !== undefined ? timeFilter : get().timeFilter;
    set({ isLoadingEvents: true, errorEvents: null, currentPage: page, timeFilter: activeTimeFilter });
    try {
      const params: any = { page, limit };
      if (clubId && clubId !== 'all') {
        params.club_id = clubId;
      }
      if (activeTimeFilter === 'past') {
        params.to = getTodayDateString();
      }
      const response = await api.get('/events', { params });
      const newEvents = response.data.events || [];
      set({ 
        events: newEvents, 
        isLoadingEvents: false,
        hasMore: newEvents.length === limit,
      });
    } catch (error: any) {
      set({ errorEvents: error.message, isLoadingEvents: false });
    }
  },
  loadMoreEvents: async (limit = 20, clubId?: string) => {
    const { currentPage, isFetchingMore, hasMore, events, timeFilter } = get();
    if (isFetchingMore || !hasMore) return;

    set({ isFetchingMore: true });
    const nextPage = currentPage + 1;
    
    try {
      const params: any = { page: nextPage, limit };
      if (clubId && clubId !== 'all') {
        params.club_id = clubId;
      }
      if (timeFilter === 'past') {
        params.to = getTodayDateString();
      }
      const response = await api.get('/events', { params });
      const moreEvents = response.data.events || [];
      
      set({ 
        events: [...events, ...moreEvents],
        isFetchingMore: false,
        currentPage: nextPage,
        hasMore: moreEvents.length === limit,
      });
    } catch (error: any) {
      // Don't overwrite the main errorEvents to avoid wiping out the feed, just stop fetching
      set({ isFetchingMore: false });
    }
  },
  fetchFeaturedEvents: async () => {
    set({ isLoadingEvents: true, errorEvents: null });
    try {
      const response = await api.get('/events', { params: { featured: true } });
      set({ featuredEvents: response.data.events || [], isLoadingEvents: false });
    } catch (error: any) {
      set({ errorEvents: error.message, isLoadingEvents: false });
    }
  },
});

