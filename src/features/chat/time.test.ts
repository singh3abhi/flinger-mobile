import { dayLabel, listTime } from './time';

const NOW = new Date(2026, 9, 26, 15, 0); // Mon 26 Oct 2026, 3 pm local

describe('chat times', () => {
  it('formats the chat list time', () => {
    expect(listTime(new Date(2026, 9, 26, 14, 59, 30).toISOString(), NOW)).toBe('now');
    expect(listTime(new Date(2026, 9, 26, 14, 55).toISOString(), NOW)).toBe('5m');
    expect(listTime(new Date(2026, 9, 25, 20, 0).toISOString(), NOW)).toBe('Yesterday');
    expect(listTime(new Date(2026, 9, 22, 20, 0).toISOString(), NOW)).toBe('Thu');
    expect(listTime(new Date(2026, 8, 2, 20, 0).toISOString(), NOW)).toBe('2 Sept');
  });

  it('labels days in a conversation', () => {
    expect(dayLabel(new Date(2026, 9, 26, 9, 0).toISOString(), NOW)).toBe('Today');
    expect(dayLabel(new Date(2026, 9, 25, 9, 0).toISOString(), NOW)).toBe('Yesterday');
    expect(dayLabel(new Date(2026, 9, 21, 9, 0).toISOString(), NOW)).toBe('Wednesday');
  });
});
