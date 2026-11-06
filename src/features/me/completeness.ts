import type { SchemaMyProfileDto } from '@/core/api/schema';

type Profile = Pick<
  SchemaMyProfileDto,
  'photos' | 'prompts' | 'bio' | 'heightCm' | 'kidsStatus' | 'familyPlans' | 'religion' | 'politics' | 'causes'
>;

/** What makes a profile feel complete (and tends to get more likes). */
const CHECKS: ((p: Profile) => boolean)[] = [
  (p) => p.photos.length >= 4,
  (p) => p.photos.length >= 6,
  (p) => p.prompts.length >= 3,
  (p) => Boolean(p.bio),
  (p) => p.heightCm !== null,
  (p) => p.kidsStatus !== null,
  (p) => p.familyPlans !== null,
  (p) => p.religion !== null,
  (p) => p.politics !== null,
  (p) => p.causes.length > 0,
];

export function completeness(p: Profile): number {
  return Math.round((CHECKS.filter((check) => check(p)).length / CHECKS.length) * 100);
}

/** The most useful next thing to add, or null when nothing important is missing. */
export function nextNudge(p: Profile): 'prompts' | 'photos' | 'bio' | null {
  if (p.prompts.length < 3) return 'prompts';
  if (p.photos.length < 6) return 'photos';
  if (!p.bio) return 'bio';
  return null;
}
