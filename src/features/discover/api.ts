import { api } from '@/core/api/client';
import { ensureOk, unwrap } from '@/core/api/errors';
import type {
  SchemaDeckDto,
  SchemaLikeDto,
  SchemaLikeResultDto,
  SchemaLimitsDto,
  SchemaPublicProfileDto,
} from '@/core/api/schema';

export type PublicProfile = SchemaPublicProfileDto;
export type Deck = SchemaDeckDto;
export type LikeInput = SchemaLikeDto;
export type LikeResult = SchemaLikeResultDto;
export type Limits = SchemaLimitsDto;

export async function fetchDeck(limit = 10): Promise<Deck> {
  return unwrap(await api.GET('/v1/discovery/deck', { params: { query: { limit } } }));
}

export async function fetchProfile(userId: string): Promise<PublicProfile> {
  return unwrap(await api.GET('/v1/profiles/{userId}', { params: { path: { userId } } }));
}

export async function sendLike(input: LikeInput): Promise<LikeResult> {
  return unwrap(await api.POST('/v1/likes', { body: input }));
}

export async function sendPass(targetId: string): Promise<void> {
  ensureOk(await api.POST('/v1/passes', { body: { targetId } }));
}

export async function fetchLimits(): Promise<Limits> {
  return unwrap(await api.GET('/v1/me/limits'));
}

export async function fetchMyProfile() {
  return unwrap(await api.GET('/v1/me/profile'));
}
