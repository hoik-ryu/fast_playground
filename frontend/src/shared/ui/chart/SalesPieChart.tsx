import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { usePrefersReducedMotion } from '@shared/lib/usePrefersReducedMotion';

import { ChartContainer } from './ChartContainer';
import { CHART_COLORS, type SalesPieChartProps } from './types';

export function SalesPieChart({
  data,
  title,
  height = 280,
  status,
  errorMessage,
  emptyMessage,
  colors = CHART_COLORS,
}: SalesPieChartProps) {
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
        <PieChart>
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              borderColor: '#e2e8f0',
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="70%"
            isAnimationActive={!reduceMotion}
          >
            {data.map((entry, index) => (
              <Cell key={`${entry.name}-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
