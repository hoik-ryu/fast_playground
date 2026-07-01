"""
Item 비즈니스 로직.

DB 조회/저장/규칙 검증은 여기서 처리합니다.
HTTP 상태 코드(404, 409)는 endpoint에서 service 예외를 받아 변환하세요.
"""

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.item import Item
from app.schemas.item import ItemCreate, ItemUpdate


class ItemNotFoundError(Exception):
    pass


class ItemNameDuplicateError(Exception):
    pass


def list_items(db: Session, name: str | None = None) -> list[Item]:
    query = db.query(Item)
    if name:
        query = query.filter(Item.name == name)
    return query.all()


def get_item(db: Session, item_id: int) -> Item:
    item = db.query(Item).filter(Item.id == item_id).first()
    if item is None:
        raise ItemNotFoundError()
    return item


def create_item(db: Session, data: ItemCreate) -> Item:
    item = Item(**data.model_dump())
    db.add(item)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ItemNameDuplicateError()

    db.refresh(item)
    return item


def update_item(db: Session, item_id: int, data: ItemUpdate) -> Item:
    item = get_item(db, item_id)
    item.name = data.name
    item.price = data.price
    item.is_offer = data.is_offer

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ItemNameDuplicateError()

    db.refresh(item)
    return item


def delete_item(db: Session, item_id: int) -> Item:
    item = get_item(db, item_id)
    db.delete(item)
    db.commit()
    return item
