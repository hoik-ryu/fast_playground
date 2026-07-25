import type { ComponentProps, ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';

type SubmitButtonProps = Omit<ComponentProps<'button'>, 'type'> & {
  children: ReactNode;
  pendingLabel?: string;
};

export function SubmitButton({
  children,
  pendingLabel = '처리 중...',
  disabled,
  className,
  ...props
}: SubmitButtonProps) {
  const {
    formState: { isSubmitting },
  } = useFormContext();

  const pending = isSubmitting;
  const isDisabled = disabled || pending;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={
        className ??
        'w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50'
      }
      {...props}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
