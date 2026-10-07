from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class CreateRouteRequest(BaseModel):
    route_number: int
    name: str


class UpdateRouteRequest(BaseModel):
    route_number: int | None = None
    name: str | None = None
    driver_username: str | None = None


class RouteResponse(BaseModel):
    id: UUID
    battalion: str
    route_number: int
    name: str
    driver_id: UUID | None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class AddRouteLocationRequest(BaseModel):
    location_id: UUID
    stop_order: int | None = None


class UpdateRouteLocationRequest(BaseModel):
    stop_order: int | None = None


class RouteLocationResponse(BaseModel):
    route_id: UUID
    location_id: UUID
    stop_order: int | None

    model_config = {"from_attributes": True}