from fastapi import APIRouter, HTTPException
from app.models.schemas import TripDetailResponse, CostSummaryResponse
from app.services.db_service import db
from app.services.cost_service import compute_cost_summary

router = APIRouter(prefix="/trips/share", tags=["Share"])


@router.get("/{share_token}", response_model=TripDetailResponse)
async def get_shared_trip(share_token: str):
    """Public read-only trip viewer endpoint."""
    trip = db.get_trip_by_share_token(share_token)
    if not trip:
        raise HTTPException(status_code=404, detail="Shared itinerary not found or expired link")
    return trip


@router.get("/{share_token}/cost-summary", response_model=CostSummaryResponse)
async def get_shared_trip_cost_summary(share_token: str):
    trip = db.get_trip_by_share_token(share_token)
    if not trip:
        raise HTTPException(status_code=404, detail="Shared itinerary not found or expired link")
    return compute_cost_summary(trip=trip, days=trip.days)
