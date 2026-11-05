from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from api.deps import get_current_user

from models.route import Route
from models.route_location import RouteLocation
from models.delivery_session import DeliverySession

from schemas.tracking import (
    TrackingStartRequest,
    TrackingLocationUpdate,
    TrackingTargetUpdate,
    TrackingSessionResponse,
    ActiveTrackingSessionResponse,
)

router = APIRouter(
    prefix="/tracking",
    tags=["Tracking"],
)


def require_driver(current_user):
    if current_user.role != "driver":
        raise HTTPException(
            status_code=403,
            detail="Only drivers can access tracking",
        )


@router.post(
    "/sessions",
    response_model=TrackingSessionResponse,
    status_code=201,
)
def start_tracking(
    request: TrackingStartRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    require_driver(current_user)

    # Verify that the route belongs to this driver.
    route = db.query(Route).filter(
        Route.id == request.route_id,
        Route.driver_id == current_user.id,
        Route.battalion == current_user.battalion,
        Route.is_active.is_(True),
    ).first()

    if not route:
        raise HTTPException(
            status_code=404,
            detail="Assigned active route not found",
        )

    # Check whether this driver already has an active session
    # on any of their assigned routes.
    active_session = (
        db.query(DeliverySession)
        .join(Route, DeliverySession.route_id == Route.id)
        .filter(
            Route.driver_id == current_user.id,
            DeliverySession.is_active.is_(True),
        )
        .first()
    )

    if active_session:
        raise HTTPException(
            status_code=409,
            detail="You already have an active tracking session",
        )

    now = datetime.now(timezone.utc)

    session = DeliverySession(
        route_id=route.id,
        book_date=request.book_date,
        meal_type=request.meal_type,

        start_latitude=request.latitude,
        start_longitude=request.longitude,

        current_latitude=request.latitude,
        current_longitude=request.longitude,

        is_active=True,
        started_at=now,
        updated_at=now,
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return session


@router.get(
    "/sessions/active",
    response_model=ActiveTrackingSessionResponse,
)
def get_active_tracking_session(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    require_driver(current_user)

    session = (
        db.query(DeliverySession)
        .join(Route, DeliverySession.route_id == Route.id)
        .filter(
            Route.driver_id == current_user.id,
            DeliverySession.is_active.is_(True),
        )
        .order_by(DeliverySession.started_at.desc())
        .first()
    )

    if not session:
        return {
            "has_active_session": False,
            "session": None,
        }

    return {
        "has_active_session": True,
        "session": session,
    }


@router.patch(
    "/sessions/{session_id}/location",
    response_model=TrackingSessionResponse,
)
def update_tracking_location(
    session_id: UUID,
    request: TrackingLocationUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    require_driver(current_user)

    session = (
        db.query(DeliverySession)
        .join(Route, DeliverySession.route_id == Route.id)
        .filter(
            DeliverySession.id == session_id,
            Route.driver_id == current_user.id,
            DeliverySession.is_active.is_(True),
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Active tracking session not found",
        )

    session.current_latitude = request.latitude
    session.current_longitude = request.longitude
    session.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(session)

    return session


@router.patch(
    "/sessions/{session_id}/target",
    response_model=TrackingSessionResponse,
)
def update_tracking_target(
    session_id: UUID,
    request: TrackingTargetUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    require_driver(current_user)

    session = (
        db.query(DeliverySession)
        .join(Route, DeliverySession.route_id == Route.id)
        .filter(
            DeliverySession.id == session_id,
            Route.driver_id == current_user.id,
            DeliverySession.is_active.is_(True),
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Active tracking session not found",
        )

    # Allow the driver to clear the selected destination.
    if request.location_id is not None:
        route_location = db.query(RouteLocation).filter(
            RouteLocation.route_id == session.route_id,
            RouteLocation.location_id == request.location_id,
        ).first()

        if not route_location:
            raise HTTPException(
                status_code=400,
                detail="Selected location does not belong to your route",
            )

    session.target_location_id = request.location_id
    session.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(session)

    return session


@router.post(
    "/sessions/{session_id}/stop",
    response_model=TrackingSessionResponse,
)
def stop_tracking(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    require_driver(current_user)

    session = (
        db.query(DeliverySession)
        .join(Route, DeliverySession.route_id == Route.id)
        .filter(
            DeliverySession.id == session_id,
            Route.driver_id == current_user.id,
            DeliverySession.is_active.is_(True),
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Active tracking session not found",
        )

    now = datetime.now(timezone.utc)

    session.is_active = False
    session.ended_at = now
    session.updated_at = now

    db.commit()
    db.refresh(session)

    return session