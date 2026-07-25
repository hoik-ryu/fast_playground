import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { usePrefersReducedMotion } from '@shared/lib/usePrefersReducedMotion';

import { ChartContainer } from './ChartContainer';
import { CHART_COLORS, type SalesLineChartProps } from './types';

export function SalesLineChart({
  data,
  dataKey = 'value',
  xKey = 'name',
  title,
  height = 280,
  status,
  errorMessage,
  emptyMessage,
  color = CHART_COLORS[1],
}: SalesLineChartProps) {
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
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3 }}
            isAnimationActive={!reduceMotion}
            name={dataKey}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
