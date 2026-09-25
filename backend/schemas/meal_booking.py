from datetime import date
from uuid import UUID

from pydantic import BaseModel, field_validator


class CreateMealBookingsRequest(BaseModel):
    username: str
    meal_item_id: UUID
    meal_type: str
    dates: list[date]

    @field_validator("meal_type")
    @classmethod
    def validate_meal_type(cls, value: str):
        if value not in ["breakfast", "lunch", "dinner"]:
            raise ValueError(
                "meal_type must be breakfast, lunch, or dinner"
            )

        return value

class UpdateMealBookingRequest(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str):
        if value not in ["booked", "cancelled"]:
            raise ValueError(
                "status must be booked or cancelled"
            )

        return value

class MealBookingResponse(BaseModel):
    id: UUID
    user_id: UUID
    driver_id: UUID | None
    book_date: date
    meal_type: str
    meal_item_id: UUID
    status: str

    model_config = {"from_attributes": True}