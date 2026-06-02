import { StateCreator } from 'zustand';
import { Event } from '@/types';

export interface BookmarkSlice {
  bookmarkedEvents: Event[];
  toggleBookmark: (event: Event) => void;
  isBookmarked: (eventId: string) => boolean;
}

export const createBookmarkSlice: StateCreator<BookmarkSlice> = (set, get) => ({
  bookmarkedEvents: [],
  toggleBookmark: (event: Event) => {
    const { bookmarkedEvents } = get();
    const exists = bookmarkedEvents.some((e) => e.id === event.id);

    if (exists) {
      set({ bookmarkedEvents: bookmarkedEvents.filter((e) => e.id !== event.id) });
    } else {
      set({ bookmarkedEvents: [...bookmarkedEvents, event] });
    }
  },
  isBookmarked: (eventId: string) => {
    return get().bookmarkedEvents.some((e) => e.id === eventId);
  },
});
