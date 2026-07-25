import { FormProvider, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { zodResolver } from '@hookform/resolvers/zod';

import { type RegisterFormValues, registerSchema, registerUser } from '@features/auth';
import { mapServerErrors } from '@shared/lib/form/mapServerErrors';
import { toastSuccess } from '@shared/lib/toast';
import { FormField, FormInput, PasswordInput, SubmitButton } from '@shared/ui/form';

export function RegisterPage() {
  const navigate = useNavigate();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
    },
  });

  return (
    <div className="mx-auto max-w-sm">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">회원가입</h2>
        <p className="mt-1 text-sm text-slate-500">이메일, 이름, 비밀번호로 계정을 만듭니다.</p>

        <FormProvider {...form}>
          <form
            className="mt-6 space-y-4"
            noValidate
            onSubmit={form.handleSubmit(async (values) => {
              try {
                const { data, message } = await registerUser(values);

                if (!data.is_active) {
                  navigate('/login', { replace: true, state: { message } });
                  return;
                }

                toastSuccess(`${message} 로그인해 주세요.`);
                navigate('/login', { replace: true });
              } catch (error) {
                mapServerErrors(error, form.setError);
              }
            })}
          >
            <FormField<RegisterFormValues> name="email" label="이메일" required>
              <FormInput type="email" placeholder="you@example.com" autoComplete="email" />
            </FormField>

            <FormField<RegisterFormValues> name="name" label="이름" required>
              <FormInput placeholder="홍길동" autoComplete="name" />
            </FormField>

            <FormField<RegisterFormValues>
              name="password"
              label="비밀번호"
              required
              description="8자 이상"
            >
              <PasswordInput placeholder="8자 이상" autoComplete="new-password" />
            </FormField>

            <SubmitButton pendingLabel="가입 중...">회원가입</SubmitButton>
          </form>
        </FormProvider>

        <p className="mt-6 text-center text-sm text-slate-500">
          이미 계정이 있나요?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
