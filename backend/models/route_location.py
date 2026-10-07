from uuid import UUID

from sqlalchemy import (
    UUID as SQLAlchemyUUID,
    Integer,
    ForeignKey,
)
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base


class RouteLocation(Base):
    __tablename__ = "route_locations"

    route_id: Mapped[UUID] = mapped_column(
        SQLAlchemyUUID(as_uuid=True),
        ForeignKey("routes.id", ondelete="CASCADE"),
        primary_key=True,
    )

    location_id: Mapped[UUID] = mapped_column(
        SQLAlchemyUUID(as_uuid=True),
        ForeignKey("locations.id", ondelete="CASCADE"),
        primary_key=True,
    )

    stop_order: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )