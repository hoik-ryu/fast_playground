"""
Item 비즈니스 로직.

DB 조회/저장/규칙 검증은 여기서 처리합니다.
예외는 AppException 하위 클래스를 raise 하고, main.py 전역 handler가 HTTP 응답으로 변환합니다.
"""

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import ItemNameDuplicateException, ItemNotFoundException
from app.models.item import Item
from app.schemas.item import ItemCreate, ItemUpdate


def list_items(db: Session, name: str | None = None) -> list[Item]:
    query = db.query(Item)
    if name:
        query = query.filter(Item.name == name)
    return query.all()


def get_item(db: Session, item_id: int) -> Item:
    item = db.query(Item).filter(Item.id == item_id).first()
    if item is None:
        raise ItemNotFoundException()
    return item


def create_item(db: Session, data: ItemCreate) -> Item:
    item = Item(**data.model_dump(mode="json"))
    db.add(item)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ItemNameDuplicateException()

    db.refresh(item)
    return item


def update_item(db: Session, item_id: int, data: ItemUpdate) -> Item:
    item = get_item(db, item_id)
    item.name = data.name.value
    item.price = data.price
    item.is_offer = data.is_offer

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ItemNameDuplicateException()

    db.refresh(item)
    return item


def delete_item(db: Session, item_id: int) -> Item:
    item = get_item(db, item_id)
    db.delete(item)
    db.commit()
    return item
