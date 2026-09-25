from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.deps import get_current_admin
from core.database import get_db
from core.security import hash_password
from models.user import User
from schemas.user import CreateUserRequest, UserResponse
from models.meal_item import MealItem
from schemas.meal_item import (
    CreateMealItemRequest,
    MealItemResponse,
)


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

@router.post(
    "/users",
    response_model=UserResponse
)
def create_user(
    request: CreateUserRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    if request.role not in ["user", "driver"]:
        raise HTTPException(400, "Role must be user or driver")

    exists = (
        db.query(User)
        .filter(User.username == request.username)
        .first()
    )

    if exists:
        raise HTTPException(409, "Username already exists")

    user = User(
        username=request.username,
        password_hash=hash_password(request.password),

        name=request.name,
        phone=request.phone,

        role=request.role,

        location_id=request.location_id,

        battalion=request.battalion,
        bus=request.bus,

        is_active=True
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

@router.post(
    "/meal-items",
    response_model=MealItemResponse,
)
def create_meal_item(
    request: CreateMealItemRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    exists = (
        db.query(MealItem)
        .filter(MealItem.item == request.item)
        .first()
    )

    if exists:
        raise HTTPException(409, "Meal item already exists")

    meal_item = MealItem(item=request.item.strip())

    db.add(meal_item)
    db.commit()
    db.refresh(meal_item)

    return meal_item