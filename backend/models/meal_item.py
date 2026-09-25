from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import UUID as SQLAlchemyUUID
from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base


class MealItem(Base):
    __tablename__ = "meal_items"

    id: Mapped[UUID] = mapped_column(
        SQLAlchemyUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    item: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )