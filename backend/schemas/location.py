from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

class CreateLocationRequest(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    road_name: str | None = None

class AssignLocationRequest(BaseModel):
    location_id: UUID

class LocationResponse(BaseModel):
    id: UUID
    battalion: str
    latitude: float
    longitude: float
    road_name: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UpdateLocationRequest(BaseModel):
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    road_name: str | None = None

class ForwardGeocodeRequest(BaseModel):
    address: str

class ForwardGeocodeResponse(BaseModel):
    latitude: float
    longitude: float
    display_name: str


class CreateMessLocationRequest(BaseModel):
    name: str = Field(min_length=1)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    landmark: str | None = None


class MessLocationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    battalion: str
    latitude: float
    longitude: float
    landmark: str | None
    created_at: datetime
    updated_at: datetime