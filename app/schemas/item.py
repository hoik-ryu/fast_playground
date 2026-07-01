"""
Pydantic 스키마 — API 요청/응답 형태.

Field(description=...) 수정 시 Swagger의 body/response 필드 설명이 바뀝니다.
전역 제목·태그는 app/core/openapi.py 를 수정하세요.
"""

from pydantic import BaseModel, ConfigDict, Field


class ItemCreate(BaseModel):
    name: str = Field(..., description="상품명 (unique)", examples=["사과"])
    price: float = Field(..., description="가격", ge=0, examples=[1000])
    is_offer: bool | None = Field(None, description="할인 여부")


class ItemUpdate(BaseModel):
    name: str
    price: float
    is_offer: bool | None = None


class ItemResponse(BaseModel):
    id: int = Field(..., description="상품 ID")
    name: str
    price: float
    is_offer: bool | None

    model_config = ConfigDict(from_attributes=True)
