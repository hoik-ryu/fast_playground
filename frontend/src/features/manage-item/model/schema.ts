import { z } from 'zod';

import { ITEM_NAMES } from '@entities/item';

export const itemFormSchema = z.object({
  name: z.enum(ITEM_NAMES, { error: '과일을 선택하세요.' }),
  price: z.number({ error: '가격을 올바르게 입력하세요.' }).min(0, '가격은 0 이상이어야 합니다.'),
  is_offer: z.boolean(),
});

export type ItemFormValues = z.infer<typeof itemFormSchema>;

/** 빈 선택/입력을 허용하는 초기값 (submit 시 Zod가 검증) */
export const itemFormDefaultValues: {
  name: ItemFormValues['name'] | '';
  price: number | undefined;
  is_offer: boolean;
} = {
  name: '',
  price: undefined,
  is_offer: false,
};
