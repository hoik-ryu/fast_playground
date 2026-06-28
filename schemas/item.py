from pydantic import BaseModel, ConfigDict

# schemas/item.py
class ItemCreate(BaseModel):
    name: str
    price: float
    is_offer: bool | None = None


class ItemUpdate(BaseModel):
    name: str
    price: float
    is_offer: bool | None = None


class ItemResponse(BaseModel):
    id: int
    name: str
    price: float
    is_offer: bool | None

    model_config = ConfigDict(from_attributes=True)  # SQLAlchemy 객체 → JSON 변환