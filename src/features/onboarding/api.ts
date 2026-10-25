import { api } from '@/core/api/client';
import { ensureOk, unwrap } from '@/core/api/errors';
import type { SchemaMyProfileDto, SchemaUpdateProfileDto } from '@/core/api/schema';

export type MyProfile = SchemaMyProfileDto;
export type ProfileChanges = SchemaUpdateProfileDto;
export type ConsentDocument = 'terms' | 'privacy' | 'guidelines';

export async function fetchMyProfile(): Promise<MyProfile> {
  return unwrap(await api.GET('/v1/me/profile'));
}

/** Save any subset of answers; returns the updated profile. */
export async function updateProfile(changes: ProfileChanges): Promise<MyProfile> {
  return unwrap(await api.PATCH('/v1/me/profile', { body: changes }));
}

export async function fetchPromptLibrary() {
  return unwrap(await api.GET('/v1/prompts')).items;
}

export async function savePrompts(prompts: { promptId: string; answer: string }[]): Promise<MyProfile> {
  return unwrap(await api.PUT('/v1/me/prompts', { body: { prompts } }));
}

export async function fetchClientConfig() {
  return unwrap(await api.GET('/v1/config'));
}

export async function acceptConsents(documents: ConsentDocument[], version: string): Promise<void> {
  ensureOk(await api.POST('/v1/me/consents', { body: { documents, version } }));
}

export type LocationFix = {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  mocked: boolean;
  capturedAt: string;
};

/** Send a GPS fix; the server answers with the city label (never echoing coordinates). */
export async function saveLocation(fix: LocationFix) {
  return unwrap(await api.PUT('/v1/me/location', { body: fix }));
}

/** Finish onboarding: the account becomes active. */
export async function completeOnboarding(): Promise<MyProfile> {
  return unwrap(await api.POST('/v1/me/profile/complete'));
}
