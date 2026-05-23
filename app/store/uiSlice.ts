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
}

export const createUiSlice: StateCreator<UiSlice> = (set) => ({
  toast: null,
  showToast: (config: ToastConfig) => {
    set({ toast: config });
  },
  hideToast: () => {
    set({ toast: null });
  },
});
