from __future__ import annotations
from typing import List, Optional, Literal, Dict, Any
from datetime import date as DateType, time as TimeType, datetime as DateTimeType
from pydantic import BaseModel, Field, ConfigDict
import uuid


# Enums & Types
TripType = Literal["solo", "couple", "group"]
TripPace = Literal["relaxed", "moderate", "fast-paced"]
TripStatus = Literal["draft", "planned", "active", "completed", "archived"]
ItemType = Literal["attraction", "dining", "accommodation", "transport", "activity"]
TravelMode = Literal["walking", "transit", "driving", "taxi", "biking"]
MemberRole = Literal["owner", "editor", "viewer"]


# User & Auth
class UserProfile(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile


class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = "password123"
    full_name: Optional[str] = None


# Trip Members
class TripMemberBase(BaseModel):
    name: str
    email: Optional[str] = None
    role: MemberRole = "editor"
    dietary_preferences: List[str] = Field(default_factory=list)
    pace_preference: Optional[TripPace] = None
    budget_preference: Optional[float] = None
    notes: Optional[str] = None


class TripMemberCreate(TripMemberBase):
    pass


class TripMemberUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[MemberRole] = None
    dietary_preferences: Optional[List[str]] = None
    pace_preference: Optional[TripPace] = None
    budget_preference: Optional[float] = None
    notes: Optional[str] = None


class TripMemberResponse(TripMemberBase):
    id: str
    trip_id: str
    user_id: Optional[str] = None
    joined_at: str

    model_config = ConfigDict(from_attributes=True)


# Itinerary Items
class ItineraryItemBase(BaseModel):
    type: ItemType
    title: str
    description: Optional[str] = ""
    location_name: str
    lat: float
    lng: float
    start_time: str = "09:00"  # HH:MM
    end_time: str = "10:30"    # HH:MM
    duration_minutes: int = 60
    cost: float = 0.0
    travel_time_minutes: int = 0
    travel_mode: TravelMode = "walking"
    order_index: int = 0
    is_locked: bool = False
    booking_url: Optional[str] = None
    rating: Optional[float] = 4.5
    tips: Optional[str] = None


class ItineraryItemCreate(ItineraryItemBase):
    day_id: str


class ItineraryItemUpdate(BaseModel):
    type: Optional[ItemType] = None
    title: Optional[str] = None
    description: Optional[str] = None
    location_name: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration_minutes: Optional[int] = None
    cost: Optional[float] = None
    travel_time_minutes: Optional[int] = None
    travel_mode: Optional[TravelMode] = None
    order_index: Optional[int] = None
    is_locked: Optional[bool] = None
    booking_url: Optional[str] = None
    rating: Optional[float] = None
    tips: Optional[str] = None


class ItineraryItemReorderRequest(BaseModel):
    item_ids: List[str]


class ItineraryItemResponse(ItineraryItemBase):
    id: str
    day_id: str
    trip_id: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# Itinerary Days
class ItineraryDayBase(BaseModel):
    day_number: int
    date: str  # YYYY-MM-DD
    title: Optional[str] = None
    theme: Optional[str] = None
    notes: Optional[str] = None


class ItineraryDayCreate(ItineraryDayBase):
    pass


class ItineraryDayResponse(ItineraryDayBase):
    id: str
    trip_id: str
    items: List[ItineraryItemResponse] = Field(default_factory=list)
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# Trips
class TripBase(BaseModel):
    title: str
    destination: str
    start_date: str  # YYYY-MM-DD
    end_date: str    # YYYY-MM-DD
    travelers: int = 1
    trip_type: TripType = "solo"
    budget: float = 1000.0
    budget_currency: str = "USD"
    pace: TripPace = "moderate"
    interests: List[str] = Field(default_factory=list)
    status: TripStatus = "planned"
    cover_image: Optional[str] = None


class TripCreate(TripBase):
    pass


class TripUpdate(BaseModel):
    title: Optional[str] = None
    destination: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    travelers: Optional[int] = None
    trip_type: Optional[TripType] = None
    budget: Optional[float] = None
    budget_currency: Optional[str] = None
    pace: Optional[TripPace] = None
    interests: Optional[List[str]] = None
    status: Optional[TripStatus] = None
    cover_image: Optional[str] = None
    ai_summary: Optional[str] = None


class TripResponse(TripBase):
    id: str
    user_id: str
    share_token: str
    ai_summary: Optional[str] = None
    days_count: Optional[int] = 0
    total_cost: Optional[float] = 0.0
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TripDetailResponse(TripResponse):
    days: List[ItineraryDayResponse] = Field(default_factory=list)
    members: List[TripMemberResponse] = Field(default_factory=list)


# AI Generation & Alternatives Schemas
class GenerateItineraryRequest(BaseModel):
    trip_id: str
    custom_prompt: Optional[str] = None
    dietary_preferences: Optional[List[str]] = None
    must_see: Optional[List[str]] = None


class RegenerateDayRequest(BaseModel):
    day_id: str
    instructions: Optional[str] = None  # e.g. "Focus more on cozy cafes and less museums"


class SuggestAlternativesRequest(BaseModel):
    item_id: str
    preference_override: Optional[str] = None


class AlternativeOption(BaseModel):
    title: str
    description: str
    location_name: str
    lat: float
    lng: float
    type: ItemType
    cost: float
    duration_minutes: int
    rating: float = 4.6
    reason_recommended: str


class SuggestAlternativesResponse(BaseModel):
    original_item_id: str
    original_title: str
    alternatives: List[AlternativeOption]


# Strict JSON Structure generated by AI
class AIAssistedItem(BaseModel):
    type: ItemType
    title: str
    description: str
    location_name: str
    lat: float
    lng: float
    start_time: str  # HH:MM
    end_time: str    # HH:MM
    duration_minutes: int
    cost: float
    travel_time_minutes: int
    travel_mode: TravelMode = "walking"
    tips: Optional[str] = None


class AIAssistedDay(BaseModel):
    day_number: int
    date: str
    title: str
    theme: str
    items: List[AIAssistedItem]


class AIAssistedItinerary(BaseModel):
    summary: str
    estimated_total_cost: float
    destination_highlight: str
    days: List[AIAssistedDay]


# Cost & Analytics
class CostCategoryBreakdown(BaseModel):
    category: ItemType
    amount: float
    percentage: float
    item_count: int


class DayCostBreakdown(BaseModel):
    day_number: int
    date: str
    amount: float


class CostSummaryResponse(BaseModel):
    trip_id: str
    budget: float
    total_cost: float
    remaining_budget: float
    is_over_budget: bool
    over_budget_amount: float
    per_person_cost: float
    travelers_count: int
    currency: str = "USD"
    categories: List[CostCategoryBreakdown]
    days: List[DayCostBreakdown]
    warning_message: Optional[str] = None
