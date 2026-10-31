from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response
from app.models.schemas import (
    TripResponse, TripDetailResponse, TripCreate, TripUpdate,
    UserProfile, CostSummaryResponse
)
from app.utils.auth_helpers import get_current_user
from app.services.db_service import db
from app.services.cost_service import compute_cost_summary
from app.services.export_service import generate_ics_calendar, generate_printable_html

router = APIRouter(prefix="/trips", tags=["Trips"])


@router.get("", response_model=List[TripResponse])
async def list_trips(
    search: Optional[str] = None,
    trip_type: Optional[str] = None,
    current_user: UserProfile = Depends(get_current_user)
):
    return db.list_trips(user_id=current_user.id, search=search, trip_type=trip_type)


@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
async def create_trip(
    trip_in: TripCreate,
    current_user: UserProfile = Depends(get_current_user)
):
    return db.create_trip(trip_in=trip_in, user_id=current_user.id)


@router.get("/{trip_id}", response_model=TripDetailResponse)
async def get_trip(
    trip_id: str,
    current_user: UserProfile = Depends(get_current_user)
):
    trip = db.get_trip(trip_id=trip_id, user_id=current_user.id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.put("/{trip_id}", response_model=TripResponse)
async def update_trip(
    trip_id: str,
    trip_update: TripUpdate,
    current_user: UserProfile = Depends(get_current_user)
):
    trip = db.update_trip(trip_id=trip_id, trip_update=trip_update, user_id=current_user.id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(
    trip_id: str,
    current_user: UserProfile = Depends(get_current_user)
):
    success = db.delete_trip(trip_id=trip_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Trip not found")
    return None


@router.get("/{trip_id}/cost-summary", response_model=CostSummaryResponse)
async def get_trip_cost_summary(
    trip_id: str,
    current_user: UserProfile = Depends(get_current_user)
):
    trip = db.get_trip(trip_id=trip_id, user_id=current_user.id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return compute_cost_summary(trip=trip, days=trip.days)


@router.get("/{trip_id}/export/ics")
async def export_trip_ics(
    trip_id: str,
    current_user: UserProfile = Depends(get_current_user)
):
    trip = db.get_trip(trip_id=trip_id, user_id=current_user.id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    ics_bytes = generate_ics_calendar(trip)
    filename = f"wayfare-{trip.destination.lower().replace(' ', '_').replace(',', '')}.ics"
    return Response(
        content=ics_bytes,
        media_type="text/calendar",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/{trip_id}/export/pdf")
async def export_trip_pdf(
    trip_id: str,
    current_user: UserProfile = Depends(get_current_user)
):
    trip = db.get_trip(trip_id=trip_id, user_id=current_user.id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    html = generate_printable_html(trip)
    return Response(content=html, media_type="text/html")
