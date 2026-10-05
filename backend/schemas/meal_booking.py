from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, field_validator


class CreateMealBookingsRequest(BaseModel):
    username: str
    dates: list[date]
    lunch: bool = False
    dinner: bool = False

class UpdateMealBookingRequest(BaseModel):
    lunch: bool = False
    dinner: bool = False

class MealBookingResponse(BaseModel):
    id: UUID
    user_id: UUID
    book_date: date
    lunch: bool
    dinner: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CancelUserBookingRequest(BaseModel):
    username: str
    book_date: date