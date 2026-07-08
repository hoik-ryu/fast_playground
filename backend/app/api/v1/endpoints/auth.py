from app.core.responses import success_response
from app.db.database import get_db
from app.schemas.auth import RegisterRequest
from app.services.auth_service import register_user
from fastapi import APIRouter, Depends, status
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

  return success_response(
    message="회원가입 성공",
    data={
      "id": user.id,
      "email": user.email,
      "name": user.name,
    },
  )
