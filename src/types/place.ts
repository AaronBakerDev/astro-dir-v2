export interface Place {
  id: number;
  search_entry_id: number;
  position: number;
  title: string;
  rating?: number;
  rating_count?: number;
  category?: string;
  phone_number?: string;
  website?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  cid?: string;
  created_at: string;
  slug?: string;
  location?: string;
  city?: string;
  province_state?: string;
  query_id?: number;
  query_text?: string;
}
