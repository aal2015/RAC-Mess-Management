from uuid import UUID
from pydantic import BaseModel

class CreateUserRequest(BaseModel):
    username: str
    password: str

    name: str
    phone: str | None = None

    role: str          # user or driver

    location_id: UUID | None = None

    battalion: str | None = None
    bus: str | None = None


class UserResponse(BaseModel):
    id: UUID

    username: str
    name: str
    phone: str | None

    role: str

    location_id: UUID | None

    battalion: str | None
    bus: str | None

    is_active: bool

    model_config = {"from_attributes": True}