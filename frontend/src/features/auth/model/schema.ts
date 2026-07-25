import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(1, '비밀번호를 입력하세요.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.email('올바른 이메일 형식이 아닙니다.'),
  name: z.string().trim().min(1, '이름을 입력하세요.').max(100, '이름은 100자 이하여야 합니다.'),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다.')
    .max(100, '비밀번호는 100자 이하여야 합니다.'),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
