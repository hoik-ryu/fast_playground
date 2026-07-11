from app.api.deps import get_current_user, require_admin
from app.core.responses import success_response
from app.db.database import get_db
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.user import (
  ChangePasswordRequest,
  UserMeResponse,
  UserMeUpdate,
  UserResponse,
)
from app.services import user_service
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(prefix="/users", tags=["Users"])


# --- 패턴 A: 로그인만 필요 (get_current_user) ---
@router.get(
  "/me",
  response_model=ApiResponse,
  summary="현재 로그인 유저 조회",
  description="JWT access token 으로 인증된 본인 정보와 role 목록을 반환합니다.",
)
def read_me(current_user: User = Depends(get_current_user)):
  return success_response(
    message="내 정보를 조회했습니다.",
    data=UserMeResponse.model_validate(current_user),
  )


@router.get(
  "/me/context",
  response_model=ApiResponse,
  summary="현재 로그인 유저 컨텍스트",
  description=(
    "로그인한 모든 사용자가 호출할 수 있습니다. "
    "role 에 따라 permissions·admin_stats 등 응답 필드가 달라집니다."
  ),
)
def read_me_context(
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
):
  return success_response(
    message="내 컨텍스트를 조회했습니다.",
    data=user_service.get_me_context(db, current_user),
  )


@router.patch(
  "/me",
  response_model=ApiResponse,
  summary="현재 로그인 유저 정보 수정",
  description="본인 프로필 정보를 수정합니다. 현재는 이름만 변경할 수 있습니다.",
)
def update_me(
  payload: UserMeUpdate,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
):
  user = user_service.update_user_name(db, current_user, name=payload.name)
  return success_response(
    message="내 정보를 수정했습니다.",
    data=UserMeResponse.model_validate(user),
  )


@router.patch(
  "/me/password",
  response_model=ApiResponse,
  summary="비밀번호 변경",
  description="현재 비밀번호 확인 후 새 비밀번호로 변경합니다.",
)
def change_my_password(
  payload: ChangePasswordRequest,
  db: Session = Depends(get_db),
  current_user: User = Depends(get_current_user),
):
  user_service.change_password(
    db,
    current_user,
    current_password=payload.current_password,
    new_password=payload.new_password,
  )
  return success_response(message="비밀번호를 변경했습니다.")


# --- 패턴 B: 특정 role 없으면 403 (require_admin / require_roles) ---
@router.get(
  "",
  response_model=ApiResponse,
  summary="유저 목록 조회 (admin)",
  description="admin role 이 있는 사용자만 전체 유저 목록을 조회할 수 있습니다.",
)
def read_users(
  db: Session = Depends(get_db),
  _admin: User = Depends(require_admin),
):
  users = user_service.list_users(db)
  return success_response(
    message="유저 목록을 조회했습니다.",
    data=[UserResponse.model_validate(user) for user in users],
  )
