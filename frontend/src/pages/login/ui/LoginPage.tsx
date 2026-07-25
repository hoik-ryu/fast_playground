import { FormProvider, useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { zodResolver } from '@hookform/resolvers/zod';

import { type LoginFormValues, loginSchema, loginUser, useAuth } from '@features/auth';
import { mapServerErrors } from '@shared/lib/form/mapServerErrors';
import { FormField, FormInput, PasswordInput, SubmitButton } from '@shared/ui/form';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = (location.state as { message?: string } | null)?.message;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <div className="mx-auto max-w-sm">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">로그인</h2>
        <p className="mt-1 text-sm text-slate-500">가입한 이메일과 비밀번호로 로그인합니다.</p>

        {successMessage && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        <FormProvider {...form}>
          <form
            className="mt-6 space-y-4"
            noValidate
            onSubmit={form.handleSubmit(async (values) => {
              try {
                const tokens = await loginUser(values);
                login(tokens.access_token, tokens.refresh_token);
                const from = (location.state as { from?: string } | null)?.from;
                navigate(from ?? '/items', { replace: true });
              } catch (error) {
                mapServerErrors(error, form.setError);
              }
            })}
          >
            <FormField<LoginFormValues> name="email" label="이메일" required>
              <FormInput type="email" placeholder="you@example.com" autoComplete="email" />
            </FormField>

            <FormField<LoginFormValues> name="password" label="비밀번호" required>
              <PasswordInput placeholder="password" autoComplete="current-password" />
            </FormField>

            <SubmitButton pendingLabel="로그인 중...">로그인</SubmitButton>
          </form>
        </FormProvider>

        <p className="mt-6 text-center text-sm text-slate-500">
          계정이 없나요?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-700">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
