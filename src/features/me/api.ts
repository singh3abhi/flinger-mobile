import { useQuery } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { unwrap } from '@/core/api/errors';
import { queryKeys } from '@/core/api/query-keys';

export async function fetchMyProfile() {
  return unwrap(await api.GET('/v1/me/profile'));
}

export function useMyProfileSummary() {
  return useQuery({ queryKey: queryKeys.myProfile, queryFn: fetchMyProfile });
}
