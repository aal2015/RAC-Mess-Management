from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class CreateLocationRequest(BaseModel):
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