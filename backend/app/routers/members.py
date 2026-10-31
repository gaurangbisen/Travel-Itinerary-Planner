from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import (
    TripMemberResponse, TripMemberCreate, TripMemberUpdate, UserProfile
)
from app.utils.auth_helpers import get_current_user
from app.services.db_service import db

router = APIRouter(prefix="/trips/{trip_id}/members", tags=["Trip Members"])


@router.get("", response_model=List[TripMemberResponse])
async def list_members(
    trip_id: str,
    current_user: UserProfile = Depends(get_current_user)
):
    trip = db.get_trip(trip_id, user_id=current_user.id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip.members


@router.post("", response_model=TripMemberResponse, status_code=status.HTTP_201_CREATED)
async def add_member(
    trip_id: str,
    member_in: TripMemberCreate,
    current_user: UserProfile = Depends(get_current_user)
):
    trip = db.get_trip(trip_id, user_id=current_user.id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return db.add_member(trip_id=trip_id, member_in=member_in)


@router.put("/{member_id}", response_model=TripMemberResponse)
async def update_member(
    trip_id: str,
    member_id: str,
    member_update: TripMemberUpdate,
    current_user: UserProfile = Depends(get_current_user)
):
    mem = db.update_member(trip_id=trip_id, member_id=member_id, update_in=member_update)
    if not mem:
        raise HTTPException(status_code=404, detail="Member not found")
    return mem


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_member(
    trip_id: str,
    member_id: str,
    current_user: UserProfile = Depends(get_current_user)
):
    success = db.remove_member(trip_id=trip_id, member_id=member_id)
    if not success:
        raise HTTPException(status_code=404, detail="Member could not be removed")
    return None
