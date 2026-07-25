export const itemKeys = {
  all: ['items'] as const,
  lists: () => [...itemKeys.all, 'list'] as const,
  list: (name?: string) => [...itemKeys.lists(), name ?? 'all'] as const,
  detail: (id: number) => [...itemKeys.all, 'detail', id] as const,
};
