from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class TrackingStartRequest(BaseModel):
    route_id: UUID
    book_date: date
    meal_type: Literal["lunch", "dinner"]

    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)


class TrackingLocationUpdate(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)


class TrackingTargetUpdate(BaseModel):
    location_id: UUID | None = None


class TrackingSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    route_id: UUID
    book_date: date
    meal_type: str
    target_location_id: UUID | None

    start_latitude: float
    start_longitude: float

    current_latitude: float
    current_longitude: float

    is_active: bool
    started_at: datetime
    updated_at: datetime
    ended_at: datetime | None


class ActiveTrackingSessionResponse(BaseModel):
    has_active_session: bool
    session: TrackingSessionResponse | None = None