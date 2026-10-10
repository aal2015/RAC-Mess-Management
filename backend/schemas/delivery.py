from datetime import date
from uuid import UUID
from typing import Literal

from pydantic import BaseModel


class DeliveryLocationResponse(BaseModel):
    id: UUID
    latitude: float
    longitude: float
    road_name: str | None


class DeliveryUserResponse(BaseModel):
    id: UUID
    username: str
    name: str
    phone: str | None
    location: DeliveryLocationResponse
    stop_order: int | None
    is_delivered: bool


class RouteMealBookingsResponse(BaseModel):
    book_date: date
    meal_type: Literal["lunch", "dinner"]
    route_number: int
    route_name: str
    total_bookings: int
    delivered_count: int
    bookings: list[DeliveryUserResponse]