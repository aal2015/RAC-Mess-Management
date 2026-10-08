from uuid import UUID
from pydantic import BaseModel

class CreateUserRequest(BaseModel):
    username: str
    password: str
    name: str
    phone: str | None = None
    role: str
    location_id: UUID | None = None
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

class UserLocationResponse(BaseModel):
    id: UUID
    latitude: float
    longitude: float
    road_name: str | None


class UserRouteResponse(BaseModel):
    id: UUID
    route_number: int
    name: str


class UserWithLocationResponse(BaseModel):
    id: UUID
    username: str
    name: str
    phone: str | None
    role: str
    battalion: str | None
    bus: str | None
    is_active: bool
    location: UserLocationResponse | None
    route: UserRouteResponse | None