import type { ComponentProps } from 'react';
import { useFormContext } from 'react-hook-form';

import { useFormField } from './FormField';

const inputClassName =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60 aria-[invalid=true]:border-rose-400 aria-[invalid=true]:focus:border-rose-400 aria-[invalid=true]:focus:ring-rose-400';

type FormInputProps = Omit<ComponentProps<'input'>, 'id' | 'name'> & {
  name?: never;
};

export function FormInput({ className, ...props }: FormInputProps) {
  const { register } = useFormContext();
  const { name, id, describedById, invalid } = useFormField();

  return (
    <input
      id={id}
      aria-invalid={invalid}
      aria-describedby={describedById}
      className={className ? `${inputClassName} ${className}` : inputClassName}
      {...props}
      {...register(name)}
    />
  );
}

export { inputClassName as formControlClassName };
