import jwt
from app.core.exceptions import AppException
from app.core.roles import ADMIN_ROLE_NAME, user_has_any_role
from app.core.security import decode_token
from app.db.database import get_db
from app.models.user import User
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
  credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
  db: Session = Depends(get_db),
) -> User:
  if credentials is None or not credentials.credentials:
    raise AppException(
      message="인증이 필요합니다.",
      error_code="UNAUTHORIZED",
      status_code=401,
    )

  try:
    payload = decode_token(credentials.credentials)
  except jwt.ExpiredSignatureError:
    raise AppException(
      message="access token이 만료되었습니다.",
      error_code="ACCESS_TOKEN_EXPIRED",
      status_code=401,
    ) from None
  except jwt.PyJWTError:
    raise AppException(
      message="유효하지 않은 access token입니다.",
      error_code="INVALID_ACCESS_TOKEN",
      status_code=401,
    ) from None

  if payload.get("type") != "access":
    raise AppException(
      message="access token이 아닙니다.",
      error_code="INVALID_TOKEN_TYPE",
      status_code=401,
    )

  subject = payload.get("sub")
  if subject is None:
    raise AppException(
      message="토큰에 사용자 정보가 없습니다.",
      error_code="INVALID_TOKEN_SUBJECT",
      status_code=401,
    )

  try:
    user_id = int(subject)
  except ValueError:
    raise AppException(
      message="토큰 사용자 정보가 올바르지 않습니다.",
      error_code="INVALID_TOKEN_SUBJECT",
      status_code=401,
    ) from None

  user = db.get(User, user_id)
  if not user or not user.is_active:
    raise AppException(
      message="사용자를 찾을 수 없거나 비활성화된 사용자입니다.",
      error_code="INVALID_USER",
      status_code=401,
    )

  return user


def require_roles(*role_names: str):
  """지정 role 중 하나라도 있으면 통과하는 Depends 팩토리."""

  def checker(current_user: User = Depends(get_current_user)) -> User:
    if not role_names:
      return current_user

    if not user_has_any_role(current_user, role_names):
      raise AppException(
        message="권한이 없습니다.",
        error_code="FORBIDDEN",
        status_code=403,
      )

    return current_user

  return checker


require_admin = require_roles(ADMIN_ROLE_NAME)
