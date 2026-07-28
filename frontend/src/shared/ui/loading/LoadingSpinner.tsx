export type LoadingSpinnerSize = 'sm' | 'md' | 'lg';

const sizeClassName: Record<LoadingSpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
};

export type LoadingSpinnerProps = {
  /** 스피너 크기. 기본값은 md 입니다. */
  size?: LoadingSpinnerSize;
  /** 스피너 요소에 추가할 클래스. 색상은 currentColor 를 따릅니다. */
  className?: string;
  /** 스크린 리더용 대체 텍스트. 기본값은 '로딩 중' 입니다. */
  label?: string;
};

/**
 * Sales.AX 공통 로딩 스피너.
 * currentColor 기반이라 상위 텍스트 색상을 그대로 따릅니다.
 * 외부 라이브러리 없이 Tailwind 만으로 구성합니다.
 */
export function LoadingSpinner({ size = 'md', className, label = '로딩 중' }: LoadingSpinnerProps) {
  return (
    <span role="status" className="inline-flex items-center justify-center">
      <span
        aria-hidden
        className={`inline-block animate-spin rounded-full border-current border-t-transparent ${
          sizeClassName[size]
        }${className ? ` ${className}` : ''}`}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
