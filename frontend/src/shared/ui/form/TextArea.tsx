import type { ComponentProps } from 'react';
import { useFormContext } from 'react-hook-form';

import { useFormField } from './FormField';
import { formControlClassName } from './FormInput';

type TextAreaProps = Omit<ComponentProps<'textarea'>, 'id' | 'name'> & {
  name?: never;
};

export function TextArea({ className, rows = 4, ...props }: TextAreaProps) {
  const { register } = useFormContext();
  const { name, id, describedById, invalid } = useFormField();

  return (
    <textarea
      id={id}
      rows={rows}
      aria-invalid={invalid}
      aria-describedby={describedById}
      className={className ? `${formControlClassName} ${className}` : formControlClassName}
      {...props}
      {...register(name)}
    />
  );
}
