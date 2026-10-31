import {
  Trip,
  TripDetail,
  CostSummary,
  SuggestAlternativesResponse,
  ItineraryItem,
  TripMember,
  UserProfile
} from '../types';

const API_BASE = '/api/v1';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('wayfare_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text();
    let message = 'An error occurred';
    try {
      const parsed = JSON.parse(errorText);
      message = parsed.detail || parsed.message || message;
    } catch {
      message = errorText || message;
    }
    throw new Error(message);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(email: string, fullName?: string): Promise<{ access_token: string; user: UserProfile }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, full_name: fullName }),
    });
    return handleResponse(res);
  },

  async getCurrentUser(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getDemoPersonas(): Promise<UserProfile[]> {
    const res = await fetch(`${API_BASE}/auth/demo-personas`);
    return handleResponse(res);
  },

  // Trips
  async getTrips(search?: string, tripType?: string): Promise<Trip[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (tripType && tripType !== 'all') params.append('trip_type', tripType);
    const res = await fetch(`${API_BASE}/trips?${params.toString()}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async getTrip(tripId: string): Promise<TripDetail> {
    const res = await fetch(`${API_BASE}/trips/${tripId}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  async createTrip(data: Partial<Trip>): Promise<Trip> {
    const res = await fetch(`${API_BASE}/trips`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateTrip(tripId: string, data: Partial<Trip>): Promise<Trip> {
    const res = await fetch(`${API_BASE}/trips/${tripId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteTrip(tripId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/trips/${tripId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete trip');
  },

  async getCostSummary(tripId: string): Promise<CostSummary> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/cost-summary`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Itinerary AI
  async generateItinerary(tripId: string, customPrompt?: string): Promise<TripDetail> {
    const res = await fetch(`${API_BASE}/itinerary/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ trip_id: tripId, custom_prompt: customPrompt }),
    });
    return handleResponse(res);
  },

  async regenerateDay(dayId: string, instructions?: string): Promise<TripDetail> {
    const res = await fetch(`${API_BASE}/itinerary/regenerate-day`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ day_id: dayId, instructions }),
    });
    return handleResponse(res);
  },

  async suggestAlternatives(itemId: string, preferenceOverride?: string): Promise<SuggestAlternativesResponse> {
    const res = await fetch(`${API_BASE}/itinerary/items/suggest-alternatives`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ item_id: itemId, preference_override: preferenceOverride }),
    });
    return handleResponse(res);
  },

  // Items
  async createItem(item: Partial<ItineraryItem>): Promise<ItineraryItem> {
    const res = await fetch(`${API_BASE}/itinerary/items`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(item),
    });
    return handleResponse(res);
  },

  async updateItem(itemId: string, item: Partial<ItineraryItem>): Promise<ItineraryItem> {
    const res = await fetch(`${API_BASE}/itinerary/items/${itemId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(item),
    });
    return handleResponse(res);
  },

  async deleteItem(itemId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/itinerary/items/${itemId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete item');
  },

  async toggleItemLock(itemId: string): Promise<ItineraryItem> {
    const res = await fetch(`${API_BASE}/itinerary/items/${itemId}/toggle-lock`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async reorderItems(dayId: string, itemIds: string[]): Promise<ItineraryItem[]> {
    const res = await fetch(`${API_BASE}/itinerary/days/${dayId}/reorder`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ item_ids: itemIds }),
    });
    return handleResponse(res);
  },

  // Members
  async addMember(tripId: string, member: Partial<TripMember>): Promise<TripMember> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/members`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(member),
    });
    return handleResponse(res);
  },

  async removeMember(tripId: string, memberId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/members/${memberId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to remove member');
  },

  // Share
  async getSharedTrip(shareToken: string): Promise<TripDetail> {
    const res = await fetch(`${API_BASE}/trips/share/${shareToken}`);
    return handleResponse(res);
  },

  async getSharedTripCostSummary(shareToken: string): Promise<CostSummary> {
    const res = await fetch(`${API_BASE}/trips/share/${shareToken}/cost-summary`);
    return handleResponse(res);
  },

  getExportIcsUrl(tripId: string): string {
    return `${API_BASE}/trips/${tripId}/export/ics`;
  },

  getExportPdfUrl(tripId: string): string {
    return `${API_BASE}/trips/${tripId}/export/pdf`;
  }
};
