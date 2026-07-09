from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.responses import success_response
from app.db.database import get_db
from app.schemas.common import ApiResponse
from app.schemas.user import UserResponse
from app.services import user_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
  "",
  response_model=ApiResponse,
  summary="유저 목록 조회",
  description="등록된 모든 유저를 조회합니다. (개발/테스트용)",
)
def read_users(db: Session = Depends(get_db)):
  users = user_service.list_users(db)
  return success_response(
    message="유저 목록을 조회했습니다.",
    data=[UserResponse.model_validate(user) for user in users],
  )
