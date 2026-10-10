from datetime import datetime, date
from uuid import UUID

from pydantic import BaseModel


class CreateRouteRequest(BaseModel):
    route_number: int
    name: str


class UpdateRouteRequest(BaseModel):
    route_number: int | None = None
    name: str | None = None
    driver_username: str | None = None


class RouteDriverResponse(BaseModel):
    id: UUID
    username: str
    name: str
    phone: str | None


class RouteResponse(BaseModel):
    id: UUID
    battalion: str
    route_number: int
    name: str
    driver: RouteDriverResponse | None
    is_active: bool
    created_at: datetime


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


class DriverRouteAssignmentResponse(BaseModel):
    driver: RouteDriverResponse
    route: RouteResponse | None
    route_user_count: int
    user_count: int
    lunch_count: int
    dinner_count: int
    book_date: date