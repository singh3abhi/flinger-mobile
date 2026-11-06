import { completeness, nextNudge } from './completeness';

const base = {
  photos: Array.from({ length: 4 }, (_, i) => ({ id: `${i}` })),
  prompts: [{}, {}],
  bio: null,
  heightCm: 170,
  kidsStatus: null,
  familyPlans: null,
  religion: null,
  politics: null,
  causes: [],
} as never;

describe('profile completeness', () => {
  it('scores what is filled in', () => {
    expect(completeness(base)).toBe(20);
    expect(
      completeness({
        ...(base as object),
        photos: Array.from({ length: 6 }, () => ({})),
        prompts: [{}, {}, {}],
        bio: 'Hi',
        kidsStatus: 'no_kids',
        familyPlans: 'not_sure',
        religion: 'hindu',
        politics: 'moderate',
        causes: ['feminism'],
      } as never),
    ).toBe(100);
  });

  it('suggests prompts first, then photos, then a bio', () => {
    expect(nextNudge(base)).toBe('prompts');
    expect(nextNudge({ ...(base as object), prompts: [{}, {}, {}] } as never)).toBe('photos');
    expect(
      nextNudge({ ...(base as object), prompts: [{}, {}, {}], photos: Array.from({ length: 6 }, () => ({})) } as never),
    ).toBe('bio');
  });
});
