import type { ComponentProps } from 'react';
import { useFormContext } from 'react-hook-form';

import { useFormField } from './FormField';
import { formControlClassName } from './FormInput';

type NumberInputProps = Omit<ComponentProps<'input'>, 'id' | 'name' | 'type'> & {
  name?: never;
};

/**
 * 숫자 입력. Zod의 z.coerce.number()와 함께 쓰는 것을 권장합니다.
 */
export function NumberInput({ className, ...props }: NumberInputProps) {
  const { register } = useFormContext();
  const { name, id, describedById, invalid } = useFormField();

  return (
    <input
      id={id}
      type="number"
      aria-invalid={invalid}
      aria-describedby={describedById}
      className={className ? `${formControlClassName} ${className}` : formControlClassName}
      {...props}
      {...register(name, { valueAsNumber: true })}
    />
  );
}
