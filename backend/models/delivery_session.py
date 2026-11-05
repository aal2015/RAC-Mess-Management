from datetime import date, datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base


class DeliverySession(Base):
    __tablename__ = "delivery_sessions"

    __table_args__ = (
        CheckConstraint(
            "start_latitude BETWEEN -90 AND 90",
            name="check_start_latitude",
        ),
        CheckConstraint(
            "start_longitude BETWEEN -180 AND 180",
            name="check_start_longitude",
        ),
        CheckConstraint(
            "current_latitude BETWEEN -90 AND 90",
            name="check_current_latitude",
        ),
        CheckConstraint(
            "current_longitude BETWEEN -180 AND 180",
            name="check_current_longitude",
        ),
        CheckConstraint(
            "meal_type IN ('lunch', 'dinner')",
            name="check_meal_type",
        ),
        Index(
            "uq_active_route_session",
            "route_id",
            unique=True,
            postgresql_where=text("is_active = TRUE"),
        ),
    )

    id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    route_id: Mapped[UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("routes.id", ondelete="RESTRICT"),
        nullable=False,
    )

    book_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    meal_type: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    target_location_id: Mapped[UUID | None] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("locations.id", ondelete="SET NULL"),
        nullable=True,
    )

    start_latitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    start_longitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    current_latitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    current_longitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    ended_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )