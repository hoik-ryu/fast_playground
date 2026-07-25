import type { ComponentProps, ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';

import { useFormField } from './FormField';
import { formControlClassName } from './FormInput';

type SelectProps = Omit<ComponentProps<'select'>, 'id' | 'name'> & {
  name?: never;
  children: ReactNode;
};

export function Select({ className, children, ...props }: SelectProps) {
  const { register } = useFormContext();
  const { name, id, describedById, invalid } = useFormField();

  return (
    <select
      id={id}
      aria-invalid={invalid}
      aria-describedby={describedById}
      className={className ? `${formControlClassName} ${className}` : formControlClassName}
      {...props}
      {...register(name)}
    >
      {children}
    </select>
  );
}
