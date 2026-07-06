from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin


class AuditLog(Base, TimestampMixin):
  __tablename__ = "audit_logs"

  id: Mapped[int] = mapped_column(
    Integer,
    primary_key=True,
    index=True,
  )

  user_id: Mapped[int | None] = mapped_column(
    ForeignKey("users.id", ondelete="SET NULL"),
    nullable=True,
    index=True,
  )

  action: Mapped[str] = mapped_column(
    String(50),
    nullable=False,
    index=True,
  )

  resource_type: Mapped[str | None] = mapped_column(
    String(100),
    nullable=True,
  )

  resource_id: Mapped[int | None] = mapped_column(
    Integer,
    nullable=True,
  )

  description: Mapped[str | None] = mapped_column(
    String(500),
    nullable=True,
  )

  ip_address: Mapped[str | None] = mapped_column(
    String(45),
    nullable=True,
  )

  user_agent: Mapped[str | None] = mapped_column(
    String(500),
    nullable=True,
  )

  user = relationship(
    "User",
    back_populates="audit_logs",
  )