import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import (
    GenerateItineraryRequest,
    RegenerateDayRequest,
    SuggestAlternativesRequest,
    SuggestAlternativesResponse,
    ItineraryItemCreate,
    ItineraryItemUpdate,
    ItineraryItemResponse,
    ItineraryDayResponse,
    ItineraryItemReorderRequest,
    TripDetailResponse,
    UserProfile
)
from app.utils.auth_helpers import get_current_user
from app.services.db_service import db
from app.services.ai_service import get_ai_planner

router = APIRouter(prefix="/itinerary", tags=["Itinerary"])


@router.post("/generate", response_model=TripDetailResponse)
async def generate_itinerary(
    req: GenerateItineraryRequest,
    current_user: UserProfile = Depends(get_current_user)
):
    trip = db.get_trip(req.trip_id, user_id=current_user.id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    planner = get_ai_planner()
    
    # Gather dietary preferences from all members if any
    all_dietary = list(req.dietary_preferences or [])
    for m in trip.members:
        if m.dietary_preferences:
            all_dietary.extend(m.dietary_preferences)
    all_dietary = list(set(all_dietary))

    ai_result = await planner.generate_itinerary(
        destination=trip.destination,
        start_date=trip.start_date,
        end_date=trip.end_date,
        travelers=trip.travelers,
        trip_type=trip.trip_type,
        budget=trip.budget,
        pace=trip.pace,
        interests=trip.interests,
        custom_prompt=req.custom_prompt,
        dietary_preferences=all_dietary
    )

    # Clear existing days and items for this trip before repopulating
    day_ids_to_del = [d.id for d in trip.days]
    for d_id in day_ids_to_del:
        if d_id in db.days:
            del db.days[d_id]
    item_ids_to_del = [i_id for i_id, i in db.items.items() if i["trip_id"] == trip.id]
    for i_id in item_ids_to_del:
        del db.items[i_id]

    # Save newly generated days and items
    now_str = datetime.utcnow().isoformat() + "Z"
    for gen_day in ai_result.days:
        day_id = f"day-{uuid.uuid4().hex[:8]}"
        db.days[day_id] = {
            "id": day_id,
            "trip_id": trip.id,
            "day_number": gen_day.day_number,
            "date": gen_day.date,
            "title": gen_day.title,
            "theme": gen_day.theme,
            "notes": "",
            "created_at": now_str,
            "updated_at": now_str
        }

        for idx, item in enumerate(gen_day.items):
            item_id = f"item-{uuid.uuid4().hex[:10]}"
            db.items[item_id] = {
                "id": item_id,
                "day_id": day_id,
                "trip_id": trip.id,
                "type": item.type,
                "title": item.title,
                "description": item.description,
                "location_name": item.location_name,
                "lat": item.lat,
                "lng": item.lng,
                "start_time": item.start_time,
                "end_time": item.end_time,
                "duration_minutes": item.duration_minutes,
                "cost": item.cost,
                "travel_time_minutes": item.travel_time_minutes,
                "travel_mode": item.travel_mode,
                "order_index": idx,
                "is_locked": False,
                "tips": item.tips,
                "rating": 4.8,
                "created_at": now_str,
                "updated_at": now_str
            }

    # Update summary in trip record
    if trip.id in db.trips:
        db.trips[trip.id]["ai_summary"] = ai_result.summary
        db.trips[trip.id]["updated_at"] = now_str

    return db.get_trip(trip.id, user_id=current_user.id)


@router.post("/regenerate-day", response_model=TripDetailResponse)
async def regenerate_single_day(
    req: RegenerateDayRequest,
    current_user: UserProfile = Depends(get_current_user)
):
    target_day = db.days.get(req.day_id)
    if not target_day:
        raise HTTPException(status_code=404, detail="Day not found")
    
    trip_id = target_day["trip_id"]
    trip = db.get_trip(trip_id, user_id=current_user.id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Find locked items for this day
    current_items = [i for i in db.items.values() if i["day_id"] == req.day_id]
    locked_items = [i for i in current_items if i.get("is_locked", False)]
    unlocked_item_ids = [i["id"] for i in current_items if not i.get("is_locked", False)]

    # Remove unlocked items
    for u_id in unlocked_item_ids:
        if u_id in db.items:
            del db.items[u_id]

    planner = get_ai_planner()
    refreshed_day = await planner.regenerate_day(
        destination=trip.destination,
        day_number=target_day["day_number"],
        day_date=target_day["date"],
        trip_type=trip.trip_type,
        pace=trip.pace,
        interests=trip.interests,
        locked_items=locked_items,
        instructions=req.instructions
    )

    # Update day title/theme
    target_day["title"] = refreshed_day.title
    target_day["theme"] = refreshed_day.theme
    target_day["updated_at"] = datetime.utcnow().isoformat() + "Z"

    # Add back non-locked generated items
    locked_ids = {l["id"] for l in locked_items}
    now_str = datetime.utcnow().isoformat() + "Z"

    for idx, new_i in enumerate(refreshed_day.items):
        # If this item matches a locked item, update its times/order
        matching_locked = next((l for l in locked_items if l["title"] == new_i.title), None)
        if matching_locked:
            m_id = matching_locked["id"]
            db.items[m_id]["start_time"] = new_i.start_time
            db.items[m_id]["end_time"] = new_i.end_time
            db.items[m_id]["order_index"] = idx
            db.items[m_id]["travel_time_minutes"] = new_i.travel_time_minutes
            db.items[m_id]["travel_mode"] = new_i.travel_mode
        else:
            item_id = f"item-{uuid.uuid4().hex[:10]}"
            db.items[item_id] = {
                "id": item_id,
                "day_id": req.day_id,
                "trip_id": trip_id,
                "type": new_i.type,
                "title": new_i.title,
                "description": new_i.description,
                "location_name": new_i.location_name,
                "lat": new_i.lat,
                "lng": new_i.lng,
                "start_time": new_i.start_time,
                "end_time": new_i.end_time,
                "duration_minutes": new_i.duration_minutes,
                "cost": new_i.cost,
                "travel_time_minutes": new_i.travel_time_minutes,
                "travel_mode": new_i.travel_mode,
                "order_index": idx,
                "is_locked": False,
                "tips": new_i.tips,
                "rating": 4.8,
                "created_at": now_str,
                "updated_at": now_str
            }

    return db.get_trip(trip_id, user_id=current_user.id)


@router.post("/items/suggest-alternatives", response_model=SuggestAlternativesResponse)
async def suggest_alternatives(
    req: SuggestAlternativesRequest,
    current_user: UserProfile = Depends(get_current_user)
):
    item = db.items.get(req.item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    trip = db.trips.get(item["trip_id"])
    dest = trip.get("destination", "Tokyo") if trip else "Tokyo"
    t_type = trip.get("trip_type", "solo") if trip else "solo"

    planner = get_ai_planner()
    alternatives = await planner.suggest_alternatives(
        item=item,
        trip_type=t_type,
        destination=dest,
        preference_override=req.preference_override
    )

    return SuggestAlternativesResponse(
        original_item_id=item["id"],
        original_title=item["title"],
        alternatives=alternatives
    )


@router.post("/items", response_model=ItineraryItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(
    item_in: ItineraryItemCreate,
    current_user: UserProfile = Depends(get_current_user)
):
    day = db.days.get(item_in.day_id)
    if not day:
        raise HTTPException(status_code=404, detail="Day not found")
    return db.create_item(item_in, trip_id=day["trip_id"])


@router.put("/items/{item_id}", response_model=ItineraryItemResponse)
async def update_item(
    item_id: str,
    item_update: ItineraryItemUpdate,
    current_user: UserProfile = Depends(get_current_user)
):
    item = db.update_item(item_id, item_update)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: str,
    current_user: UserProfile = Depends(get_current_user)
):
    success = db.delete_item(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    return None


@router.post("/items/{item_id}/toggle-lock", response_model=ItineraryItemResponse)
async def toggle_item_lock(
    item_id: str,
    current_user: UserProfile = Depends(get_current_user)
):
    item = db.toggle_item_lock(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.post("/days/{day_id}/reorder", response_model=List[ItineraryItemResponse])
async def reorder_items(
    day_id: str,
    req: ItineraryItemReorderRequest,
    current_user: UserProfile = Depends(get_current_user)
):
    return db.reorder_items(day_id=day_id, item_ids=req.item_ids)
