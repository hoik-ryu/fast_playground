type ChartEmptyStateProps = {
  message: string;
  tone?: 'neutral' | 'error';
};

export function ChartEmptyState({ message, tone = 'neutral' }: ChartEmptyStateProps) {
  return (
    <div
      className={`flex h-full items-center justify-center px-4 text-center text-sm ${
        tone === 'error' ? 'text-rose-600' : 'text-slate-500'
      }`}
      role="status"
    >
      {message}
    </div>
  );
}
