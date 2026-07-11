from datetime import UTC, datetime

import jwt
from app.core.config import settings
from app.core.exceptions import AppException
from app.core.security import (
  create_access_token,
  create_refresh_token,
  decode_token,
  decode_token_ignore_expiry,
  hash_password,
  verify_password,
)
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest
from app.services.role_service import assign_default_user_role
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session


def build_token_response(access_token: str, refresh_token: str) -> dict[str, str]:
  return {
    "access_token": access_token,
    "refresh_token": refresh_token,
    "token_type": "bearer",
  }


def register_user(
  db: Session,
  request: RegisterRequest,
) -> User:
  existing_user = db.query(User).filter(User.email == request.email).first()

  if existing_user:
    raise AppException(
      message="이미 사용 중인 이메일입니다.",
      error_code="EMAIL_ALREADY_EXISTS",
      status_code=400,
    )

  user = User(
    email=request.email,
    name=request.name,
    hashed_password=hash_password(request.password),
    is_active=not settings.requires_admin_approval,
  )

  db.add(user)

  try:
    db.flush()
    assign_default_user_role(db, user)
    db.commit()
  except IntegrityError:
    db.rollback()
    raise AppException(
      message="이미 사용 중인 이메일입니다.",
      error_code="EMAIL_ALREADY_EXISTS",
      status_code=400,
    ) from None

  db.refresh(user)

  return user


def login_user(
  db: Session,
  request: LoginRequest,
  user_agent: str | None = None,
  ip_address: str | None = None,
) -> dict[str, str]:
  user = db.query(User).filter(User.email == request.email).first()

  if not user or not verify_password(request.password, user.hashed_password):
    raise AppException(
      message="이메일 또는 비밀번호가 올바르지 않습니다.",
      error_code="INVALID_CREDENTIALS",
      status_code=401,
    )

  if not user.is_active:
    raise AppException(
      message=(
        "관리자 승인 대기 중입니다. 승인 후 로그인할 수 있습니다."
        if settings.requires_admin_approval
        else "비활성화된 사용자입니다."
      ),
      error_code="INACTIVE_USER",
      status_code=403,
    )

  access_token = create_access_token(user.id)
  refresh_token, refresh_expires_at = create_refresh_token(user.id)

  refresh_token_row = RefreshToken(
    user_id=user.id,
    token_hash=hash_password(refresh_token),
    expires_at=refresh_expires_at,
    user_agent=user_agent,
    ip_address=ip_address,
  )

  user.last_login_at = datetime.now(UTC)

  db.add(refresh_token_row)
  db.commit()

  return build_token_response(access_token, refresh_token)


def _decode_refresh_payload(refresh_token: str, *, verify_exp: bool) -> dict:
  try:
    if verify_exp:
      return decode_token(refresh_token)
    return decode_token_ignore_expiry(refresh_token)
  except jwt.ExpiredSignatureError:
    raise AppException(
      message="만료된 refresh token입니다.",
      error_code="REFRESH_TOKEN_EXPIRED",
      status_code=401,
    ) from None
  except jwt.PyJWTError:
    raise AppException(
      message="유효하지 않은 refresh token입니다.",
      error_code="INVALID_REFRESH_TOKEN",
      status_code=401,
    ) from None


def _extract_user_id_from_refresh(payload: dict) -> int:
  if payload.get("type") != "refresh":
    raise AppException(
      message="refresh token이 아닙니다.",
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
    return int(subject)
  except ValueError:
    raise AppException(
      message="토큰 사용자 정보가 올바르지 않습니다.",
      error_code="INVALID_TOKEN_SUBJECT",
      status_code=401,
    ) from None


def _find_refresh_token_row(
  db: Session,
  refresh_token: str,
  *,
  verify_exp: bool,
) -> RefreshToken:
  payload = _decode_refresh_payload(refresh_token, verify_exp=verify_exp)
  user_id = _extract_user_id_from_refresh(payload)

  user = db.query(User).filter(User.id == user_id).first()
  if not user or not user.is_active:
    raise AppException(
      message="사용자를 찾을 수 없거나 비활성화된 사용자입니다.",
      error_code="INVALID_USER",
      status_code=401,
    )

  active_refresh_tokens = (
    db.query(RefreshToken)
    .filter(
      RefreshToken.user_id == user.id,
      RefreshToken.revoked_at.is_(None),
    )
    .all()
  )

  for token_row in active_refresh_tokens:
    if verify_password(refresh_token, token_row.token_hash):
      return token_row

  raise AppException(
    message="등록되지 않았거나 폐기된 refresh token입니다.",
    error_code="REFRESH_TOKEN_NOT_FOUND",
    status_code=401,
  )


def refresh_token_pair(
  db: Session,
  refresh_token: str,
  user_agent: str | None = None,
  ip_address: str | None = None,
) -> dict[str, str]:
  current_refresh_token = _find_refresh_token_row(
    db,
    refresh_token,
    verify_exp=True,
  )

  now = datetime.now(UTC)

  if current_refresh_token.expires_at < now:
    current_refresh_token.revoked_at = now
    db.commit()

    raise AppException(
      message="만료된 refresh token입니다.",
      error_code="REFRESH_TOKEN_EXPIRED",
      status_code=401,
    )

  current_refresh_token.revoked_at = now

  new_access_token = create_access_token(current_refresh_token.user_id)
  new_refresh_token, new_refresh_expires_at = create_refresh_token(
    current_refresh_token.user_id,
  )

  new_refresh_token_row = RefreshToken(
    user_id=current_refresh_token.user_id,
    token_hash=hash_password(new_refresh_token),
    expires_at=new_refresh_expires_at,
    user_agent=user_agent,
    ip_address=ip_address,
  )

  db.add(new_refresh_token_row)
  db.commit()

  return build_token_response(new_access_token, new_refresh_token)


def logout_user(
  db: Session,
  refresh_token: str,
) -> None:
  # 로그아웃은 JWT 만료 여부와 무관하게 해당 유저 refresh row 를 폐기
  current_refresh_token = _find_refresh_token_row(
    db,
    refresh_token,
    verify_exp=False,
  )

  current_refresh_token.revoked_at = datetime.now(UTC)
  db.commit()
