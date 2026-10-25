import { router, type Href } from 'expo-router';
import { errorMessage } from '@/core/i18n';
import type { MyProfile, ProfileChanges } from './api';
import { useMyProfile, useUpdateProfile } from './queries';
import { nextRoute, type OnboardingRoute } from './steps';

export function onboardingHref(route: OnboardingRoute): Href {
  return `/onboarding/${route}` as Href;
}

/**
 * What every onboarding screen needs: the saved answers (loaded by the onboarding layout before
 * any screen renders), a way to save and move on, and the save state.
 */
export function useStep(route: OnboardingRoute) {
  const profile = useMyProfile().data as MyProfile;
  const update = useUpdateProfile();

  const goNext = () => {
    const next = nextRoute(route);
    if (next) router.push(onboardingHref(next));
  };

  /** Save, then go to the next screen. Nothing to save (e.g. Skip) just moves on. */
  const saveAndContinue = (changes: ProfileChanges) => {
    if (Object.keys(changes).length === 0) return goNext();
    update.mutate(changes, { onSuccess: goNext });
  };

  return {
    profile,
    saveAndContinue,
    goNext,
    saving: update.isPending,
    error: update.isError ? errorMessage(update.error) : undefined,
    rawError: update.error,
  };
}
