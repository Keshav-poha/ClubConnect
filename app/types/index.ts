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
  date: string;
  location: string;
  attendance?: string;
  image_url?: string;
  instagram_url?: string;
  post_id: string;
  is_featured: boolean;
  club?: Club;
}
