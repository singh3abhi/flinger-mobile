import { api } from '@/core/api/client';
import { unwrap } from '@/core/api/errors';
import type { SchemaReceivedLikesDto } from '@/core/api/schema';

export type ReceivedLike = SchemaReceivedLikesDto['items'][number];

export async function fetchLikesReceived(cursor?: string) {
  return unwrap(
    await api.GET('/v1/likes/received', { params: { query: { limit: 20, cursor } } }),
  );
}
