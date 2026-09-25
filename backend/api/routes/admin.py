from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.deps import get_current_admin
from core.database import get_db
from models.meal_booking import MealBooking
from core.security import hash_password
from models.user import User
from schemas.user import CreateUserRequest, UserResponse
from models.meal_item import MealItem
from schemas.meal_item import (
    CreateMealItemRequest,
    MealItemResponse,
)
from schemas.meal_booking import (
    CreateMealBookingsRequest,
    MealBookingResponse,
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


@router.post(
    "/bookings",
    response_model=list[MealBookingResponse],
)
def create_meal_bookings(
    request: CreateMealBookingsRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    # Find user
    booking_user = (
        db.query(User)
        .filter(User.username == request.username)
        .first()
    )

    if not booking_user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    if not booking_user.is_active:
        raise HTTPException(
            status_code=400,
            detail="User is inactive",
        )

    # Find meal item
    meal_item = db.get(MealItem, request.meal_item_id)

    if not meal_item:
        raise HTTPException(
            status_code=404,
            detail="Meal item not found",
        )

    if not request.dates:
        raise HTTPException(
            status_code=400,
            detail="At least one date is required",
        )

    dates = list(set(request.dates))
    today = date.today()

    # Reject past dates
    if any(booking_date < today for booking_date in dates):
        raise HTTPException(
            status_code=400,
            detail="Cannot create bookings for past dates",
        )

    # Check existing bookings
    existing = (
        db.query(MealBooking)
        .filter(
            MealBooking.user_id == booking_user.id,
            MealBooking.meal_type == request.meal_type,
            MealBooking.book_date.in_(dates),
        )
        .all()
    )

    if existing:
        existing_dates = [
            booking.book_date.isoformat()
            for booking in existing
        ]

        raise HTTPException(
            status_code=409,
            detail={
                "message": "Booking already exists for one or more dates",
                "dates": existing_dates,
            },
        )

    # Create bookings
    bookings = []

    for booking_date in dates:
        booking = MealBooking(
            user_id=booking_user.id,
            meal_item_id=request.meal_item_id,
            book_date=booking_date,
            meal_type=request.meal_type,
            status="booked",
        )

        db.add(booking)
        bookings.append(booking)

    db.commit()

    for booking in bookings:
        db.refresh(booking)

    return bookings