import type { ItemName } from '@entities/item';

export interface ItemCreate {
  name: ItemName;
  price: number;
  is_offer?: boolean | null;
}

export interface ItemUpdate {
  name: ItemName;
  price: number;
  is_offer?: boolean | null;
}
