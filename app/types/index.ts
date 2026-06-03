export interface Club {
  id: string;
  name: string;
  handle: string;
  bio?: string;
  avatar_url?: string;
  is_verified: boolean;
}

export interface Event {
  id: string;
  club_id: string;
  title: string;
  description: string;
  date: string; // ISO-8601 string
  location: string;
  attendance?: string;
  image_url?: string;
  instagram_url?: string;
  post_id: string;
  is_featured: boolean;
  club?: Club;
}

export interface ApplicationField {
  id: string;
  type: 'text' | 'dropdown' | 'checkbox' | 'file';
  label: string;
  required: boolean;
  options?: string[]; // Used for dropdowns
}

export interface Application {
  id: string;
  club_id: string;
  title: string;
  description: string;
  deadline?: string; // ISO-8601 string
  status: 'open' | 'closed';
  fields: ApplicationField[];
}

export interface ApplicationResponse {
  id: string;
  application_id: string;
  user_id: string;
  submitted_at: string; // ISO-8601 string
  data: Record<string, any>;
}
