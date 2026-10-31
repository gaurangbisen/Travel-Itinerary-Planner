import uuid
import secrets
from datetime import datetime, date, timedelta
from typing import List, Dict, Optional, Any
from app.models.schemas import (
    TripResponse, TripDetailResponse, TripCreate, TripUpdate,
    ItineraryDayResponse, ItineraryDayCreate,
    ItineraryItemResponse, ItineraryItemCreate, ItineraryItemUpdate,
    TripMemberResponse, TripMemberCreate, TripMemberUpdate
)
from app.utils.geo import post_process_schedule

class DatabaseService:
    def __init__(self):
        self.trips: Dict[str, Dict[str, Any]] = {}
        self.days: Dict[str, Dict[str, Any]] = {}
        self.items: Dict[str, Dict[str, Any]] = {}
        self.members: Dict[str, Dict[str, Any]] = {}
        self._seed_initial_data()

    def _seed_initial_data(self):
        """Seed initial high-quality demonstration scenarios matching requirements."""
        # 1. Solo Scenario: Tokyo
        trip1_id = "t-solo-tokyo-001"
        self.trips[trip1_id] = {
            "id": trip1_id,
            "user_id": "u-solo-alex-001",
            "title": "Tokyo Solo Explorer & Hidden Alleys",
            "destination": "Tokyo, Japan",
            "start_date": "2026-11-10",
            "end_date": "2026-11-12",
            "travelers": 1,
            "trip_type": "solo",
            "budget": 850.0,
            "budget_currency": "USD",
            "pace": "moderate",
            "interests": ["Foodie", "Culture", "Photography", "Nightlife"],
            "status": "planned",
            "share_token": "share_tokyo_solo_9918",
            "cover_image": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800",
            "ai_summary": "High-efficiency solo route balancing vintage cafes in Shimokitazawa, ramen counters, and Shinjuku neon.",
            "created_at": "2026-10-31T10:00:00Z",
            "updated_at": "2026-10-31T10:00:00Z"
        }

        # Day 1 Tokyo
        d1_id = "d-tokyo-1"
        self.days[d1_id] = {
            "id": d1_id,
            "trip_id": trip1_id,
            "day_number": 1,
            "date": "2026-11-10",
            "title": "Neon Shibuya & Harajuku Vintage",
            "theme": "Youth Culture & Street Photography",
            "notes": "Pick up Suica transport card at station.",
            "created_at": "2026-10-31T10:00:00Z",
            "updated_at": "2026-10-31T10:00:00Z"
        }
        self.items["i-t1-1"] = {
            "id": "i-t1-1",
            "day_id": d1_id,
            "trip_id": trip1_id,
            "type": "attraction",
            "title": "Meiji Jingu Shrine & Forest Walk",
            "description": "Peaceful early morning stroll through towering cedar trees in central Tokyo.",
            "location_name": "Meiji Jingu, Shibuya",
            "lat": 35.6764,
            "lng": 139.6993,
            "start_time": "09:00",
            "end_time": "10:30",
            "duration_minutes": 90,
            "cost": 0.0,
            "travel_time_minutes": 0,
            "travel_mode": "walking",
            "order_index": 0,
            "is_locked": True,
            "rating": 4.8,
            "tips": "Wash hands at temizuya fountain before entering."
        }
        self.items["i-t1-2"] = {
            "id": "i-t1-2",
            "day_id": d1_id,
            "trip_id": trip1_id,
            "type": "dining",
            "title": "Ichiran Ramen Harajuku",
            "description": "Legendary solo dining booth tonkotsu broth customized to taste.",
            "location_name": "Harajuku, Shibuya",
            "lat": 35.6698,
            "lng": 139.7029,
            "start_time": "11:00",
            "end_time": "12:00",
            "duration_minutes": 60,
            "cost": 14.0,
            "travel_time_minutes": 10,
            "travel_mode": "walking",
            "order_index": 1,
            "is_locked": False,
            "rating": 4.7,
            "tips": "Request firm noodles and half-spice garlic."
        }
        self.items["i-t1-3"] = {
            "id": "i-t1-3",
            "day_id": d1_id,
            "trip_id": trip1_id,
            "type": "attraction",
            "title": "Shibuya Sky Observation Deck",
            "description": "360-degree open-air panoramic view over Shibuya Scramble crossing.",
            "location_name": "Shibuya Scramble Square",
            "lat": 35.6585,
            "lng": 139.7025,
            "start_time": "13:30",
            "end_time": "15:00",
            "duration_minutes": 90,
            "cost": 22.0,
            "travel_time_minutes": 15,
            "travel_mode": "transit",
            "order_index": 2,
            "is_locked": False,
            "rating": 4.9,
            "tips": "Book ticket slot online for golden hour if possible."
        }
        self.items["i-t1-4"] = {
            "id": "i-t1-4",
            "day_id": d1_id,
            "trip_id": trip1_id,
            "type": "dining",
            "title": "Omoide Yokocho Yakitori Alleys",
            "description": "Atmospheric post-war alley lined with tiny 6-seater grilled skewer stalls.",
            "location_name": "Shinjuku West Exit",
            "lat": 35.6932,
            "lng": 139.6998,
            "start_time": "18:30",
            "end_time": "20:00",
            "duration_minutes": 90,
            "cost": 30.0,
            "travel_time_minutes": 15,
            "travel_mode": "transit",
            "order_index": 3,
            "is_locked": False,
            "rating": 4.6,
            "tips": "Cash only, order chicken thigh with green onion (negima)."
        }

        # Day 2 Tokyo
        d2_id = "d-tokyo-2"
        self.days[d2_id] = {
            "id": d2_id,
            "trip_id": trip1_id,
            "day_number": 2,
            "date": "2026-11-11",
            "title": "Old Edo Temples & River Cruise",
            "theme": "Historic Asakusa & Akihabara Electronics",
            "notes": "Wear comfortable walking shoes.",
            "created_at": "2026-10-31T10:00:00Z",
            "updated_at": "2026-10-31T10:00:00Z"
        }
        self.items["i-t2-1"] = {
            "id": "i-t2-1",
            "day_id": d2_id,
            "trip_id": trip1_id,
            "type": "attraction",
            "title": "Senso-ji Temple & Nakamise Dori",
            "description": "Tokyo's oldest Buddhist temple founded in 645 AD, with incense rituals.",
            "location_name": "Asakusa, Taito",
            "lat": 35.7148,
            "lng": 139.7967,
            "start_time": "09:00",
            "end_time": "10:45",
            "duration_minutes": 105,
            "cost": 0.0,
            "travel_time_minutes": 0,
            "travel_mode": "walking",
            "order_index": 0,
            "is_locked": True,
            "rating": 4.8,
            "tips": "Taste fresh melonpan pastries along the approach."
        }
        self.items["i-t2-2"] = {
            "id": "i-t2-2",
            "day_id": d2_id,
            "trip_id": trip1_id,
            "type": "dining",
            "title": "Asakusa Imahan Sukiyaki",
            "description": "Centuries-old black wagyu beef simmered in sweet soy broth.",
            "location_name": "Nishi-Asakusa",
            "lat": 35.7131,
            "lng": 139.7925,
            "start_time": "12:00",
            "end_time": "13:30",
            "duration_minutes": 90,
            "cost": 45.0,
            "travel_time_minutes": 10,
            "travel_mode": "walking",
            "order_index": 1,
            "is_locked": False,
            "rating": 4.9,
            "tips": "Lunch sets are half the dinner price for the same wagyu quality."
        }
        self.items["i-t2-3"] = {
            "id": "i-t2-3",
            "day_id": d2_id,
            "trip_id": trip1_id,
            "type": "activity",
            "title": "teamLab Planets Immersive Digital Art",
            "description": "Wander barefoot through water rooms filled with floating floral projections.",
            "location_name": "Toyosu, Koto",
            "lat": 35.6491,
            "lng": 139.7898,
            "start_time": "15:00",
            "end_time": "17:00",
            "duration_minutes": 120,
            "cost": 38.0,
            "travel_time_minutes": 25,
            "travel_mode": "transit",
            "order_index": 2,
            "is_locked": False,
            "rating": 4.9,
            "tips": "Pants that can be rolled above knees recommended."
        }

        # 2. Couple Scenario: Paris
        trip2_id = "t-couple-paris-002"
        self.trips[trip2_id] = {
            "id": trip2_id,
            "user_id": "u-couple-elena-002",
            "title": "Romantic Paris & Seine River Sunset",
            "destination": "Paris, France",
            "start_date": "2026-11-20",
            "end_date": "2026-11-23",
            "travelers": 2,
            "trip_type": "couple",
            "budget": 2400.0,
            "budget_currency": "EUR",
            "pace": "relaxed",
            "interests": ["Romantic", "Foodie", "Culture", "Relaxation"],
            "status": "planned",
            "share_token": "share_paris_romance_7741",
            "cover_image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
            "ai_summary": "A leisurely couples itinerary featuring private wine tasting, Louvre golden hour, and candlelit Latin Quarter bistros.",
            "created_at": "2026-10-31T11:00:00Z",
            "updated_at": "2026-10-31T11:00:00Z"
        }
        d_p1 = "d-paris-1"
        self.days[d_p1] = {
            "id": d_p1,
            "trip_id": trip2_id,
            "day_number": 1,
            "date": "2026-11-20",
            "title": "Montmartre Cobblestones & Sunset Wine",
            "theme": "Bohemian Art & Romantic Views",
            "notes": "Late start for relaxed morning croissants.",
            "created_at": "2026-10-31T11:00:00Z",
            "updated_at": "2026-10-31T11:00:00Z"
        }
        self.items["i-p1-1"] = {
            "id": "i-p1-1",
            "day_id": d_p1,
            "trip_id": trip2_id,
            "type": "dining",
            "title": "Cafe des Deux Moulins Breakfast",
            "description": "Classic café made famous by Amélie; enjoy café au lait and warm pain au chocolat.",
            "location_name": "Rue Lepic, Montmartre",
            "lat": 48.8851,
            "lng": 2.3333,
            "start_time": "10:00",
            "end_time": "11:15",
            "duration_minutes": 75,
            "cost": 32.0,
            "travel_time_minutes": 0,
            "travel_mode": "walking",
            "order_index": 0,
            "is_locked": False,
            "rating": 4.5,
            "tips": "Try cracking the crème brûlée with the back of a spoon."
        }
        self.items["i-p1-2"] = {
            "id": "i-p1-2",
            "day_id": d_p1,
            "trip_id": trip2_id,
            "type": "attraction",
            "title": "Sacré-Cœur Basilica & Artists' Square",
            "description": "Marvel at the white dome and romantic views of Paris from the highest point.",
            "location_name": "Place du Tertre, Montmartre",
            "lat": 48.8867,
            "lng": 2.3431,
            "start_time": "11:45",
            "end_time": "13:30",
            "duration_minutes": 105,
            "cost": 0.0,
            "travel_time_minutes": 10,
            "travel_mode": "walking",
            "order_index": 1,
            "is_locked": True,
            "rating": 4.8,
            "tips": "Take the funicular if you want to skip the 222 steps."
        }
        self.items["i-p1-3"] = {
            "id": "i-p1-3",
            "day_id": d_p1,
            "trip_id": trip2_id,
            "type": "activity",
            "title": "Private Seine River Sunset Cruise with Champagne",
            "description": "Glide past illuminated monuments with Moët & Chandon and macarons.",
            "location_name": "Pont Neuf Pier",
            "lat": 48.8570,
            "lng": 2.3410,
            "start_time": "17:30",
            "end_time": "19:00",
            "duration_minutes": 90,
            "cost": 180.0,
            "travel_time_minutes": 25,
            "travel_mode": "taxi",
            "order_index": 2,
            "is_locked": True,
            "rating": 4.9,
            "tips": "Bring a warm scarf for the open upper deck."
        }

        # 3. Group Scenario: Barcelona
        trip3_id = "t-group-barcelona-003"
        self.trips[trip3_id] = {
            "id": trip3_id,
            "user_id": "u-group-tech-003",
            "title": "Barcelona Friends Getaway & Tapas Crawl",
            "destination": "Barcelona, Spain",
            "start_date": "2026-11-25",
            "end_date": "2026-11-27",
            "travelers": 4,
            "trip_type": "group",
            "budget": 1800.0,
            "budget_currency": "EUR",
            "pace": "fast-paced",
            "interests": ["Nightlife", "Foodie", "Adventure", "Culture"],
            "status": "planned",
            "share_token": "share_barcelona_group_5521",
            "cover_image": "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800",
            "ai_summary": "High-energy group trip featuring shared paella pans, Gothic Quarter bar hopping, and Sagrada Familia tour.",
            "created_at": "2026-10-31T12:00:00Z",
            "updated_at": "2026-10-31T12:00:00Z"
        }
        # Add members to Barcelona group
        self.members["m-bcn-1"] = {
            "id": "m-bcn-1",
            "trip_id": trip3_id,
            "user_id": "u-group-tech-003",
            "name": "Sarah (Organizer)",
            "email": "group.lead@wayfare.ai",
            "role": "owner",
            "dietary_preferences": ["None"],
            "pace_preference": "fast-paced",
            "budget_preference": 500.0,
            "notes": "Booked the 4-bedroom Airbnb in Eixample.",
            "joined_at": "2026-10-31T12:00:00Z"
        }
        self.members["m-bcn-2"] = {
            "id": "m-bcn-2",
            "trip_id": trip3_id,
            "name": "Marcus Chen",
            "email": "marcus.chen@example.com",
            "role": "editor",
            "dietary_preferences": ["Vegetarian"],
            "pace_preference": "moderate",
            "budget_preference": 450.0,
            "notes": "Wants to see Park Güell at sunrise.",
            "joined_at": "2026-10-31T12:05:00Z"
        }
        self.members["m-bcn-3"] = {
            "id": "m-bcn-3",
            "trip_id": trip3_id,
            "name": "David Miller",
            "email": "david.m@example.com",
            "role": "viewer",
            "dietary_preferences": ["No Seafood"],
            "pace_preference": "fast-paced",
            "budget_preference": 450.0,
            "notes": "Handles rental car driving.",
            "joined_at": "2026-10-31T12:10:00Z"
        }

        d_b1 = "d-bcn-1"
        self.days[d_b1] = {
            "id": d_b1,
            "trip_id": trip3_id,
            "day_number": 1,
            "date": "2026-11-25",
            "title": "Gothic Quarter Labyrinths & Pintxos Crawl",
            "theme": "Medieval History & Group Tapas",
            "notes": "Split bill via Revolut / Splitwise.",
            "created_at": "2026-10-31T12:00:00Z",
            "updated_at": "2026-10-31T12:00:00Z"
        }
        self.items["i-b1-1"] = {
            "id": "i-b1-1",
            "day_id": d_b1,
            "trip_id": trip3_id,
            "type": "attraction",
            "title": "La Sagrada Familia Guided Tour",
            "description": "Gaudí’s breathtaking cathedral with rainbow stained-glass afternoon light.",
            "location_name": "Eixample, Barcelona",
            "lat": 41.4036,
            "lng": 2.1744,
            "start_time": "10:00",
            "end_time": "12:00",
            "duration_minutes": 120,
            "cost": 120.0,  # 30 per person x 4
            "travel_time_minutes": 0,
            "travel_mode": "transit",
            "order_index": 0,
            "is_locked": True,
            "rating": 4.9,
            "tips": "Fast-track tickets include tower access."
        }
        self.items["i-b1-2"] = {
            "id": "i-b1-2",
            "day_id": d_b1,
            "trip_id": trip3_id,
            "type": "dining",
            "title": "El Xampanyet Tapas & Cava",
            "description": "Lively rustic bar founded in 1929, famous for sparkling cava and anchovies.",
            "location_name": "El Born, Barcelona",
            "lat": 41.3845,
            "lng": 2.1818,
            "start_time": "13:00",
            "end_time": "14:30",
            "duration_minutes": 90,
            "cost": 95.0,
            "travel_time_minutes": 15,
            "travel_mode": "transit",
            "order_index": 1,
            "is_locked": False,
            "rating": 4.8,
            "tips": "Arrive 10 mins before opening to snag a high top table for 4."
        }
        self.items["i-b1-3"] = {
            "id": "i-b1-3",
            "day_id": d_b1,
            "trip_id": trip3_id,
            "type": "activity",
            "title": "Barceloneta Beach Paddleboarding & Sunset Sangria",
            "description": "Group paddleboard rental followed by beachfront chiringuito drinks.",
            "location_name": "Platja de la Barceloneta",
            "lat": 41.3784,
            "lng": 2.1925,
            "start_time": "16:00",
            "end_time": "18:00",
            "duration_minutes": 120,
            "cost": 80.0,
            "travel_time_minutes": 15,
            "travel_mode": "walking",
            "order_index": 2,
            "is_locked": False,
            "rating": 4.7,
            "tips": "Lockers available for phones and wallets."
        }

    # Trips CRUD
    def list_trips(self, user_id: str, search: Optional[str] = None, trip_type: Optional[str] = None) -> List[TripResponse]:
        results = []
        for trip_id, t in self.trips.items():
            # Check ownership or membership
            is_member = any(m["trip_id"] == trip_id and m.get("user_id") == user_id for m in self.members.values())
            if t["user_id"] != user_id and not is_member:
                # In development demo mode, let demo users see the 3 seeded demo trips
                if not trip_id.startswith("t-"):
                    continue

            # Filtering
            if search:
                s_lower = search.lower()
                if s_lower not in t["title"].lower() and s_lower not in t["destination"].lower():
                    continue
            if trip_type and t["trip_type"] != trip_type:
                continue

            days = [d for d in self.days.values() if d["trip_id"] == trip_id]
            total_cost = sum(
                float(i["cost"]) for i in self.items.values() if i["trip_id"] == trip_id
            )

            trip_data = dict(t)
            trip_data["days_count"] = len(days)
            trip_data["total_cost"] = round(total_cost, 2)
            results.append(TripResponse(**trip_data))

        # Sort newest first
        results.sort(key=lambda x: x.created_at or "", reverse=True)
        return results

    def get_trip(self, trip_id: str, user_id: Optional[str] = None) -> Optional[TripDetailResponse]:
        trip = self.trips.get(trip_id)
        if not trip:
            return None

        # Gather days
        raw_days = [d for d in self.days.values() if d["trip_id"] == trip_id]
        raw_days.sort(key=lambda d: d["day_number"])

        detailed_days: List[ItineraryDayResponse] = []
        total_cost = 0.0

        for d in raw_days:
            day_items = [i for i in self.items.values() if i["day_id"] == d["id"]]
            day_items.sort(key=lambda i: (i.get("order_index", 0), i.get("start_time", "09:00")))
            total_cost += sum(float(i.get("cost", 0.0)) for i in day_items)
            
            detailed_days.append(
                ItineraryDayResponse(
                    id=d["id"],
                    trip_id=trip_id,
                    day_number=d["day_number"],
                    date=d["date"],
                    title=d.get("title"),
                    theme=d.get("theme"),
                    notes=d.get("notes"),
                    items=[ItineraryItemResponse(**i) for i in day_items],
                    created_at=d.get("created_at"),
                    updated_at=d.get("updated_at")
                )
            )

        members = [
            TripMemberResponse(**m) for m in self.members.values() if m["trip_id"] == trip_id
        ]

        trip_dict = dict(trip)
        trip_dict["days_count"] = len(detailed_days)
        trip_dict["total_cost"] = round(total_cost, 2)
        trip_dict["days"] = detailed_days
        trip_dict["members"] = members

        return TripDetailResponse(**trip_dict)

    def get_trip_by_share_token(self, share_token: str) -> Optional[TripDetailResponse]:
        for trip_id, t in self.trips.items():
            if t.get("share_token") == share_token:
                return self.get_trip(trip_id)
        return None

    def create_trip(self, trip_in: TripCreate, user_id: str) -> TripResponse:
        trip_id = f"trip-{uuid.uuid4().hex[:10]}"
        now_str = datetime.utcnow().isoformat() + "Z"
        share_token = secrets.token_hex(8)

        new_trip = {
            "id": trip_id,
            "user_id": user_id,
            "title": trip_in.title,
            "destination": trip_in.destination,
            "start_date": trip_in.start_date,
            "end_date": trip_in.end_date,
            "travelers": trip_in.travelers,
            "trip_type": trip_in.trip_type,
            "budget": trip_in.budget,
            "budget_currency": trip_in.budget_currency,
            "pace": trip_in.pace,
            "interests": trip_in.interests,
            "status": trip_in.status,
            "share_token": share_token,
            "cover_image": trip_in.cover_image or "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
            "ai_summary": "",
            "created_at": now_str,
            "updated_at": now_str
        }
        self.trips[trip_id] = new_trip

        # Also add owner as member
        mem_id = f"mem-{uuid.uuid4().hex[:8]}"
        self.members[mem_id] = {
            "id": mem_id,
            "trip_id": trip_id,
            "user_id": user_id,
            "name": "Trip Owner",
            "email": None,
            "role": "owner",
            "dietary_preferences": [],
            "pace_preference": trip_in.pace,
            "budget_preference": trip_in.budget,
            "notes": "Organizer",
            "joined_at": now_str
        }

        return TripResponse(**new_trip, days_count=0, total_cost=0.0)

    def update_trip(self, trip_id: str, trip_update: TripUpdate, user_id: str) -> Optional[TripResponse]:
        trip = self.trips.get(trip_id)
        if not trip:
            return None
        
        update_data = trip_update.model_dump(exclude_unset=True)
        for k, v in update_data.items():
            trip[k] = v
        trip["updated_at"] = datetime.utcnow().isoformat() + "Z"
        
        days_count = len([d for d in self.days.values() if d["trip_id"] == trip_id])
        total_cost = sum(float(i["cost"]) for i in self.items.values() if i["trip_id"] == trip_id)
        return TripResponse(**trip, days_count=days_count, total_cost=round(total_cost, 2))

    def delete_trip(self, trip_id: str, user_id: str) -> bool:
        if trip_id in self.trips:
            del self.trips[trip_id]
            # Cascade days, items, members
            day_ids = [d_id for d_id, d in self.days.items() if d["trip_id"] == trip_id]
            for d_id in day_ids:
                del self.days[d_id]
            item_ids = [i_id for i_id, i in self.items.items() if i["trip_id"] == trip_id]
            for i_id in item_ids:
                del self.items[i_id]
            member_ids = [m_id for m_id, m in self.members.items() if m["trip_id"] == trip_id]
            for m_id in member_ids:
                del self.members[m_id]
            return True
        return False

    # Items Management
    def create_item(self, item_in: ItineraryItemCreate, trip_id: str) -> ItineraryItemResponse:
        item_id = f"item-{uuid.uuid4().hex[:10]}"
        now_str = datetime.utcnow().isoformat() + "Z"

        new_item = item_in.model_dump()
        new_item["id"] = item_id
        new_item["trip_id"] = trip_id
        new_item["created_at"] = now_str
        new_item["updated_at"] = now_str

        self.items[item_id] = new_item
        return ItineraryItemResponse(**new_item)

    def update_item(self, item_id: str, item_update: ItineraryItemUpdate) -> Optional[ItineraryItemResponse]:
        item = self.items.get(item_id)
        if not item:
            return None
        
        update_data = item_update.model_dump(exclude_unset=True)
        for k, v in update_data.items():
            item[k] = v
        item["updated_at"] = datetime.utcnow().isoformat() + "Z"

        # Re-post-process schedule for the day
        day_items = [i for i in self.items.values() if i["day_id"] == item["day_id"]]
        post_process_schedule(day_items)

        return ItineraryItemResponse(**item)

    def delete_item(self, item_id: str) -> bool:
        if item_id in self.items:
            day_id = self.items[item_id]["day_id"]
            del self.items[item_id]
            # Re-index remaining day items
            day_items = [i for i in self.items.values() if i["day_id"] == day_id]
            for idx, di in enumerate(sorted(day_items, key=lambda x: x.get("order_index", 0))):
                di["order_index"] = idx
            return True
        return False

    def reorder_items(self, day_id: str, item_ids: List[str]) -> List[ItineraryItemResponse]:
        updated: List[ItineraryItemResponse] = []
        for idx, item_id in enumerate(item_ids):
            if item_id in self.items and self.items[item_id]["day_id"] == day_id:
                self.items[item_id]["order_index"] = idx
        
        day_items = [self.items[i_id] for i_id in item_ids if i_id in self.items]
        processed = post_process_schedule(day_items)
        for pi in processed:
            updated.append(ItineraryItemResponse(**pi))
        return updated

    def toggle_item_lock(self, item_id: str) -> Optional[ItineraryItemResponse]:
        item = self.items.get(item_id)
        if not item:
            return None
        item["is_locked"] = not item.get("is_locked", False)
        item["updated_at"] = datetime.utcnow().isoformat() + "Z"
        return ItineraryItemResponse(**item)

    # Members Management
    def add_member(self, trip_id: str, member_in: TripMemberCreate) -> TripMemberResponse:
        mem_id = f"mem-{uuid.uuid4().hex[:8]}"
        now_str = datetime.utcnow().isoformat() + "Z"
        new_mem = member_in.model_dump()
        new_mem["id"] = mem_id
        new_mem["trip_id"] = trip_id
        new_mem["joined_at"] = now_str
        self.members[mem_id] = new_mem
        return TripMemberResponse(**new_mem)

    def update_member(self, trip_id: str, member_id: str, update_in: TripMemberUpdate) -> Optional[TripMemberResponse]:
        mem = self.members.get(member_id)
        if not mem or mem["trip_id"] != trip_id:
            return None
        for k, v in update_in.model_dump(exclude_unset=True).items():
            mem[k] = v
        return TripMemberResponse(**mem)

    def remove_member(self, trip_id: str, member_id: str) -> bool:
        mem = self.members.get(member_id)
        if mem and mem["trip_id"] == trip_id and mem["role"] != "owner":
            del self.members[member_id]
            return True
        return False


db = DatabaseService()
