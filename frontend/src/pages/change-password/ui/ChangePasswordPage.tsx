import { FormProvider, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { zodResolver } from '@hookform/resolvers/zod';

import { useAuth } from '@features/auth';
import {
  changePassword,
  type ChangePasswordFormValues,
  changePasswordSchema,
} from '@features/change-password';
import { mapServerErrors } from '@shared/lib/form/mapServerErrors';
import { toastSuccess } from '@shared/lib/toast';
import { FormField, PasswordInput, SubmitButton } from '@shared/ui/form';

export function ChangePasswordPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">비밀번호 변경</h2>
        <p className="mt-1 text-sm text-slate-500">
          현재 비밀번호를 확인한 뒤 새 비밀번호로 변경합니다.
        </p>

        <FormProvider {...form}>
          <form
            className="mt-6 space-y-4"
            noValidate
            onSubmit={form.handleSubmit(async (values) => {
              try {
                const message = await changePassword({
                  current_password: values.current_password,
                  new_password: values.new_password,
                });
                toastSuccess(`${message} 다시 로그인해 주세요.`);
                logout();
                navigate('/login', { replace: true });
              } catch (error) {
                mapServerErrors(error, form.setError);
              }
            })}
          >
            <FormField<ChangePasswordFormValues>
              name="current_password"
              label="현재 비밀번호"
              required
            >
              <PasswordInput autoComplete="current-password" />
            </FormField>

            <FormField<ChangePasswordFormValues>
              name="new_password"
              label="새 비밀번호"
              required
              description="8자 이상"
            >
              <PasswordInput autoComplete="new-password" />
            </FormField>

            <FormField<ChangePasswordFormValues>
              name="confirm_password"
              label="새 비밀번호 확인"
              required
            >
              <PasswordInput autoComplete="new-password" />
            </FormField>

            <SubmitButton pendingLabel="변경 중...">비밀번호 변경</SubmitButton>
          </form>
        </FormProvider>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/me" className="font-medium text-indigo-600 hover:text-indigo-700">
            마이페이지로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}
