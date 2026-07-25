import { ChartEmptyState } from './ChartEmptyState';
import type { ChartContainerProps } from './types';

export function ChartContainer({
  title,
  'aria-label': ariaLabel,
  height = 280,
  status = 'idle',
  errorMessage = '차트를 불러오지 못했습니다.',
  emptyMessage = '표시할 데이터가 없습니다.',
  children,
  className,
}: ChartContainerProps) {
  const label = ariaLabel ?? title ?? '차트';

  return (
    <section
      className={className ?? 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'}
      aria-label={label}
    >
      {title ? <h3 className="mb-3 text-sm font-semibold text-slate-900">{title}</h3> : null}

      <div style={{ width: '100%', height }} className="relative">
        {status === 'loading' ? <ChartEmptyState message="불러오는 중..." /> : null}
        {status === 'empty' ? <ChartEmptyState message={emptyMessage} /> : null}
        {status === 'error' ? <ChartEmptyState message={errorMessage} tone="error" /> : null}
        {status === 'idle' ? children : null}
      </div>
    </section>
  );
}
