import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventSlice, createEventSlice } from './eventSlice';
import { ClubSlice, createClubSlice } from './clubSlice';
import { BookmarkSlice, createBookmarkSlice } from './bookmarkSlice';

export type StoreState = EventSlice & ClubSlice & BookmarkSlice;

export const useStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...createEventSlice(...a),
      ...createClubSlice(...a),
      ...createBookmarkSlice(...a),
    }),
    {
      name: 'clubconnect-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ bookmarkedEvents: state.bookmarkedEvents }), // Only persist bookmarks
    }
  )
);
