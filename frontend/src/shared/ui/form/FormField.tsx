import { createContext, type ReactNode, useContext, useId } from 'react';
import { type FieldPath, type FieldValues, useFormContext } from 'react-hook-form';

type FormFieldContextValue = {
  name: string;
  id: string;
  /** error 또는 description 이 있을 때만 설정 */
  describedById?: string;
  error?: string;
  invalid: boolean;
};

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

export function useFormField() {
  const ctx = useContext(FormFieldContext);
  if (!ctx) {
    throw new Error('useFormField는 FormField 안에서만 사용할 수 있습니다.');
  }
  return ctx;
}

type FormFieldProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  label: string;
  children: ReactNode;
  className?: string;
  description?: string;
  required?: boolean;
};

function getErrorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  if ('message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return undefined;
}

/**
 * label / htmlFor / aria-invalid / aria-describedby / 필드 에러를 표준화합니다.
 */
export function FormField<TFieldValues extends FieldValues>({
  name,
  label,
  children,
  className,
  description,
  required,
}: FormFieldProps<TFieldValues>) {
  const id = useId();
  const describedById = `${id}-describedby`;
  const { getFieldState, formState } = useFormContext<TFieldValues>();
  const fieldState = getFieldState(name, formState);
  const error = getErrorMessage(fieldState.error);
  const invalid = Boolean(error);
  const activeDescribedById = error || description ? describedById : undefined;

  return (
    <FormFieldContext.Provider
      value={{
        name,
        id,
        describedById: activeDescribedById,
        error,
        invalid,
      }}
    >
      <div className={className ?? 'block'}>
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
          {required ? (
            <span className="ml-0.5 text-rose-600" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
        <div className="mt-1">{children}</div>
        {description && !error ? (
          <p id={describedById} className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        ) : null}
        {error ? (
          <p id={describedById} role="alert" className="mt-1 text-xs text-rose-600">
            {error}
          </p>
        ) : null}
      </div>
    </FormFieldContext.Provider>
  );
}
