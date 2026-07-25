import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { usePrefersReducedMotion } from '@shared/lib/usePrefersReducedMotion';

import { ChartContainer } from './ChartContainer';
import { CHART_COLORS, type SalesBarChartProps } from './types';

export function SalesBarChart({
  data,
  dataKey = 'value',
  xKey = 'name',
  title,
  height = 280,
  status,
  errorMessage,
  emptyMessage,
  color = CHART_COLORS[0],
}: SalesBarChartProps) {
  const reduceMotion = usePrefersReducedMotion();
  const resolvedStatus = status ?? (data.length === 0 ? 'empty' : 'idle');

  return (
    <ChartContainer
      title={title}
      height={height}
      status={resolvedStatus}
      errorMessage={errorMessage}
      emptyMessage={emptyMessage}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              borderColor: '#e2e8f0',
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            dataKey={dataKey}
            fill={color}
            radius={[4, 4, 0, 0]}
            isAnimationActive={!reduceMotion}
            name={dataKey}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
