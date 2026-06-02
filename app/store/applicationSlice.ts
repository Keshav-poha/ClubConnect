import { StateCreator } from 'zustand';
import { Application, ApplicationResponse } from '@/types';

// Temporary mock data until backend is ready
const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    club_id: 'club-1', // Make sure this matches a real club ID in the DB (or is resilient to missing clubs)
    title: 'Core Committee Recruitment',
    description: 'Join the core team to help organize our biggest events this semester.',
    deadline: '2026-06-15T23:59:59Z',
    status: 'open',
    fields: [
      { id: 'f-1', type: 'text', label: 'Full Name', required: true },
      { id: 'f-2', type: 'text', label: 'Student ID', required: true },
      {
        id: 'f-3',
        type: 'dropdown',
        label: 'Role of Interest',
        required: true,
        options: ['Technical', 'Design', 'Management', 'Marketing'],
      },
      { id: 'f-4', type: 'checkbox', label: 'I can commit to 5 hours a week', required: true },
      { id: 'f-5', type: 'file', label: 'Resume (PDF)', required: false },
    ],
  },
  {
    id: 'app-2',
    club_id: 'club-2',
    title: 'Annual Tech Event Registration',
    description: 'Register for the upcoming Hackathon. Teams can be up to 4 people.',
    deadline: '2026-06-10T12:00:00Z',
    status: 'open',
    fields: [
      { id: 'f-1', type: 'text', label: 'Team Name', required: true },
      {
        id: 'f-2',
        type: 'dropdown',
        label: 'Experience Level',
        required: true,
        options: ['Beginner', 'Intermediate', 'Advanced'],
      },
      { id: 'f-3', type: 'text', label: 'Dietary Restrictions', required: false },
      { id: 'f-4', type: 'checkbox', label: 'I agree to the code of conduct', required: true },
    ],
  },
];

export interface ApplicationSlice {
  applications: Application[];
  isLoadingApplications: boolean;
  errorApplications: string | null;
  fetchApplicationsBySociety: (societyId: string) => Promise<void>;
  submitApplication: (applicationId: string, data: Record<string, any>) => Promise<void>;
}

export const createApplicationSlice: StateCreator<ApplicationSlice> = (set, get) => ({
  applications: [],
  isLoadingApplications: false,
  errorApplications: null,

  fetchApplicationsBySociety: async (societyId: string) => {
    set({ isLoadingApplications: true, errorApplications: null });
    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Filter mock applications by societyId
      // Fallback: If no apps for this society, show the mock apps anyway for demo purposes
      let filtered = MOCK_APPLICATIONS.filter((app) => app.club_id === societyId);
      if (filtered.length === 0) {
        // For demonstration, map the mock apps to the requested society
        filtered = MOCK_APPLICATIONS.map((app) => ({ ...app, club_id: societyId }));
      }

      set({ applications: filtered, isLoadingApplications: false });
    } catch (error: any) {
      set({ errorApplications: error.message, isLoadingApplications: false });
    }
  },

  submitApplication: async (applicationId: string, data: Record<string, any>) => {
    set({ isLoadingApplications: true, errorApplications: null });
    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`Submitted application ${applicationId} with data:`, data);

      // In a real app, this would be an API call
      set({ isLoadingApplications: false });
    } catch (error: any) {
      set({ errorApplications: error.message, isLoadingApplications: false });
      throw error;
    }
  },
});
