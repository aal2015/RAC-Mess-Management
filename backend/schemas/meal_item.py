from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class CreateMealItemRequest(BaseModel):
    item: str


class MealItemResponse(BaseModel):
    id: UUID
    item: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}