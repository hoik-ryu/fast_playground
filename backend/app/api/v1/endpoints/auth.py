from app.core.config import settings
from app.core.responses import success_response
from app.db.database import get_db
from app.schemas.auth import (
  LoginRequest,
  LogoutRequest,
  RefreshTokenRequest,
  RegisterRequest,
  RegisterUserData,
)
from app.services.auth_service import (
  login_user,
  logout_user,
  refresh_token_pair,
  register_user,
)
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

router = APIRouter(
  prefix="/auth",
  tags=["Auth"],
)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(
  request: RegisterRequest,
  db: Session = Depends(get_db),
):
  user = register_user(db, request)

  message = (
    "회원가입 신청이 완료되었습니다. 관리자 승인 후 로그인할 수 있습니다."
    if settings.requires_admin_approval
    else "회원가입 성공"
  )

  return success_response(
    message=message,
    data=RegisterUserData.model_validate(user),
  )


@router.post("/login")
def login(
  request: LoginRequest,
  http_request: Request,
  db: Session = Depends(get_db),
):
  tokens = login_user(
    db=db,
    request=request,
    user_agent=http_request.headers.get("user-agent"),
    ip_address=http_request.client.host if http_request.client else None,
  )

  return success_response(
    message="로그인 성공",
    data=tokens,
  )


@router.post("/refresh")
def refresh(
  request: RefreshTokenRequest,
  http_request: Request,
  db: Session = Depends(get_db),
):
  tokens = refresh_token_pair(
    db=db,
    refresh_token=request.refresh_token,
    user_agent=http_request.headers.get("user-agent"),
    ip_address=http_request.client.host if http_request.client else None,
  )

  return success_response(
    message="토큰 갱신 성공",
    data=tokens,
  )


@router.post("/logout")
def logout(
  request: LogoutRequest,
  db: Session = Depends(get_db),
):
  logout_user(
    db=db,
    refresh_token=request.refresh_token,
  )

  return success_response(
    message="로그아웃 성공",
    data=None,
  )
