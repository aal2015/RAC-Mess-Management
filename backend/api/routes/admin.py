from datetime import date
from uuid import UUID

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
    CancelUserBookingRequest
)
from models.location import Location
from schemas.location import (
    CreateLocationRequest,
    LocationResponse,
    UpdateLocationRequest
)
from models.route_location import RouteLocation
from models.route import Route
from schemas.route import (
    RouteLocationResponse,
    UpdateRouteLocationRequest,
    AddRouteLocationRequest,
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
        raise HTTPException(
            status_code=400,
            detail="Role must be user or driver"
        )

    if not admin.battalion:
        raise HTTPException(
            status_code=400,
            detail="Admin is not assigned to a battalion"
        )

    exists = (
        db.query(User)
        .filter(User.username == request.username)
        .first()
    )

    if exists:
        raise HTTPException(
            status_code=409,
            detail="Username already exists"
        )

    user = User(
        username=request.username,
        password_hash=hash_password(request.password),
        name=request.name,
        phone=request.phone,
        role=request.role,
        location_id=request.location_id,

        # Inferred from the authenticated admin
        battalion=admin.battalion,

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
    if not admin.battalion:
        raise HTTPException(
            status_code=400,
            detail="Admin is not assigned to a battalion",
        )

    exists = (
        db.query(MealItem)
        .filter(
            MealItem.item == request.item.strip(),
            MealItem.battalion == admin.battalion,
        )
        .first()
    )

    if exists:
        raise HTTPException(
            status_code=409,
            detail="Meal item already exists",
        )

    meal_item = MealItem(
        item=request.item.strip(),
        battalion=admin.battalion,
    )

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

    if not request.dates:
        raise HTTPException(
            status_code=400,
            detail="At least one date is required",
        )

    if not request.lunch and not request.dinner:
        raise HTTPException(
            status_code=400,
            detail="At least one meal must be selected",
        )

    dates = list(set(request.dates))
    today = date.today()

    if any(booking_date < today for booking_date in dates):
        raise HTTPException(
            status_code=400,
            detail="Cannot create bookings for past dates",
        )

    existing = (
        db.query(MealBooking)
        .filter(
            MealBooking.user_id == booking_user.id,
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

    bookings = []

    for booking_date in dates:
        booking = MealBooking(
            user_id=booking_user.id,
            book_date=booking_date,
            lunch=request.lunch,
            dinner=request.dinner,
        )

        db.add(booking)
        bookings.append(booking)

    db.commit()

    for booking in bookings:
        db.refresh(booking)

    return bookings

@router.delete("/bookings")
def cancel_user_booking(
    request: CancelUserBookingRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
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

    if booking_user.battalion != admin.battalion:
        raise HTTPException(
            status_code=403,
            detail="You can only access users in your battalion",
        )

    booking = (
        db.query(MealBooking)
        .filter(
            MealBooking.user_id == booking_user.id,
            MealBooking.book_date == request.book_date,
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    db.delete(booking)
    db.commit()

    return {
        "message": "Booking cancelled successfully",
        "username": request.username,
        "book_date": request.book_date,
    }

@router.post(
    "/locations",
    response_model=LocationResponse,
)
def create_location(
    request: CreateLocationRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    user = (
        db.query(User)
        .filter(
            User.username == request.username,
            User.battalion == admin.battalion,
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found in your battalion",
        )

    if user.location_id:
        raise HTTPException(
            status_code=409,
            detail="User already has a location",
        )

    location = Location(
        latitude=request.latitude,
        longitude=request.longitude,
        road_name=request.road_name,
    )

    db.add(location)
    db.flush()

    user.location_id = location.id

    db.commit()
    db.refresh(location)

    return location

@router.patch(
    "/locations/{username}",
    response_model=LocationResponse,
)
def update_user_location(
    username: str,
    request: UpdateLocationRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    user = (
        db.query(User)
        .filter(
            User.username == username,
            User.battalion == admin.battalion,
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found in your battalion",
        )

    if not user.location_id:
        raise HTTPException(
            status_code=404,
            detail="User does not have a location",
        )

    location = db.get(Location, user.location_id)

    if not location:
        raise HTTPException(
            status_code=404,
            detail="Location not found",
        )

    if request.latitude is not None:
        location.latitude = request.latitude

    if request.longitude is not None:
        location.longitude = request.longitude

    if request.road_name is not None:
        location.road_name = request.road_name

    db.commit()
    db.refresh(location)

    return location


@router.delete("/locations/{username}")
def delete_user_location(
    username: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    user = (
        db.query(User)
        .filter(
            User.username == username,
            User.battalion == admin.battalion,
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found in your battalion",
        )

    if not user.location_id:
        raise HTTPException(
            status_code=404,
            detail="User does not have a location",
        )

    location = db.get(Location, user.location_id)

    if not location:
        # Keep the user's relationship consistent
        user.location_id = None
        db.commit()

        raise HTTPException(
            status_code=404,
            detail="Location not found",
        )

    user.location_id = None
    db.delete(location)

    db.commit()

    return {
        "message": "User location deleted successfully",
        "username": user.username,
    }


@router.post(
    "/{route_number}/locations",
    response_model=RouteLocationResponse,
)
def link_route_location(
    route_number: int,
    request: AddRouteLocationRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    if not admin.battalion:
        raise HTTPException(
            status_code=400,
            detail="Admin is not assigned to a battalion",
        )

    route = (
        db.query(Route)
        .filter(
            Route.route_number == route_number,
            Route.battalion == admin.battalion,
        )
        .first()
    )

    if not route:
        raise HTTPException(
            status_code=404,
            detail="Route not found in your battalion",
        )

    location = db.get(Location, request.location_id)

    if not location:
        raise HTTPException(
            status_code=404,
            detail="Location not found",
        )

    existing = (
        db.query(RouteLocation)
        .filter(
            RouteLocation.route_id == route.id,
            RouteLocation.location_id == request.location_id,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Location is already assigned to this route",
        )

    if request.stop_order is not None:
        existing_order = (
            db.query(RouteLocation)
            .filter(
                RouteLocation.route_id == route.id,
                RouteLocation.stop_order == request.stop_order,
            )
            .first()
        )

        if existing_order:
            raise HTTPException(
                status_code=409,
                detail="Stop order already exists for this route",
            )

    route_location = RouteLocation(
        route_id=route.id,
        location_id=request.location_id,
        stop_order=request.stop_order,
    )

    db.add(route_location)
    db.commit()
    db.refresh(route_location)

    return route_location


# update stop order
@router.patch(
    "/{route_number}/locations/{location_id}",
    response_model=RouteLocationResponse,
)
def update_route_location(
    route_number: int,
    location_id: UUID,
    request: UpdateRouteLocationRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    if not admin.battalion:
        raise HTTPException(
            status_code=400,
            detail="Admin is not assigned to a battalion",
        )

    route = (
        db.query(Route)
        .filter(
            Route.route_number == route_number,
            Route.battalion == admin.battalion,
        )
        .first()
    )

    if not route:
        raise HTTPException(
            status_code=404,
            detail="Route not found in your battalion",
        )

    route_location = (
        db.query(RouteLocation)
        .filter(
            RouteLocation.route_id == route.id,
            RouteLocation.location_id == location_id,
        )
        .first()
    )

    if not route_location:
        raise HTTPException(
            status_code=404,
            detail="Location is not assigned to this route",
        )

    if request.stop_order is not None:
        existing_order = (
            db.query(RouteLocation)
            .filter(
                RouteLocation.route_id == route.id,
                RouteLocation.stop_order == request.stop_order,
                RouteLocation.location_id != location_id,
            )
            .first()
        )

        if existing_order:
            raise HTTPException(
                status_code=409,
                detail="Stop order already exists for this route",
            )

    route_location.stop_order = request.stop_order

    db.commit()
    db.refresh(route_location)

    return route_location

@router.delete(
    "/{route_number}/locations/{location_id}",
)
def delete_route_location(
    route_number: int,
    location_id: UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    if not admin.battalion:
        raise HTTPException(
            status_code=400,
            detail="Admin is not assigned to a battalion",
        )

    route = (
        db.query(Route)
        .filter(
            Route.route_number == route_number,
            Route.battalion == admin.battalion,
        )
        .first()
    )

    if not route:
        raise HTTPException(
            status_code=404,
            detail="Route not found in your battalion",
        )

    route_location = (
        db.query(RouteLocation)
        .filter(
            RouteLocation.route_id == route.id,
            RouteLocation.location_id == location_id,
        )
        .first()
    )

    if not route_location:
        raise HTTPException(
            status_code=404,
            detail="Location is not assigned to this route",
        )

    db.delete(route_location)
    db.commit()

    return {
        "message": "Location removed from route successfully",
    }