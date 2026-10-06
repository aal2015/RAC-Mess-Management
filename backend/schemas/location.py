from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

class CreateLocationRequest(BaseModel):
    username: str
    latitude: float
    longitude: float
    road_name: str | None = None

class LocationResponse(BaseModel):
    id: UUID
    latitude: float
    longitude: float
    road_name: str | None
    created_at: datetime

    model_config = {"from_attributes": True}

class UpdateLocationRequest(BaseModel):
    latitude: float | None = None
    longitude: float | None = None
    road_name: str | None = None

class ForwardGeocodeRequest(BaseModel):
    address: str

class ForwardGeocodeResponse(BaseModel):
    latitude: float
    longitude: float
    display_name: str