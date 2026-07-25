"""
Items API endpoints.

- API 제목/설명/에러 응답: @router.*(..., summary=, description=, responses=)
- Path/Query 파라미터 설명: Path(), Query()
- body 필드 설명: app/schemas/item.py 의 Field(description=...)
- 비즈니스 로직: app/services/item_service.py
- 전역 Swagger 설정: app/core/openapi.py
- 예외 처리: service에서 AppException raise → main.py 전역 handler
- 성공 응답: success_response(data=...) 공통 형식
"""

from app.api.deps import get_current_user
from app.core.responses import success_response
from app.db.database import get_db
from app.models.user import User
from app.schemas.common import ApiResponse, ErrorResponse
from app.schemas.item import ItemCreate, ItemName, ItemResponse, ItemUpdate
from app.services import item_service
from fastapi import APIRouter, Depends, Path, Query
from sqlalchemy.orm import Session

router = APIRouter(prefix="/items", tags=["Items"])


@router.post(
  "",
  response_model=ApiResponse,
  summary="상품 생성",
  description=(
    "PostgreSQL items 테이블에 새 행을 추가합니다. name은 과일 enum만 허용됩니다."
  ),
  responses={
    409: {"model": ErrorResponse},
    422: {"model": ErrorResponse},
  },
)
def create_item(
  item: ItemCreate,
  db: Session = Depends(get_db),
  _current_user: User = Depends(get_current_user),
):
  created = item_service.create_item(db, item)
  return success_response(
    message="상품이 생성되었습니다.",
    data=ItemResponse.model_validate(created),
  )


@router.get(
  "",
  response_model=ApiResponse,
  summary="상품 목록 조회",
  description="등록된 상품 목록을 반환합니다. name Query로 필터할 수 있습니다.",
)
def read_items(
  name: ItemName | None = Query(
    default=None,
    description="이름으로 필터 (과일 enum)",
    examples=[ItemName.APPLE],
  ),
  db: Session = Depends(get_db),
  _current_user: User = Depends(get_current_user),
):
  items = item_service.list_items(db, name=name.value if name else None)
  return success_response(
    message="상품 목록을 조회했습니다.",
    data=[ItemResponse.model_validate(item) for item in items],
  )


@router.get(
  "/{item_id}",
  response_model=ApiResponse,
  summary="상품 단건 조회",
  responses={404: {"model": ErrorResponse}},
)
def read_item(
  item_id: int = Path(..., description="조회할 상품 ID", ge=1),
  db: Session = Depends(get_db),
  _current_user: User = Depends(get_current_user),
):
  item = item_service.get_item(db, item_id)
  return success_response(
    message="상품을 조회했습니다.",
    data=ItemResponse.model_validate(item),
  )


@router.put(
  "/{item_id}",
  response_model=ApiResponse,
  summary="상품 수정",
  description="기존 상품 정보를 수정합니다.",
  responses={
    404: {"model": ErrorResponse},
    409: {"model": ErrorResponse},
  },
)
def update_item(
  item_id: int,
  item: ItemUpdate,
  db: Session = Depends(get_db),
  _current_user: User = Depends(get_current_user),
):
  updated = item_service.update_item(db, item_id, item)
  return success_response(
    message="상품이 수정되었습니다.",
    data=ItemResponse.model_validate(updated),
  )


@router.delete(
  "/{item_id}",
  response_model=ApiResponse,
  summary="상품 삭제",
  responses={404: {"model": ErrorResponse}},
)
def delete_item(
  item_id: int,
  db: Session = Depends(get_db),
  _current_user: User = Depends(get_current_user),
):
  deleted = item_service.delete_item(db, item_id)
  return success_response(
    message="상품이 삭제되었습니다.",
    data=ItemResponse.model_validate(deleted),
  )
