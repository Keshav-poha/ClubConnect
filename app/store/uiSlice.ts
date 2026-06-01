import { StateCreator } from 'zustand';
import { ToastType } from '@/components/Toast';

export interface ToastConfig {
  message: string;
  type?: ToastType;
}

export interface UiSlice {
  toast: ToastConfig | null;
  showToast: (config: ToastConfig) => void;
  hideToast: () => void;
  themeMode: 'light' | 'dark';
  toggleTheme: () => void;
}

export const createUiSlice: StateCreator<UiSlice> = (set) => ({
  toast: null,
  showToast: (config: ToastConfig) => {
    set({ toast: config });
  },
  hideToast: () => {
    set({ toast: null });
  },
  themeMode: 'light',
  toggleTheme: () => set((state) => ({ themeMode: state.themeMode === 'light' ? 'dark' : 'light' })),
});
