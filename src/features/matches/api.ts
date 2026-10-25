import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { unwrap } from '@/core/api/errors';
import { queryKeys } from '@/core/api/query-keys';

export async function fetchMatches(cursor?: string) {
  return unwrap(await api.GET('/v1/matches', { params: { query: { limit: 20, cursor } } }));
}

export function useMatches() {
  return useInfiniteQuery({
    queryKey: queryKeys.matches,
    queryFn: ({ pageParam }) => fetchMatches(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}
