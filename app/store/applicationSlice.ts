import { StateCreator } from 'zustand';
import { Application } from '@/types';
import { api } from '@/services/api';

export interface ApplicationSlice {
  applications: Application[];
  isLoadingApplications: boolean;
  errorApplications: string | null;
  fetchApplicationsBySociety: (societyId: string) => Promise<void>;
  submitApplication: (applicationId: string, data: Record<string, any>) => Promise<void>;

  // Admin state
  adminToken: string | null;
  adminForms: any[];
  adminResponses: Record<string, any[]>;
  adminLogin: (username: string, password: string) => Promise<void>;
  adminLogout: () => void;
  fetchAdminForms: () => Promise<void>;
  adminCreateForm: (data: any) => Promise<void>;
  fetchAdminResponses: (formId: string) => Promise<void>;
}

export const createApplicationSlice: StateCreator<ApplicationSlice> = (set, get) => ({
  applications: [],
  isLoadingApplications: false,
  errorApplications: null,

  adminToken: null,
  adminForms: [],
  adminResponses: {},

  fetchApplicationsBySociety: async (societyId: string) => {
    set({ isLoadingApplications: true, errorApplications: null });
    try {
      const { data } = await api.get(`/clubs/${societyId}/forms`);
      set({ applications: data, isLoadingApplications: false });
    } catch (error: any) {
      set({ errorApplications: error.message, isLoadingApplications: false });
    }
  },

  submitApplication: async (applicationId: string, formData: Record<string, any>) => {
    set({ isLoadingApplications: true, errorApplications: null });
    try {
      const answers = Object.keys(formData).map((fieldId) => ({
        field_id: fieldId,
        value: formData[fieldId]?.toString() || '',
      }));
      await api.post(`/forms/${applicationId}/submit`, {
        student_id: 'anonymous', // In real app, fetch from auth
        student_name: 'Anonymous Student',
        answers,
      });
      set({ isLoadingApplications: false });
    } catch (error: any) {
      set({ errorApplications: error.message, isLoadingApplications: false });
      throw error;
    }
  },

  adminLogin: async (username, password) => {
    try {
      const { data } = await api.post('/society/login', { username, password });
      set({ adminToken: data.token });
      // update api defaults for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  adminLogout: () => {
    set({ adminToken: null, adminForms: [], adminResponses: {} });
    delete api.defaults.headers.common['Authorization'];
  },

  fetchAdminForms: async () => {
    try {
      const { data } = await api.get('/society/forms');
      set({ adminForms: data });
    } catch (error: any) {
      console.error('Failed to fetch admin forms', error);
    }
  },

  adminCreateForm: async (formData) => {
    try {
      await api.post('/society/forms', formData);
      await get().fetchAdminForms(); // refresh list
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create form');
    }
  },

  fetchAdminResponses: async (formId) => {
    set({ isLoadingApplications: true });
    try {
      const { data } = await api.get(`/society/forms/${formId}/responses`);
      set((state) => ({
        adminResponses: {
          ...state.adminResponses,
          [formId]: data,
        },
        isLoadingApplications: false,
      }));
    } catch (error: any) {
      set({ isLoadingApplications: false });
      console.error('Failed to fetch responses', error);
    }
  },
});
