import math
from typing import Dict, Tuple, List, Any


# Standard destination coordinates lookup table for realistic mapping
CITY_COORDINATES: Dict[str, Dict[str, Any]] = {
    "tokyo": {
        "lat": 35.6762,
        "lng": 139.6503,
        "bounds": {"min_lat": 35.62, "max_lat": 35.75, "min_lng": 139.60, "max_lng": 139.80},
        "neighborhoods": [
            {"name": "Shinjuku & Shibuya", "lat": 35.6938, "lng": 139.7034},
            {"name": "Asakusa & Ueno", "lat": 35.7148, "lng": 139.7967},
            {"name": "Ginza & Marunouchi", "lat": 35.6719, "lng": 139.7640},
            {"name": "Roppongi & Akasaka", "lat": 35.6628, "lng": 139.7314},
        ]
    },
    "paris": {
        "lat": 48.8566,
        "lng": 2.3522,
        "bounds": {"min_lat": 48.82, "max_lat": 48.90, "min_lng": 2.25, "max_lng": 2.42},
        "neighborhoods": [
            {"name": "Le Marais & Latin Quarter", "lat": 48.8575, "lng": 2.3592},
            {"name": "Eiffel Tower & Invalides", "lat": 48.8584, "lng": 2.2945},
            {"name": "Montmartre & Sacré-Cœur", "lat": 48.8867, "lng": 2.3431},
            {"name": "Louvre & Tuileries", "lat": 48.8606, "lng": 2.3376},
        ]
    },
    "rome": {
        "lat": 41.9028,
        "lng": 12.4964,
        "bounds": {"min_lat": 41.85, "max_lat": 41.93, "min_lng": 12.42, "max_lng": 12.55},
        "neighborhoods": [
            {"name": "Colosseum & Ancient Rome", "lat": 41.8902, "lng": 12.4922},
            {"name": "Vatican City & Prati", "lat": 41.9029, "lng": 12.4534},
            {"name": "Trastevere & Gianicolo", "lat": 41.8893, "lng": 12.4705},
            {"name": "Trevi & Spanish Steps", "lat": 41.9009, "lng": 12.4833},
        ]
    },
    "new york": {
        "lat": 40.7128,
        "lng": -74.0060,
        "bounds": {"min_lat": 40.69, "max_lat": 40.82, "min_lng": -74.02, "max_lng": -73.94},
        "neighborhoods": [
            {"name": "Lower Manhattan & SoHo", "lat": 40.7190, "lng": -74.0000},
            {"name": "Midtown & Central Park South", "lat": 40.7580, "lng": -73.9855},
            {"name": "Brooklyn DUMBO & Heights", "lat": 40.7033, "lng": -73.9881},
            {"name": "Chelsea & Greenwich Village", "lat": 40.7465, "lng": -74.0014},
        ]
    },
    "barcelona": {
        "lat": 41.3851,
        "lng": 2.1734,
        "bounds": {"min_lat": 41.35, "max_lat": 41.43, "min_lng": 2.12, "max_lng": 2.22},
        "neighborhoods": [
            {"name": "Gothic Quarter & Born", "lat": 41.3828, "lng": 2.1770},
            {"name": "Eixample & Sagrada Familia", "lat": 41.4036, "lng": 2.1744},
            {"name": "Barceloneta & Beachfront", "lat": 41.3784, "lng": 2.1925},
            {"name": "Gràcia & Park Güell", "lat": 41.4145, "lng": 2.1527},
        ]
    },
    "kyoto": {
        "lat": 35.0116,
        "lng": 135.7681,
        "bounds": {"min_lat": 34.95, "max_lat": 35.06, "min_lng": 135.70, "max_lng": 135.82},
        "neighborhoods": [
            {"name": "Gion & Higashiyama", "lat": 35.0037, "lng": 135.7772},
            {"name": "Arashiyama Bamboo Grove", "lat": 35.0160, "lng": 135.6713},
            {"name": "Fushimi Inari & South", "lat": 34.9671, "lng": 135.7727},
        ]
    },
    "london": {
        "lat": 51.5074,
        "lng": -0.1278,
        "bounds": {"min_lat": 51.48, "max_lat": 51.54, "min_lng": -0.18, "max_lng": -0.05},
        "neighborhoods": [
            {"name": "Westminster & South Bank", "lat": 51.5007, "lng": -0.1246},
            {"name": "Soho & Covent Garden", "lat": 51.5136, "lng": -0.1257},
            {"name": "City of London & Tower Bridge", "lat": 51.5055, "lng": -0.0754},
            {"name": "Kensington & Hyde Park", "lat": 51.5033, "lng": -0.1803},
        ]
    }
}


def get_city_center(destination: str) -> Tuple[float, float]:
    """Finds best matching coordinate center for destination or provides default."""
    dest_lower = destination.lower().strip()
    for city, data in CITY_COORDINATES.items():
        if city in dest_lower or dest_lower in city:
            return data["lat"], data["lng"]
    # Fallback to general European/US center if unknown
    return 48.8566, 2.3522


def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates distance between two coordinates in kilometers."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


def estimate_transit(distance_km: float, mode: str = "walking") -> Tuple[int, str]:
    """Estimates realistic travel time in minutes based on distance."""
    if distance_km <= 0.05:
        return 2, "walking"
    elif distance_km <= 1.2:
        # Walking pace: ~4.5 km/h
        minutes = max(5, int((distance_km / 4.5) * 60))
        return minutes, "walking"
    elif distance_km <= 6.0:
        # Transit or bike: ~18 km/h + wait time
        minutes = max(10, int((distance_km / 18.0) * 60) + 5)
        return minutes, "transit"
    else:
        # Taxi or train: ~30 km/h + wait time
        minutes = max(15, int((distance_km / 30.0) * 60) + 8)
        return minutes, "taxi"


def time_to_minutes(time_str: str) -> int:
    """Converts 'HH:MM' string to minutes from midnight."""
    parts = time_str.split(":")
    return int(parts[0]) * 60 + int(parts[1])


def minutes_to_time(minutes: int) -> str:
    """Converts minutes from midnight to 'HH:MM' string (clamped to 23:59)."""
    minutes = min(23 * 60 + 59, max(0, minutes))
    hours = minutes // 60
    mins = minutes % 60
    return f"{hours:02d}:{mins:02d}"


def post_process_schedule(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Ensures:
    1. Realistic non-overlapping chronology.
    2. Accurate travel time from previous stop.
    3. Proper ordering indices.
    """
    if not items:
        return []

    # Sort items primarily by start_time
    sorted_items = sorted(items, key=lambda x: time_to_minutes(x.get("start_time", "09:00")))
    
    current_time_minutes = 9 * 60  # Default 09:00 AM start
    prev_lat: float = None
    prev_lng: float = None

    for idx, item in enumerate(sorted_items):
        item["order_index"] = idx
        lat = item.get("lat", 0.0)
        lng = item.get("lng", 0.0)

        # Calculate travel time from previous stop
        if prev_lat is not None and prev_lng is not None:
            dist = calculate_haversine_distance(prev_lat, prev_lng, lat, lng)
            travel_time, travel_mode = estimate_transit(dist, item.get("travel_mode", "walking"))
            item["travel_time_minutes"] = travel_time
            item["travel_mode"] = travel_mode
            current_time_minutes += travel_time
        else:
            item["travel_time_minutes"] = 0
            if "travel_mode" not in item:
                item["travel_mode"] = "walking"

        # Item start time
        desired_start = time_to_minutes(item.get("start_time", "09:00"))
        actual_start = max(desired_start, current_time_minutes)
        duration = item.get("duration_minutes", 60)
        actual_end = actual_start + duration

        item["start_time"] = minutes_to_time(actual_start)
        item["end_time"] = minutes_to_time(actual_end)

        current_time_minutes = actual_end
        prev_lat = lat
        prev_lng = lng

    return sorted_items
