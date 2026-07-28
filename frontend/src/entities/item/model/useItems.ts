import { useQuery } from '@tanstack/react-query';

import { listItems } from '../api/itemApi';
import { itemKeys } from '../api/queryKeys';

export function useItems(name?: string) {
  return useQuery({
    queryKey: itemKeys.list(name),
    queryFn: ({ signal }) => listItems(name, signal),
  });
}
