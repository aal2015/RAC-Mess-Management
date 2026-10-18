from uuid import UUID, uuid4

from sqlalchemy import ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID as SQLAlchemyUUID
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base


class RouteLocation(Base):
    __tablename__ = "route_locations"

    id: Mapped[UUID] = mapped_column(
        SQLAlchemyUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    route_id: Mapped[UUID] = mapped_column(
        SQLAlchemyUUID(as_uuid=True),
        ForeignKey("routes.id", ondelete="CASCADE"),
        nullable=False,
    )

    location_id: Mapped[UUID | None] = mapped_column(
        SQLAlchemyUUID(as_uuid=True),
        ForeignKey("locations.id", ondelete="CASCADE"),
        nullable=True,
    )

    mess_location_id: Mapped[UUID | None] = mapped_column(
        SQLAlchemyUUID(as_uuid=True),
        ForeignKey("mess_locations.id", ondelete="CASCADE"),
        nullable=True,
    )

    stop_order: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )