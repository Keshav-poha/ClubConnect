import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventSlice, createEventSlice } from './eventSlice';
import { ClubSlice, createClubSlice } from './clubSlice';
import { BookmarkSlice, createBookmarkSlice } from './bookmarkSlice';
import { UiSlice, createUiSlice } from './uiSlice';
import { ApplicationSlice, createApplicationSlice } from './applicationSlice';

export type StoreState = EventSlice & ClubSlice & BookmarkSlice & UiSlice & ApplicationSlice;

export const useStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...createEventSlice(...a),
      ...createClubSlice(...a),
      ...createBookmarkSlice(...a),
      ...createUiSlice(...a),
      ...createApplicationSlice(...a),
    }),
    {
      name: 'clubconnect-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        bookmarkedEvents: state.bookmarkedEvents,
        events: state.events.slice(0, 20), // Cache first page of events
        featuredEvents: state.featuredEvents,
        themeMode: state.themeMode,
      }),
    }
  )
);
