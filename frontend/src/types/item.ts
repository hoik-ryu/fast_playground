// 백엔드 app/schemas/item.py 와 형태를 맞춘 타입.
// 백엔드 스키마를 바꾸면 여기도 함께 수정하세요.

export interface Item {
  id: number;
  name: string;
  price: number;
  is_offer: boolean | null;
}

export interface ItemCreate {
  name: string;
  price: number;
  is_offer?: boolean | null;
}

export interface ItemUpdate {
  name: string;
  price: number;
  is_offer?: boolean | null;
}
