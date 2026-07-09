from datetime import UTC, datetime, timedelta
from typing import Any

import jwt
from app.core.config import settings
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
  return password_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
  return password_hash.verify(plain_password, hashed_password)


def create_access_token(subject: str | int) -> str:
  expire = datetime.now(UTC) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
  payload: dict[str, Any] = {
    "sub": str(subject),
    "type": "access",
    "exp": expire,
  }

  return jwt.encode(
    payload,
    settings.SECRET_KEY,
    algorithm=settings.ALGORITHM,
  )


def create_refresh_token(subject: str | int) -> tuple[str, datetime]:
  expire = datetime.now(UTC) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

  payload: dict[str, Any] = {
    "sub": str(subject),
    "type": "refresh",
    "exp": expire,
  }

  token = jwt.encode(
    payload,
    settings.SECRET_KEY,
    algorithm=settings.ALGORITHM,
  )

  return token, expire


def decode_token(token: str) -> dict[str, Any]:
  return jwt.decode(
    token,
    settings.SECRET_KEY,
    algorithms=[settings.ALGORITHM],
  )


def decode_token_ignore_expiry(token: str) -> dict[str, Any]:
  return jwt.decode(
    token,
    settings.SECRET_KEY,
    algorithms=[settings.ALGORITHM],
    options={"verify_exp": False},
  )
