export type TripType = 'solo' | 'couple' | 'group';
export type TripPace = 'relaxed' | 'moderate' | 'fast-paced';
export type TripStatus = 'draft' | 'planned' | 'active' | 'completed' | 'archived';
export type ItemType = 'attraction' | 'dining' | 'accommodation' | 'transport' | 'activity';
export type TravelMode = 'walking' | 'transit' | 'driving' | 'taxi' | 'biking';
export type MemberRole = 'owner' | 'editor' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface TripMember {
  id: string;
  trip_id: string;
  user_id?: string;
  name: string;
  email?: string;
  role: MemberRole;
  dietary_preferences: string[];
  pace_preference?: TripPace;
  budget_preference?: number;
  notes?: string;
  joined_at: string;
}

export interface ItineraryItem {
  id: string;
  day_id: string;
  trip_id: string;
  type: ItemType;
  title: string;
  description: string;
  location_name: string;
  lat: number;
  lng: number;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  cost: number;
  travel_time_minutes: number;
  travel_mode: TravelMode;
  order_index: number;
  is_locked: boolean;
  booking_url?: string;
  rating?: number;
  tips?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ItineraryDay {
  id: string;
  trip_id: string;
  day_number: number;
  date: string;
  title?: string;
  theme?: string;
  notes?: string;
  items: ItineraryItem[];
  created_at?: string;
  updated_at?: string;
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  travelers: number;
  trip_type: TripType;
  budget: number;
  budget_currency: string;
  pace: TripPace;
  interests: string[];
  status: TripStatus;
  share_token: string;
  cover_image?: string;
  ai_summary?: string;
  days_count?: number;
  total_cost?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TripDetail extends Trip {
  days: ItineraryDay[];
  members: TripMember[];
}

export interface AlternativeOption {
  title: string;
  description: string;
  location_name: string;
  lat: number;
  lng: number;
  type: ItemType;
  cost: number;
  duration_minutes: number;
  rating: number;
  reason_recommended: string;
}

export interface SuggestAlternativesResponse {
  original_item_id: string;
  original_title: string;
  alternatives: AlternativeOption[];
}

export interface CostCategoryBreakdown {
  category: ItemType;
  amount: number;
  percentage: number;
  item_count: number;
}

export interface DayCostBreakdown {
  day_number: number;
  date: string;
  amount: number;
}

export interface CostSummary {
  trip_id: string;
  budget: number;
  total_cost: number;
  remaining_budget: number;
  is_over_budget: boolean;
  over_budget_amount: number;
  per_person_cost: number;
  travelers_count: number;
  currency: string;
  categories: CostCategoryBreakdown[];
  days: DayCostBreakdown[];
  warning_message?: string;
}
