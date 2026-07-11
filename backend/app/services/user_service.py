from datetime import UTC, datetime

from app.core.exceptions import AppException
from app.core.roles import ADMIN_ROLE_NAME, user_has_role
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.user import (
  AdminStatsResponse,
  UserMeContextResponse,
  UserMeResponse,
  UserPermissions,
)
from sqlalchemy.orm import Session


def list_users(db: Session) -> list[User]:
  return db.query(User).order_by(User.id).all()


def update_user_name(db: Session, user: User, *, name: str) -> User:
  user.name = name
  db.commit()
  db.refresh(user)
  return user


def change_password(
  db: Session,
  user: User,
  *,
  current_password: str,
  new_password: str,
) -> None:
  if not verify_password(current_password, user.hashed_password):
    raise AppException(
      message="현재 비밀번호가 올바르지 않습니다.",
      error_code="INVALID_CURRENT_PASSWORD",
      status_code=400,
    )

  if verify_password(new_password, user.hashed_password):
    raise AppException(
      message="새 비밀번호는 현재 비밀번호와 달라야 합니다.",
      error_code="SAME_PASSWORD",
      status_code=400,
    )

  user.hashed_password = hash_password(new_password)

  now = datetime.now(UTC)
  for refresh_token in user.refresh_tokens:
    if refresh_token.revoked_at is None:
      refresh_token.revoked_at = now

  db.commit()


def get_me_context(db: Session, user: User) -> UserMeContextResponse:
  """role 에 따라 응답 필드를 달리하는 패턴 예시."""
  is_admin = user_has_role(user, ADMIN_ROLE_NAME)
  permissions = UserPermissions(
    manage_users=is_admin,
    view_admin_stats=is_admin,
  )

  admin_stats = None
  if permissions.view_admin_stats:
    admin_stats = AdminStatsResponse(total_users=db.query(User).count())

  return UserMeContextResponse(
    profile=UserMeResponse.model_validate(user),
    permissions=permissions,
    admin_stats=admin_stats,
  )
