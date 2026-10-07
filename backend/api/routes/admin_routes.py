from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.deps import get_current_admin
from core.database import get_db

from models.location import Location
from models.route import Route
from models.route_location import RouteLocation
from models.user import User

from schemas.route import (
    AddRouteLocationRequest,
    CreateRouteRequest,
    RouteResponse,
    UpdateRouteRequest,
)

router = APIRouter(
    prefix="/admin/routes",
    tags=["admin routes"],
)


@router.post(
    "",
    response_model=RouteResponse,
)
def create_route(
    request: CreateRouteRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    if not admin.battalion:
        raise HTTPException(
            status_code=400,
            detail="Admin is not assigned to a battalion",
        )

    existing_route = (
        db.query(Route)
        .filter(
            Route.battalion == admin.battalion,
            Route.route_number == request.route_number,
        )
        .first()
    )

    if existing_route:
        raise HTTPException(
            status_code=409,
            detail="Route number already exists in your battalion",
        )

    route = Route(
        battalion=admin.battalion,
        route_number=request.route_number,
        name=request.name.strip(),
    )

    db.add(route)
    db.commit()
    db.refresh(route)

    return route

@router.patch(
    "/{route_id}",
    response_model=RouteResponse,
)
def update_route(
    route_id: UUID,
    request: UpdateRouteRequest,
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
            Route.id == route_id,
            Route.battalion == admin.battalion,
        )
        .first()
    )

    if not route:
        raise HTTPException(
            status_code=404,
            detail="Route not found in your battalion",
        )

    if request.route_number is not None:
        existing_route = (
            db.query(Route)
            .filter(
                Route.battalion == admin.battalion,
                Route.route_number == request.route_number,
                Route.id != route.id,
            )
            .first()
        )

        if existing_route:
            raise HTTPException(
                status_code=409,
                detail="Route number already exists in your battalion",
            )

        route.route_number = request.route_number

    if request.name is not None:
        route.name = request.name.strip()

    if request.driver_username is not None:
        driver = (
            db.query(User)
            .filter(
                User.username == request.driver_username,
                User.battalion == admin.battalion,
            )
            .first()
        )

        if not driver:
            raise HTTPException(
                status_code=404,
                detail="Driver not found in your battalion",
            )

        if driver.role != "driver":
            raise HTTPException(
                status_code=400,
                detail="User is not a driver",
            )

        if not driver.is_active:
            raise HTTPException(
                status_code=400,
                detail="Driver is inactive",
            )

        route.driver_id = driver.id

    db.commit()
    db.refresh(route)

    return route

@router.delete("/{route_id}")
def delete_route(
    route_id: UUID,
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
            Route.id == route_id,
            Route.battalion == admin.battalion,
        )
        .first()
    )

    if not route:
        raise HTTPException(
            status_code=404,
            detail="Route not found in your battalion",
        )

    db.delete(route)
    db.commit()

    return {
        "message": "Route deleted successfully",
        "route_id": route_id,
    }