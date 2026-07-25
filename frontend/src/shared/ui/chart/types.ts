import type { ReactNode } from 'react';

/** CSS 변수 기반 기본 팔레트 (페이지에서 색상 하드코딩 지양) */
export const CHART_COLORS = [
  'var(--chart-1, #4f46e5)',
  'var(--chart-2, #0d9488)',
  'var(--chart-3, #ea580c)',
  'var(--chart-4, #db2777)',
  'var(--chart-5, #2563eb)',
  'var(--chart-6, #65a30d)',
] as const;

export type ChartStatus = 'idle' | 'loading' | 'empty' | 'error';

export type ChartSeriesPoint = {
  name: string;
  value: number;
  [key: string]: string | number;
};

export type NamedValuePoint = {
  name: string;
  value: number;
};

export type ChartContainerProps = {
  title?: string;
  'aria-label'?: string;
  height?: number | string;
  status?: ChartStatus;
  errorMessage?: string;
  emptyMessage?: string;
  children: ReactNode;
  className?: string;
};

export type SalesBarChartProps = {
  data: ChartSeriesPoint[];
  /** data key for bars. default: value */
  dataKey?: string;
  xKey?: string;
  title?: string;
  height?: number;
  status?: ChartStatus;
  errorMessage?: string;
  emptyMessage?: string;
  color?: string;
};

export type SalesLineChartProps = {
  data: ChartSeriesPoint[];
  dataKey?: string;
  xKey?: string;
  title?: string;
  height?: number;
  status?: ChartStatus;
  errorMessage?: string;
  emptyMessage?: string;
  color?: string;
};

export type SalesPieChartProps = {
  data: NamedValuePoint[];
  title?: string;
  height?: number;
  status?: ChartStatus;
  errorMessage?: string;
  emptyMessage?: string;
  colors?: readonly string[];
};
