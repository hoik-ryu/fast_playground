import type { ComponentProps } from 'react';
import { useFormContext } from 'react-hook-form';

import { useFormField } from './FormField';

type CheckboxProps = Omit<ComponentProps<'input'>, 'id' | 'name' | 'type'> & {
  name?: never;
};

/**
 * 라벨은 FormField가 담당합니다. 체크박스 입력만 렌더합니다.
 */
export function Checkbox({ className, ...props }: CheckboxProps) {
  const { register } = useFormContext();
  const { name, id, describedById, invalid } = useFormField();

  return (
    <div
      className={
        className ?? 'flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5'
      }
    >
      <input
        id={id}
        type="checkbox"
        aria-invalid={invalid}
        aria-describedby={describedById}
        className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
        {...props}
        {...register(name)}
      />
    </div>
  );
}
