import type { MyProfile } from './api';

/**
 * The onboarding screens in order. `step` is what the progress bar shows ("Step 3 of 13");
 * kids, beliefs and causes are optional screens the server does not track as steps.
 */
export const SCREENS = [
  { route: 'name', step: 1 },
  { route: 'gender', step: 2 },
  { route: 'who-to-meet', step: 3 },
  { route: 'intentions', step: 4 },
  { route: 'height', step: 5 },
  { route: 'values', step: 6 },
  { route: 'kids-family', step: 7 },
  { route: 'beliefs', step: 8 },
  { route: 'causes', step: 9 },
  { route: 'photos', step: 10 },
  { route: 'prompts', step: 11 },
  { route: 'location', step: 12 },
  { route: 'agree', step: 13 },
] as const;

export const TOTAL_STEPS = SCREENS.length;

export type OnboardingRoute = (typeof SCREENS)[number]['route'];
type ServerStep = NonNullable<MyProfile['onboarding']['nextStep']>;

/** Where each server-side step is answered. */
const ROUTE_FOR_STEP: Record<ServerStep, OnboardingRoute> = {
  basics: 'name',
  gender: 'gender',
  interested_in: 'who-to-meet',
  hoping_to_find: 'intentions',
  height: 'height',
  values: 'values',
  photos: 'photos',
  prompts: 'prompts',
  location: 'location',
  consents: 'agree',
};

export function stepNumber(route: OnboardingRoute): number {
  return SCREENS.find((s) => s.route === route)?.step ?? 1;
}

/** The screen after `route`, or null after the last one. */
export function nextRoute(route: OnboardingRoute): OnboardingRoute | null {
  const index = SCREENS.findIndex((s) => s.route === route);
  return SCREENS[index + 1]?.route ?? null;
}

/** Where to resume: the first required step the server says is missing. */
export function resumeRoute(profile: Pick<MyProfile, 'onboarding'>): OnboardingRoute {
  const next = profile.onboarding.nextStep;
  return next ? ROUTE_FOR_STEP[next] : 'agree';
}
