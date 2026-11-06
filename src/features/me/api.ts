import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/core/api/client';
import { ensureOk, unwrap } from '@/core/api/errors';
import { queryKeys } from '@/core/api/query-keys';
import type {
  SchemaPreferencesDto,
  SchemaSettingsDto,
  SchemaUpdatePreferencesDto,
  SchemaUpdateSettingsDto,
} from '@/core/api/schema';

export type Preferences = SchemaPreferencesDto;
export type Settings = SchemaSettingsDto;

export const meKeys = {
  settings: ['me', 'settings'] as const,
  preferences: ['me', 'preferences'] as const,
  blocks: ['blocks'] as const,
};

export async function fetchMyProfile() {
  return unwrap(await api.GET('/v1/me/profile'));
}

export function useMyProfileSummary() {
  return useQuery({ queryKey: queryKeys.myProfile, queryFn: fetchMyProfile });
}

export function useSettings() {
  return useQuery({ queryKey: meKeys.settings, queryFn: async () => unwrap(await api.GET('/v1/me/settings')) });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (changes: SchemaUpdateSettingsDto) =>
      unwrap(await api.PATCH('/v1/me/settings', { body: changes })),
    onMutate: (changes) => {
      // Toggles feel instant; the server answer replaces this.
      queryClient.setQueryData<Settings>(meKeys.settings, (old) => (old ? { ...old, ...changes } : old));
    },
    onSuccess: (settings) => queryClient.setQueryData(meKeys.settings, settings),
    onError: () => void queryClient.invalidateQueries({ queryKey: meKeys.settings }),
  });
}

export function usePreferences() {
  return useQuery({
    queryKey: meKeys.preferences,
    queryFn: async () => unwrap(await api.GET('/v1/me/preferences')),
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (changes: SchemaUpdatePreferencesDto) =>
      unwrap(await api.PATCH('/v1/me/preferences', { body: changes })),
    onSuccess: (prefs) => {
      queryClient.setQueryData(meKeys.preferences, prefs);
      // Different preferences mean a different deck.
      void queryClient.invalidateQueries({ queryKey: ['discovery'] });
    },
  });
}

export async function pauseAccount(): Promise<void> {
  ensureOk(await api.POST('/v1/me/pause'));
}

export async function unpauseAccount(): Promise<void> {
  ensureOk(await api.DELETE('/v1/me/pause'));
}

export async function deleteAccount(): Promise<void> {
  ensureOk(await api.DELETE('/v1/me', { body: { confirm: 'DELETE' } }));
}

export async function logoutAllDevices(): Promise<void> {
  ensureOk(await api.POST('/v1/auth/logout-all'));
}

export async function requestExport() {
  return unwrap(await api.POST('/v1/me/export'));
}

export function useBlocked() {
  return useQuery({ queryKey: meKeys.blocks, queryFn: async () => unwrap(await api.GET('/v1/blocks')).items });
}

export async function unblock(userId: string): Promise<void> {
  ensureOk(await api.DELETE('/v1/blocks/{userId}', { params: { path: { userId } } }));
}

export function useUpdateBio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bio: string | null) => unwrap(await api.PATCH('/v1/me/profile', { body: { bio } })),
    onSuccess: (profile) => queryClient.setQueryData(queryKeys.myProfile, profile),
  });
}

export function useUpdateInterestedIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (interestedIn: ('men' | 'women' | 'non_binary')[]) =>
      unwrap(await api.PATCH('/v1/me/profile', { body: { interestedIn } })),
    onSuccess: (profile) => queryClient.setQueryData(queryKeys.myProfile, profile),
  });
}
