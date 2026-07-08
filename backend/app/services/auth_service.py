from app.core.exceptions import AppException
from app.core.security import hash_password
from app.models.user import User
from app.schemas.auth import RegisterRequest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session


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
    is_active=True,
  )

  db.add(user)

  try:
    db.commit()
  except IntegrityError:
    db.rollback()
    raise AppException(
      message="이미 사용 중인 이메일입니다.",
      error_code="EMAIL_ALREADY_EXISTS",
      status_code=400,
    )

  db.refresh(user)

  return user
