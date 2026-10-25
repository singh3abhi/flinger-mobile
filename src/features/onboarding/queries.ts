import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/api/query-keys';
import {
  acceptConsents,
  fetchClientConfig,
  fetchMyProfile,
  fetchPromptLibrary,
  savePrompts,
  updateProfile,
  type ConsentDocument,
  type MyProfile,
  type ProfileChanges,
} from './api';

export const profileKeys = {
  mine: queryKeys.myProfile,
  prompts: ['prompts'] as const,
  config: queryKeys.config,
};

export function useMyProfile() {
  return useQuery({ queryKey: profileKeys.mine, queryFn: fetchMyProfile });
}

/** Every save returns the whole profile, so the cache is replaced instead of refetched. */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (changes: ProfileChanges) => updateProfile(changes),
    onSuccess: (profile: MyProfile) => queryClient.setQueryData(profileKeys.mine, profile),
  });
}

export function usePromptLibrary() {
  return useQuery({
    queryKey: profileKeys.prompts,
    queryFn: fetchPromptLibrary,
    staleTime: 60 * 60 * 1000,
  });
}

export function useSavePrompts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: savePrompts,
    onSuccess: (profile: MyProfile) => queryClient.setQueryData(profileKeys.mine, profile),
  });
}

export function useClientConfig() {
  return useQuery({
    queryKey: profileKeys.config,
    queryFn: fetchClientConfig,
    staleTime: 60 * 60 * 1000,
  });
}

export function useAcceptConsents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documents, version }: { documents: ConsentDocument[]; version: string }) =>
      acceptConsents(documents, version),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKeys.mine }),
  });
}
