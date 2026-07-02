"""
Items API endpoints.

- API 제목/설명/에러 응답: @router.*(..., summary=, description=, responses=)
- Path/Query 파라미터 설명: Path(), Query()
- body 필드 설명: app/schemas/item.py 의 Field(description=...)
- 비즈니스 로직: app/services/item_service.py
- 전역 Swagger 설정: app/core/openapi.py
"""

from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.item import ItemCreate, ItemResponse, ItemUpdate
from app.services import item_service

router = APIRouter(prefix="/items", tags=["Items"])


@router.post(
    "",
    response_model=ItemResponse,
    summary="상품 생성",
    description="PostgreSQL items 테이블에 새 행을 추가합니다.",
    responses={
        409: {"description": "name 중복"},
    },
)
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    try:
        return item_service.create_item(db, item)
    except item_service.ItemNameDuplicateError:
        raise HTTPException(status_code=409, detail="중복된 이름으로 생성할 수 없습니다.")


@router.get(
    "",
    response_model=list[ItemResponse],
    summary="상품 목록 조회",
    description="등록된 상품 목록을 반환합니다. name Query로 필터할 수 있습니다.",
)
def read_items(
    name: str | None = Query(
        default=None,
        description="이름으로 필터 (Swagger Query 파라미터 예시)",
        examples=["사과"],
    ),
    db: Session = Depends(get_db),
):
    return item_service.list_items(db, name=name)


@router.get(
    "/{item_id}",
    response_model=ItemResponse,
    summary="상품 단건 조회",
    responses={404: {"description": "상품 없음"}},
)
def read_item(
    item_id: int = Path(..., description="조회할 상품 ID", ge=1),
    db: Session = Depends(get_db),
):
    try:
        return item_service.get_item(db, item_id)
    except item_service.ItemNotFoundError:
        raise HTTPException(status_code=404, detail="Item not found")


@router.put(
    "/{item_id}",
    response_model=ItemResponse,
    summary="상품 수정",
    description="기존 상품 정보를 수정합니다.",
    responses={
        404: {"description": "상품 없음"},
        409: {"description": "name 중복"},
    },
)
def update_item(item_id: int, item: ItemUpdate, db: Session = Depends(get_db)):
    try:
        return item_service.update_item(db, item_id, item)
    except item_service.ItemNotFoundError:
        raise HTTPException(status_code=404, detail="Item not found")
    except item_service.ItemNameDuplicateError:
        raise HTTPException(status_code=409, detail="중복된 이름으로 수정할 수 없습니다.")


@router.delete(
    "/{item_id}",
    response_model=ItemResponse,
    summary="상품 삭제",
    responses={404: {"description": "상품 없음"}},
)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    try:
        return item_service.delete_item(db, item_id)
    except item_service.ItemNotFoundError:
        raise HTTPException(status_code=404, detail="Item not found")
