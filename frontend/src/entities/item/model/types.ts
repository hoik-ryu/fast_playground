// 백엔드 app/schemas/item.py 와 형태를 맞춘 타입.

export const ITEM_NAMES = ['사과', '바나나', '오렌지', '포도'] as const;

export type ItemName = (typeof ITEM_NAMES)[number];

export interface Item {
  id: number;
  name: string;
  price: number;
  is_offer: boolean | null;
}
