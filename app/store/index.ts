import { create } from 'zustand';
import { createEventSlice, EventSlice } from './eventSlice';
import { createClubSlice, ClubSlice } from './clubSlice';

export type StoreState = EventSlice & ClubSlice;

export const useStore = create<StoreState>()((...a) => ({
  ...createEventSlice(...a),
  ...createClubSlice(...a),
}));
