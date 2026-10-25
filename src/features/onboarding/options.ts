import type { SchemaUpdateProfileDto } from '@/core/api/schema';

type Item<T> = T extends readonly (infer U)[] ? U : never;
type Profile = Required<SchemaUpdateProfileDto>;

/**
 * Display order of each question's options. The ids are typed by the backend contract, so a
 * renamed or removed id is a compile error. Labels are translations: `options.<group>.<id>`.
 */
export const options = {
  gender: ['woman', 'man', 'non_binary'] satisfies NonNullable<Profile['gender']>[],
  interestedIn: ['men', 'women', 'non_binary'] satisfies Item<Profile['interestedIn']>[],
  hopingToFind: [
    'long_term_relationship',
    'life_partner',
    'casual',
    'intimacy_no_commitment',
    'marriage',
    'ethical_non_monogamy',
  ] satisfies Item<Profile['hopingToFind']>[],
  values: [
    'ambition',
    'confidence',
    'curiosity',
    'emotional_intelligence',
    'kindness',
    'honesty',
    'sense_of_humor',
    'empathy',
    'open_mindedness',
    'good_communication',
    'emotional_availability',
    'independence',
    'loyalty',
    'growth_mindset',
    'respect',
  ] satisfies Item<Profile['values']>[],
  kidsStatus: ['have_kids', 'no_kids'] satisfies NonNullable<Profile['kidsStatus']>[],
  familyPlans: ['dont_want_kids', 'want_kids', 'open_to_kids', 'not_sure'] satisfies NonNullable<
    Profile['familyPlans']
  >[],
  religion: [
    'agnostic',
    'atheist',
    'buddhist',
    'catholic',
    'christian',
    'hindu',
    'jain',
    'jewish',
    'muslim',
    'sikh',
    'zoroastrian',
    'spiritual',
    'religious',
    'other',
  ] satisfies NonNullable<Profile['religion']>[],
  politics: ['apolitical', 'moderate', 'left', 'right', 'socialist', 'communist'] satisfies NonNullable<
    Profile['politics']
  >[],
  causes: [
    'black_lives_matter',
    'disability_rights',
    'end_religious_hate',
    'environmental_protection',
    'feminism',
    'human_rights',
    'immigrant_rights',
    'indigenous_rights',
    'lgbtq_plus_rights',
    'neurodiversity',
    'reproductive_rights',
    'stop_asian_hate',
    'trans_rights',
    'volunteering',
    'voting_rights',
  ] satisfies Item<Profile['causes']>[],
};

/** Maximum picks for each multi-select (the server enforces the same numbers). */
export const maxPicks = { hopingToFind: 2, values: 3, causes: 3 } as const;

export const HEIGHT_CM = { min: 120, max: 230, default: 168 } as const;

/** 170 → "5′7″". */
export function feetAndInches(cm: number): string {
  const totalInches = Math.round(cm / 2.54);
  return `${Math.floor(totalInches / 12)}′${totalInches % 12}″`;
}
