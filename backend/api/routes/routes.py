# api/routes/routes.py

from datetime import date
from uuid import UUID
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from api.deps import get_current_user
from core.database import get_db
from models.location import Location
from models.meal_booking import MealBooking
from models.route import Route
from models.route_location import RouteLocation
from models.user import User
from schemas.route import (
    RouteResponse,
    RouteLocationResponse,
    RouteDriverResponse,
    DriverRouteAssignmentResponse,
)
from schemas.delivery import (
    DeliveryLocationResponse,
    DeliveryUserResponse,
    RouteMealBookingsResponse,
)

router = APIRouter(prefix="/routes", tags=["Routes"])

@router.get(
    "/my-assignment/bookings",
    response_model=RouteMealBookingsResponse,
)
def get_my_route_bookings(
    book_date: date = Query(default_factory=date.today),
    meal_type: Literal["lunch", "dinner"] = Query(default="lunch"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "driver":
        raise HTTPException(
            status_code=403,
            detail="Only drivers can access this endpoint",
        )

    if not current_user.battalion:
        raise HTTPException(
            status_code=400,
            detail="Driver is not assigned to a battalion",
        )

    route = (
        db.query(Route)
        .filter(
            Route.driver_id == current_user.id,
            Route.battalion == current_user.battalion,
            Route.is_active.is_(True),
        )
        .first()
    )

    if not route:
        raise HTTPException(
            status_code=404,
            detail="No active route assigned to this driver",
        )

    # Select the appropriate booking and delivery-status columns.
    meal_column = (
        MealBooking.lunch
        if meal_type == "lunch"
        else MealBooking.dinner
    )

    delivered_column = (
        MealBooking.lunch_delivered
        if meal_type == "lunch"
        else MealBooking.dinner_delivered
    )

    rows = (
        db.query(
            User,
            Location,
            RouteLocation.stop_order,
            delivered_column.label("is_delivered"),
        )
        .join(
            Location,
            User.location_id == Location.id,
        )
        .join(
            RouteLocation,
            RouteLocation.location_id == Location.id,
        )
        .join(
            MealBooking,
            MealBooking.user_id == User.id,
        )
        .filter(
            RouteLocation.route_id == route.id,
            User.battalion == current_user.battalion,
            User.role == "user",
            User.is_active.is_(True),
            MealBooking.book_date == book_date,
            meal_column.is_(True),
        )
        .order_by(
            RouteLocation.stop_order.asc().nulls_last(),
            User.name,
        )
        .all()
    )

    bookings = [
        DeliveryUserResponse(
            id=user.id,
            username=user.username,
            name=user.name,
            phone=user.phone,
            location=DeliveryLocationResponse(
                id=location.id,
                latitude=location.latitude,
                longitude=location.longitude,
                road_name=location.road_name,
            ),
            stop_order=stop_order,
            is_delivered=is_delivered,
        )
        for user, location, stop_order, is_delivered in rows
    ]

    return RouteMealBookingsResponse(
        book_date=book_date,
        meal_type=meal_type,
        route_number=route.route_number,
        route_name=route.name,
        total_bookings=len(bookings),
        delivered_count=sum(
            1 for booking in bookings if booking.is_delivered
        ),
        bookings=bookings,
    )

@router.get(
    "/my-assignment",
    response_model=DriverRouteAssignmentResponse,
)
def get_my_route_assignment(
    book_date: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "driver":
        raise HTTPException(
            status_code=403,
            detail="Only drivers can access this endpoint",
        )

    if not current_user.battalion:
        raise HTTPException(
            status_code=400,
            detail="Driver is not assigned to a battalion",
        )

    target_date = book_date or date.today()

    driver_response = RouteDriverResponse(
        id=current_user.id,
        username=current_user.username,
        name=current_user.name,
        phone=current_user.phone,
    )

    route = (
        db.query(Route)
        .filter(
            Route.driver_id == current_user.id,
            Route.battalion == current_user.battalion,
            Route.is_active.is_(True),
        )
        .first()
    )

    if not route:
        return DriverRouteAssignmentResponse(
            driver=driver_response,
            route=None,
            route_user_count=0,
            user_count=0,
            lunch_count=0,
            dinner_count=0,
            book_date=target_date,
        )

    # Count all active users assigned to this route.
    route_user_count = (
        db.query(func.count(func.distinct(User.id)))
        .join(Location, User.location_id == Location.id)
        .join(
            RouteLocation,
            RouteLocation.location_id == Location.id,
        )
        .filter(
            RouteLocation.route_id == route.id,
            User.battalion == current_user.battalion,
            User.role == "user",
            User.is_active.is_(True),
        )
        .scalar()
    ) or 0

    # Count bookings for the selected date.
    counts = (
        db.query(
            func.count(
                func.distinct(
                    case(
                        (
                            (MealBooking.lunch.is_(True))
                            | (MealBooking.dinner.is_(True)),
                            User.id,
                        )
                    )
                )
            ).label("user_count"),
            func.count(
                func.distinct(
                    case(
                        (MealBooking.lunch.is_(True), User.id)
                    )
                )
            ).label("lunch_count"),
            func.count(
                func.distinct(
                    case(
                        (MealBooking.dinner.is_(True), User.id)
                    )
                )
            ).label("dinner_count"),
        )
        .select_from(User)
        .join(Location, User.location_id == Location.id)
        .join(
            RouteLocation,
            RouteLocation.location_id == Location.id,
        )
        .join(
            MealBooking,
            MealBooking.user_id == User.id,
        )
        .filter(
            RouteLocation.route_id == route.id,
            User.battalion == current_user.battalion,
            User.role == "user",
            User.is_active.is_(True),
            MealBooking.book_date == target_date,
        )
        .one()
    )

    return DriverRouteAssignmentResponse(
        driver=driver_response,
        route=RouteResponse(
            id=route.id,
            battalion=route.battalion,
            route_number=route.route_number,
            name=route.name,
            driver=driver_response,
            is_active=route.is_active,
            created_at=route.created_at,
        ),
        route_user_count=route_user_count,
        user_count=counts.user_count,
        lunch_count=counts.lunch_count,
        dinner_count=counts.dinner_count,
        book_date=target_date,
    )

@router.get("/{route_id}", response_model=RouteResponse)
def get_route(
    route_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.battalion:
        raise HTTPException(
            status_code=400,
            detail="User is not assigned to a battalion",
        )

    route = (
        db.query(Route)
        .filter(
            Route.id == route_id,
            Route.battalion == current_user.battalion,
        )
        .first()
    )

    if not route:
        raise HTTPException(
            status_code=404,
            detail="Route not found",
        )

    return route


@router.get("", response_model=list[RouteResponse])
def get_routes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.battalion:
        raise HTTPException(
            status_code=400,
            detail="User is not assigned to a battalion",
        )

    rows = (
        db.query(Route, User)
        .outerjoin(
            User,
            Route.driver_id == User.id,
        )
        .filter(
            Route.battalion == current_user.battalion,
            Route.is_active.is_(True),
        )
        .order_by(Route.route_number)
        .all()
    )

    return [
        RouteResponse(
            id=route.id,
            battalion=route.battalion,
            route_number=route.route_number,
            name=route.name,
            driver=(
                RouteDriverResponse(
                    id=driver.id,
                    username=driver.username,
                    name=driver.name,
                    phone=driver.phone,
                )
                if driver
                else None
            ),
            is_active=route.is_active,
            created_at=route.created_at,
        )
        for route, driver in rows
    ]


@router.get(
    "/{route_number}/locations",
    response_model=list[RouteLocationResponse],
)
def get_route_locations(
    route_number: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.battalion:
        raise HTTPException(
            status_code=400,
            detail="User is not assigned to a battalion",
        )

    route = (
        db.query(Route)
        .filter(
            Route.route_number == route_number,
            Route.battalion == current_user.battalion,
        )
        .first()
    )

    if not route:
        raise HTTPException(
            status_code=404,
            detail="Route not found",
        )

    return (
        db.query(RouteLocation)
        .filter(RouteLocation.route_id == route.id)
        .order_by(
            RouteLocation.stop_order.asc().nulls_last()
        )
        .all()
    )