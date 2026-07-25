import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, '이름을 입력하세요.').max(100, '이름은 100자 이하여야 합니다.'),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

export interface UserMeUpdate {
  name: string;
}
