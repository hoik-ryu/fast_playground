import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, '현재 비밀번호를 입력하세요.'),
    new_password: z
      .string()
      .min(8, '새 비밀번호는 8자 이상이어야 합니다.')
      .max(100, '새 비밀번호는 100자 이하여야 합니다.'),
    confirm_password: z.string().min(1, '새 비밀번호 확인을 입력하세요.'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: '새 비밀번호 확인이 일치하지 않습니다.',
    path: ['confirm_password'],
  })
  .refine((data) => data.current_password !== data.new_password, {
    message: '새 비밀번호는 현재 비밀번호와 달라야 합니다.',
    path: ['new_password'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}
