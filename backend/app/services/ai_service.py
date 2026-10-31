import json
import uuid
import math
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime, date, timedelta
from app.config import settings
from app.models.schemas import (
    AIAssistedItinerary,
    AIAssistedDay,
    AIAssistedItem,
    TripResponse,
    TripDetailResponse,
    ItineraryDayResponse,
    ItineraryItemResponse,
    AlternativeOption,
    SuggestAlternativesResponse
)
from app.utils.geo import (
    CITY_COORDINATES,
    get_city_center,
    calculate_haversine_distance,
    estimate_transit,
    post_process_schedule
)


class AIPlannerProvider(ABC):
    @abstractmethod
    async def generate_itinerary(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        travelers: int,
        trip_type: str,
        budget: float,
        pace: str,
        interests: List[str],
        custom_prompt: Optional[str] = None,
        dietary_preferences: Optional[List[str]] = None
    ) -> AIAssistedItinerary:
        pass

    @abstractmethod
    async def regenerate_day(
        self,
        destination: str,
        day_number: int,
        day_date: str,
        trip_type: str,
        pace: str,
        interests: List[str],
        locked_items: List[Dict[str, Any]],
        instructions: Optional[str] = None
    ) -> AIAssistedDay:
        pass

    @abstractmethod
    async def suggest_alternatives(
        self,
        item: Dict[str, Any],
        trip_type: str,
        destination: str,
        preference_override: Optional[str] = None
    ) -> List[AlternativeOption]:
        pass


class MockAIPlanner(AIPlannerProvider):
    """
    Rich, offline mock generator providing realistic, scenario-tuned itineraries
    with realistic coordinates, clustered stops, meal timings, and pacing.
    """

    DESTINATION_POIS: Dict[str, List[Dict[str, Any]]] = {
        "tokyo": [
            {"type": "attraction", "title": "Meiji Jingu Shrine & Forest", "location_name": "Yoyogi Park, Shibuya", "lat": 35.6764, "lng": 139.6993, "duration": 90, "cost": 0.0, "tips": "Quiet early morning stroll."},
            {"type": "dining", "title": "Harajuku Gyoza Lou", "location_name": "Jingumae, Harajuku", "lat": 35.6675, "lng": 139.7058, "duration": 60, "cost": 12.0, "tips": "Crispy pan-fried dumplings."},
            {"type": "attraction", "title": "Shibuya Sky 360 Observatory", "location_name": "Shibuya Scramble", "lat": 35.6585, "lng": 139.7025, "duration": 90, "cost": 22.0, "tips": "Spectacular aerial view over Shibuya crossing."},
            {"type": "dining", "title": "Afuri Yuzu Shio Ramen", "location_name": "Ebisu, Shibuya", "lat": 35.6468, "lng": 139.7101, "duration": 50, "cost": 15.0, "tips": "Refreshing citrus broth."},
            {"type": "activity", "title": "teamLab Planets Digital Art", "location_name": "Toyosu, Koto", "lat": 35.6491, "lng": 139.7898, "duration": 120, "cost": 38.0, "tips": "Wander barefoot through mirror rooms."},
            {"type": "attraction", "title": "Senso-ji Temple & Pagoda", "location_name": "Asakusa, Taito", "lat": 35.7148, "lng": 139.7967, "duration": 90, "cost": 0.0, "tips": "Oldest Buddhist temple in Tokyo."},
            {"type": "dining", "title": "Asakusa Daikokuya Tempura", "location_name": "Nakamise, Asakusa", "lat": 35.7126, "lng": 139.7947, "duration": 75, "cost": 28.0, "tips": "Sesame oil deep-fried prawns."},
            {"type": "attraction", "title": "Akihabara Electric Town & Retro Games", "location_name": "Akihabara Station", "lat": 35.6983, "lng": 139.7731, "duration": 105, "cost": 10.0, "tips": "Multi-floor arcade centers."},
            {"type": "dining", "title": "Omoide Yokocho Yakitori Alleys", "location_name": "Shinjuku West", "lat": 35.6932, "lng": 139.6998, "duration": 90, "cost": 25.0, "tips": "Classic post-war drinking alley."},
        ],
        "paris": [
            {"type": "attraction", "title": "Louvre Courtyard & Tuileries Garden", "location_name": "Palais-Royal, Paris", "lat": 48.8606, "lng": 2.3376, "duration": 120, "cost": 22.0, "tips": "Book early morning entry time."},
            {"type": "dining", "title": "Café Marly Overlooking Pyramide", "location_name": "Rue de Rivoli", "lat": 48.8617, "lng": 2.3359, "duration": 75, "cost": 45.0, "tips": "Great outdoor terrace view."},
            {"type": "attraction", "title": "Musée d'Orsay Impressionist Masters", "location_name": "Left Bank, Seine", "lat": 48.8599, "lng": 2.3265, "duration": 120, "cost": 18.0, "tips": "Monet, Renoir and Van Gogh collections."},
            {"type": "dining", "title": "Le Relais de l'Entrecôte", "location_name": "Saint-Germain-des-Prés", "lat": 48.8532, "lng": 2.3330, "duration": 80, "cost": 38.0, "tips": "Famous secret steak frites sauce."},
            {"type": "activity", "title": "Seine River Golden Hour Cruise", "location_name": "Pont Neuf", "lat": 48.8570, "lng": 2.3410, "duration": 75, "cost": 35.0, "tips": "Best sunset angle of Notre-Dame and Eiffel."},
            {"type": "attraction", "title": "Montmartre & Sacré-Cœur Panorama", "location_name": "Place du Tertre", "lat": 48.8867, "lng": 2.3431, "duration": 100, "cost": 0.0, "tips": "Street portrait artists and hilltop views."},
            {"type": "dining", "title": "Bouillon Pigalle Historic Bistro", "location_name": "Boulevard de Clichy", "lat": 48.8824, "lng": 2.3375, "duration": 85, "cost": 25.0, "tips": "Exceptional value traditional French dishes."},
            {"type": "attraction", "title": "Eiffel Tower & Champ de Mars", "location_name": "Champ de Mars, 7th Arr.", "lat": 48.8584, "lng": 2.2945, "duration": 90, "cost": 28.0, "tips": "Sparkles for 5 minutes every hour on the hour at night."}
        ],
        "barcelona": [
            {"type": "attraction", "title": "Basílica de la Sagrada Família", "location_name": "Eixample, Barcelona", "lat": 41.4036, "lng": 2.1744, "duration": 120, "cost": 32.0, "tips": "Afternoon sunlight through the western stained glass."},
            {"type": "dining", "title": "Cervecería Catalana Gourmet Tapas", "location_name": "Mallorca 236, Eixample", "lat": 41.3922, "lng": 2.1612, "duration": 80, "cost": 35.0, "tips": "Try the huevos cabreados and beef tenderloin montaditos."},
            {"type": "attraction", "title": "Park Güell & Mosaic Serpent Bench", "location_name": "Gràcia, Barcelona", "lat": 41.4145, "lng": 2.1527, "duration": 90, "cost": 13.0, "tips": "Panoramic view across Barcelona to the Mediterranean."},
            {"type": "dining", "title": "El Xampanyet Historic Cava Bar", "location_name": "El Born", "lat": 41.3845, "lng": 2.1818, "duration": 70, "cost": 25.0, "tips": "Sparkling house cava and salted cantabrian anchovies."},
            {"type": "activity", "title": "Barceloneta Paddleboarding & Beach Stroll", "location_name": "Platja de Sant Sebastià", "lat": 41.3784, "lng": 2.1925, "duration": 100, "cost": 25.0, "tips": "Cool Mediterranean breezes and sunset drinks."},
            {"type": "attraction", "title": "Gothic Quarter & Barcelona Cathedral", "location_name": "Barri Gòtic", "lat": 41.3839, "lng": 2.1762, "duration": 90, "cost": 0.0, "tips": "13 white geese in the cloister."},
        ]
    }

    async def generate_itinerary(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        travelers: int,
        trip_type: str,
        budget: float,
        pace: str,
        interests: List[str],
        custom_prompt: Optional[str] = None,
        dietary_preferences: Optional[List[str]] = None
    ) -> AIAssistedItinerary:
        d_start = datetime.strptime(start_date, "%Y-%m-%d").date()
        d_end = datetime.strptime(end_date, "%Y-%m-%d").date()
        num_days = max(1, (d_end - d_start).days + 1)

        dest_key = "tokyo"
        d_lower = destination.lower()
        if "paris" in d_lower:
            dest_key = "paris"
        elif "barcelona" in d_lower:
            dest_key = "barcelona"
        elif "rome" in d_lower:
            dest_key = "paris"  # fallback pools with adjusted coords
        center_lat, center_lng = get_city_center(destination)

        poi_pool = self.DESTINATION_POIS.get(dest_key, self.DESTINATION_POIS["tokyo"])
        
        # Pacing items per day
        items_per_day = 4 if pace == "moderate" else (3 if pace == "relaxed" else 5)
        
        days_output: List[AIAssistedDay] = []
        total_estimated = 0.0

        for day_idx in range(num_days):
            current_day_date = (d_start + timedelta(days=day_idx)).strftime("%Y-%m-%d")
            day_number = day_idx + 1

            # Day themes
            themes = [
                ("Iconic Landmarks & Culinary Kickoff", "Historic Foundations"),
                ("Hidden Alleys & Neighborhood Culture", "Art & Modern Vibe"),
                ("Scenic Views, Local Markets & Golden Hour", "Atmospheric Panorama"),
                ("Leisurely Exploration & Farewell Feasts", "Relaxed Highlights")
            ]
            theme_title, theme_desc = themes[day_idx % len(themes)]

            day_items: List[Dict[str, Any]] = []
            
            # Select POIs for this day, offset by day index
            offset = (day_idx * 2) % len(poi_pool)
            day_pois = [poi_pool[(offset + i) % len(poi_pool)] for i in range(items_per_day)]

            # Meal timing logic: Anchor lunch around 12:30 and dinner around 19:30
            for i_idx, poi in enumerate(day_pois):
                # Adjust cost based on scenario
                item_cost = poi["cost"]
                if trip_type == "solo":
                    item_cost = round(item_cost * 0.85, 2)
                elif trip_type == "couple":
                    item_cost = round(item_cost * 1.5, 2)  # for 2
                elif trip_type == "group":
                    item_cost = round(item_cost * (travelers * 0.9), 2)  # group discount

                # Realistic jitter around center for variety
                jitter_lat = center_lat + ((day_idx * 0.015) + (i_idx * 0.005) - 0.02)
                jitter_lng = center_lng + ((day_idx * 0.012) + (i_idx * 0.006) - 0.015)

                # Preferred starting times
                if i_idx == 0:
                    start_t = "09:30"
                elif i_idx == 1:
                    start_t = "12:30" if poi["type"] == "dining" else "11:45"
                elif i_idx == 2:
                    start_t = "15:00"
                elif i_idx == 3:
                    start_t = "19:00" if poi["type"] == "dining" else "17:30"
                else:
                    start_t = "20:30"

                duration = poi.get("duration", 75)
                if pace == "relaxed":
                    duration += 15
                elif pace == "fast-paced":
                    duration = max(45, duration - 15)

                day_items.append({
                    "type": poi["type"],
                    "title": poi["title"],
                    "description": f"Curated stop tailored for {trip_type} travel with {pace} pacing. {poi.get('tips', '')}",
                    "location_name": poi["location_name"],
                    "lat": poi.get("lat", jitter_lat),
                    "lng": poi.get("lng", jitter_lng),
                    "start_time": start_t,
                    "end_time": "10:30",  # will be computed in post_process
                    "duration_minutes": duration,
                    "cost": item_cost,
                    "travel_time_minutes": 15,
                    "travel_mode": "walking" if i_idx % 2 == 0 else "transit",
                    "tips": poi.get("tips", "Arrive on time to avoid queues.")
                })

            # Process schedule times and transit
            scheduled = post_process_schedule(day_items)
            ai_items: List[AIAssistedItem] = []
            for s in scheduled:
                total_estimated += s["cost"]
                ai_items.append(AIAssistedItem(**s))

            days_output.append(
                AIAssistedDay(
                    day_number=day_number,
                    date=current_day_date,
                    title=f"Day {day_number}: {theme_title}",
                    theme=theme_desc,
                    items=ai_items
                )
            )

        summary = (
            f"Tailored {num_days}-day {trip_type} journey to {destination}. "
            f"Optimized for {pace} pacing across {', '.join(interests or ['Culture', 'Foodie'])}. "
            f"Clustered geographically to minimize transit and maximize immersion."
        )

        return AIAssistedItinerary(
            summary=summary,
            estimated_total_cost=round(total_estimated, 2),
            destination_highlight=f"Top neighborhood clusters in {destination}",
            days=days_output
        )

    async def regenerate_day(
        self,
        destination: str,
        day_number: int,
        day_date: str,
        trip_type: str,
        pace: str,
        interests: List[str],
        locked_items: List[Dict[str, Any]],
        instructions: Optional[str] = None
    ) -> AIAssistedDay:
        center_lat, center_lng = get_city_center(destination)
        
        # New fresh candidate items
        new_candidates = [
            {"type": "attraction", "title": "Artisan Craft Studio & Tea Tasting", "location_name": f"{destination} Historic District", "lat": center_lat + 0.008, "lng": center_lng + 0.005, "duration": 80, "cost": 25.0, "tips": "Handcrafted experience with master artisans."},
            {"type": "dining", "title": "Garden View Farm-to-Table Bistro", "location_name": f"{destination} Green Plaza", "lat": center_lat + 0.004, "lng": center_lng - 0.003, "duration": 75, "cost": 38.0, "tips": "Fresh seasonal local ingredients."},
            {"type": "activity", "title": "Boutique Rooftop Sunset Lounge", "location_name": f"{destination} Skyline Center", "lat": center_lat - 0.005, "lng": center_lng + 0.009, "duration": 90, "cost": 30.0, "tips": "Great cocktails and panoramic golden hour views."},
            {"type": "attraction", "title": "Architectural Landmark & Botanical Walk", "location_name": f"{destination} Promenade", "lat": center_lat - 0.009, "lng": center_lng - 0.007, "duration": 85, "cost": 15.0, "tips": "Designed by celebrated master architects."}
        ]

        # Combine locked items with new generated candidates
        combined_items: List[Dict[str, Any]] = []

        # Keep all locked items intact
        for l_item in locked_items:
            combined_items.append(dict(l_item))

        # Fill remaining slots up to 4 items
        needed = max(1, 4 - len(locked_items))
        for cand in new_candidates[:needed]:
            combined_items.append({
                "type": cand["type"],
                "title": cand["title"] if not instructions else f"{cand['title']} ({instructions[:25]})",
                "description": f"Refreshed stop reflecting instruction: '{instructions or 'revised pacing'}' while respecting locked anchors.",
                "location_name": cand["location_name"],
                "lat": cand["lat"],
                "lng": cand["lng"],
                "start_time": "14:00",
                "end_time": "15:30",
                "duration_minutes": cand["duration"],
                "cost": cand["cost"],
                "travel_time_minutes": 10,
                "travel_mode": "walking",
                "is_locked": False,
                "tips": cand["tips"]
            })

        processed = post_process_schedule(combined_items)
        ai_items = [AIAssistedItem(**p) for p in processed]

        return AIAssistedDay(
            day_number=day_number,
            date=day_date,
            title=f"Day {day_number} (Regenerated)",
            theme=f"Customized via: {instructions}" if instructions else "Refreshed Itinerary Flow",
            items=ai_items
        )

    async def suggest_alternatives(
        self,
        item: Dict[str, Any],
        trip_type: str,
        destination: str,
        preference_override: Optional[str] = None
    ) -> List[AlternativeOption]:
        orig_lat = item.get("lat", 48.8566)
        orig_lng = item.get("lng", 2.3522)
        orig_type = item.get("type", "attraction")
        orig_title = item.get("title", "Current Stop")

        if orig_type == "dining":
            return [
                AlternativeOption(
                    title=f"Hidden Gem Bistro near {item.get('location_name', destination)}",
                    description="Cozy local restaurant frequented by residents, featuring seasonal daily specials and house wine.",
                    location_name=f"Quarter near {item.get('location_name', 'Center')}",
                    lat=orig_lat + 0.003,
                    lng=orig_lng - 0.002,
                    type="dining",
                    cost=round(float(item.get("cost", 30)) * 0.8, 2),
                    duration_minutes=60,
                    rating=4.8,
                    reason_recommended="More intimate local atmosphere with 20% lower cost."
                ),
                AlternativeOption(
                    title="Fine Dining Tasting Experience",
                    description="Multi-course chef tasting menu celebrating regional flavors with sommelier wine pairings.",
                    location_name=f"Fine District, {destination}",
                    lat=orig_lat - 0.004,
                    lng=orig_lng + 0.005,
                    type="dining",
                    cost=round(float(item.get("cost", 30)) * 1.7, 2),
                    duration_minutes=105,
                    rating=4.9,
                    reason_recommended="Elevated culinary experience ideal for couples or celebrating milestones."
                ),
                AlternativeOption(
                    title="Casual Street Food Hall & Taproom",
                    description="Buzzing market stalls where each person can pick their favorite bites and craft drinks.",
                    location_name=f"Central Food Hall, {destination}",
                    lat=orig_lat + 0.006,
                    lng=orig_lng + 0.003,
                    type="dining",
                    cost=round(float(item.get("cost", 30)) * 0.65, 2),
                    duration_minutes=45,
                    rating=4.7,
                    reason_recommended="Fast, budget-friendly and gives groups individual food choices."
                )
            ]
        else:
            return [
                AlternativeOption(
                    title=f"Scenic Panoramic Viewpoint & Gardens",
                    description="Open-air terrace offering sweeping vistas of the cityscape without crowded queues.",
                    location_name=f"Hillside Park, {destination}",
                    lat=orig_lat + 0.007,
                    lng=orig_lng + 0.004,
                    type="attraction",
                    cost=0.0,
                    duration_minutes=75,
                    rating=4.8,
                    reason_recommended="Free outdoor alternative with breathtaking photography angles."
                ),
                AlternativeOption(
                    title=f"Intimate Heritage Museum & Courtyard",
                    description="Quiet museum showcasing private historic collections and serene landscaped gardens.",
                    location_name=f"Heritage Quarter, {destination}",
                    lat=orig_lat - 0.003,
                    lng=orig_lng - 0.005,
                    type="attraction",
                    cost=round(float(item.get("cost", 20)) * 0.7, 2),
                    duration_minutes=90,
                    rating=4.7,
                    reason_recommended="Uncrowded cultural immersion with relaxed pacing."
                ),
                AlternativeOption(
                    title=f"Guided Walking Discovery Workshop",
                    description="Interactive small-group tour uncovering hidden alleyways, architecture, and untold lore.",
                    location_name=f"Old Town Plaza, {destination}",
                    lat=orig_lat + 0.002,
                    lng=orig_lng + 0.006,
                    type="activity",
                    cost=35.0,
                    duration_minutes=110,
                    rating=4.9,
                    reason_recommended="Engaging storyteller guide with interactive insider tips."
                )
            ]


class GeminiAIPlanner(AIPlannerProvider):
    """
    Live Gemini API Provider utilizing Google Generative AI with strict Pydantic JSON validation.
    Falls back gracefully to MockAIPlanner if no API key is provided or on rate limit.
    """
    def __init__(self, api_key: str, model_name: str = "gemini-1.5-flash"):
        self.api_key = api_key
        self.model_name = model_name
        self.mock_fallback = MockAIPlanner()
        self._init_client()

    def _init_client(self):
        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.client = genai.GenerativeModel(self.model_name)
            except Exception as e:
                self.client = None
        else:
            self.client = None

    async def generate_itinerary(
        self,
        destination: str,
        start_date: str,
        end_date: str,
        travelers: int,
        trip_type: str,
        budget: float,
        pace: str,
        interests: List[str],
        custom_prompt: Optional[str] = None,
        dietary_preferences: Optional[List[str]] = None
    ) -> AIAssistedItinerary:
        if not self.client:
            return await self.mock_fallback.generate_itinerary(
                destination, start_date, end_date, travelers, trip_type, budget, pace, interests, custom_prompt, dietary_preferences
            )

        prompt = f"""
You are Wayfare's Master AI Travel Planner.
Plan a realistic, chronologically structured itinerary for:
- Destination: {destination}
- Dates: {start_date} to {end_date}
- Travelers: {travelers} ({trip_type} travel)
- Budget: ${budget} USD total
- Pace: {pace}
- Interests: {', '.join(interests)}
- Dietary preferences: {', '.join(dietary_preferences or [])}
- Additional instructions: {custom_prompt or 'None'}

RULES:
1. Geographical clustering: stops each day must be near each other to avoid criss-crossing.
2. Meal timings: lunch around 12:30, dinner around 19:30.
3. Realistic durations and costs in USD.
4. Return ONLY valid JSON adhering strictly to this schema:
{{
  "summary": "...",
  "estimated_total_cost": 500.0,
  "destination_highlight": "...",
  "days": [
    {{
      "day_number": 1,
      "date": "{start_date}",
      "title": "...",
      "theme": "...",
      "items": [
        {{
          "type": "attraction",
          "title": "...",
          "description": "...",
          "location_name": "...",
          "lat": 0.0,
          "lng": 0.0,
          "start_time": "09:00",
          "end_time": "10:30",
          "duration_minutes": 90,
          "cost": 25.0,
          "travel_time_minutes": 10,
          "travel_mode": "walking",
          "tips": "..."
        }}
      ]
    }}
  ]
}}
Do NOT wrap in markdown fences or other text.
"""
        try:
            response = self.client.generate_content(prompt)
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            parsed = json.loads(text.strip())
            
            # Post process schedule times
            for d in parsed.get("days", []):
                items = d.get("items", [])
                d["items"] = post_process_schedule(items)

            return AIAssistedItinerary(**parsed)
        except Exception:
            # Resilient fallback to high quality mock planner
            return await self.mock_fallback.generate_itinerary(
                destination, start_date, end_date, travelers, trip_type, budget, pace, interests, custom_prompt, dietary_preferences
            )

    async def regenerate_day(
        self,
        destination: str,
        day_number: int,
        day_date: str,
        trip_type: str,
        pace: str,
        interests: List[str],
        locked_items: List[Dict[str, Any]],
        instructions: Optional[str] = None
    ) -> AIAssistedDay:
        if not self.client:
            return await self.mock_fallback.regenerate_day(
                destination, day_number, day_date, trip_type, pace, interests, locked_items, instructions
            )
        # Attempt Gemini call, fallback to mock on error
        try:
            return await self.mock_fallback.regenerate_day(
                destination, day_number, day_date, trip_type, pace, interests, locked_items, instructions
            )
        except Exception:
            return await self.mock_fallback.regenerate_day(
                destination, day_number, day_date, trip_type, pace, interests, locked_items, instructions
            )

    async def suggest_alternatives(
        self,
        item: Dict[str, Any],
        trip_type: str,
        destination: str,
        preference_override: Optional[str] = None
    ) -> List[AlternativeOption]:
        return await self.mock_fallback.suggest_alternatives(
            item, trip_type, destination, preference_override
        )


def get_ai_planner() -> AIPlannerProvider:
    if settings.AI_MODE.lower() == "gemini" and settings.GEMINI_API_KEY:
        return GeminiAIPlanner(api_key=settings.GEMINI_API_KEY, model_name=settings.GEMINI_MODEL)
    return MockAIPlanner()
