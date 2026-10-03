from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.deps import get_current_user
from core.database import get_db
from models.user import User
from models.meal_booking import MealBooking
from schemas.user import UserResponse
from schemas.meal_booking import (
    CreateMealBookingsRequest,
    MealBookingResponse,
)

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get("/battalion", response_model=list[UserResponse])
def get_battalion_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    users = (
        db.query(User)
        .filter(User.battalion == current_user.battalion)
        .all()
    )

    return users


@router.get(
    "/bookings",
    response_model=list[MealBookingResponse],
)
def get_meal_bookings(
    username: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Admin can view bookings for a user in the same battalion
    if current_user.role == "admin":
        if not username:
            raise HTTPException(
                status_code=400,
                detail="Username is required for admin",
            )

        booking_user = (
            db.query(User)
            .filter(User.username == username)
            .first()
        )

        if not booking_user:
            raise HTTPException(
                status_code=404,
                detail="User not found",
            )

        if booking_user.battalion != current_user.battalion:
            raise HTTPException(
                status_code=403,
                detail="You can only access users in your battalion",
            )

    # User can only view their own bookings
    elif current_user.role == "user":
        booking_user = current_user

    else:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to view meal bookings",
        )

    bookings = (
        db.query(MealBooking)
        .filter(
            MealBooking.user_id == booking_user.id
        )
        .order_by(MealBooking.book_date.asc())
        .all()
    )

    return bookings

@router.get(
    "/bookings/{book_date}",
    response_model=MealBookingResponse | None,
)
def get_meal_booking(
    book_date: date,
    username: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Admin: username is required
    if current_user.role == "admin":
        if not username:
            raise HTTPException(
                status_code=400,
                detail="Username is required for admin",
            )

        booking_user = (
            db.query(User)
            .filter(User.username == username)
            .first()
        )

        if not booking_user:
            raise HTTPException(
                status_code=404,
                detail="User not found",
            )

        # Admin can only access users in the same battalion
        if booking_user.battalion != current_user.battalion:
            raise HTTPException(
                status_code=403,
                detail="You can only access users in your battalion",
            )

    # Normal user: use token identity
    elif current_user.role == "user":
        booking_user = current_user

    else:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to view meal bookings",
        )

    booking = (
        db.query(MealBooking)
        .filter(
            MealBooking.user_id == booking_user.id,
            MealBooking.book_date == book_date,
        )
        .first()
    )

    return booking