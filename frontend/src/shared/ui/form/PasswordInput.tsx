import { type ComponentProps, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { useFormField } from './FormField';
import { formControlClassName } from './FormInput';

type PasswordInputProps = Omit<ComponentProps<'input'>, 'id' | 'name' | 'type'> & {
  name?: never;
  revealToggle?: boolean;
};

export function PasswordInput({ className, revealToggle = true, ...props }: PasswordInputProps) {
  const { register } = useFormContext();
  const { name, id, describedById, invalid } = useFormField();
  const [visible, setVisible] = useState(false);

  const input = (
    <input
      id={id}
      type={visible ? 'text' : 'password'}
      aria-invalid={invalid}
      aria-describedby={describedById}
      className={
        className ? `${formControlClassName} pr-14 ${className}` : `${formControlClassName} pr-14`
      }
      {...props}
      {...register(name)}
    />
  );

  if (!revealToggle) {
    return input;
  }

  return (
    <div className="relative">
      {input}
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute top-1/2 right-2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label={visible ? '비밀번호 숨기기' : '비밀번호 보기'}
      >
        {visible ? '숨김' : '보기'}
      </button>
    </div>
  );
}
