import { Event } from '@/types';

export type RootStackParamList = {
  MainTabs: undefined;
  EventDetail: { event: Event };
  PrivacyPolicy: undefined;
  SocietyApplicationsList: { societyId: string; societyName: string };
  ApplicationForm: { applicationId: string };
  AdminLogin: undefined;
  AdminDashboard: undefined;
  AdminCreateForm: undefined;
  AdminFormResponses: { formId: string; formTitle: string };
};
