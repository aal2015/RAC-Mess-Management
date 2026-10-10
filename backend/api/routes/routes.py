# api/routes/routes.py

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from api.deps import get_current_user
from core.database import get_db
from models.route import Route
from models.route_location import RouteLocation
from models.location import Location
from models.user import User
from schemas.route import (
    RouteResponse,
    RouteLocationResponse,
    RouteDriverResponse,
    DriverRouteAssignmentResponse,
)

router = APIRouter(prefix="/routes", tags=["Routes"])

@router.get(
    "/my-assignment",
    response_model=DriverRouteAssignmentResponse,
)
def get_my_route_assignment(
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
        return DriverRouteAssignmentResponse(
            driver=RouteDriverResponse(
                id=current_user.id,
                username=current_user.username,
                name=current_user.name,
                phone=current_user.phone,
            ),
            route=None,
            user_count=0,
        )

    user_count = (
        db.query(func.count(func.distinct(User.id)))
        .join(
            Location,
            User.location_id == Location.id,
        )
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
    )

    return DriverRouteAssignmentResponse(
        driver=RouteDriverResponse(
            id=current_user.id,
            username=current_user.username,
            name=current_user.name,
            phone=current_user.phone,
        ),
        route=RouteResponse(
            id=route.id,
            battalion=route.battalion,
            route_number=route.route_number,
            name=route.name,
            driver=RouteDriverResponse(
                id=current_user.id,
                username=current_user.username,
                name=current_user.name,
                phone=current_user.phone,
            ),
            is_active=route.is_active,
            created_at=route.created_at,
        ),
        user_count=user_count or 0,
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