import { ageOn, formatLongDate, fromIsoDate, localToday, toIsoDate } from './birthday';

describe('birthday helpers', () => {
  it('builds an ISO date from day, month and year fields', () => {
    expect(toIsoDate({ day: '14', month: '3', year: '1996' })).toBe('1996-03-14');
    expect(toIsoDate({ day: '1', month: '12', year: '2000' })).toBe('2000-12-01');
  });

  it('rejects dates that do not exist or are incomplete', () => {
    expect(toIsoDate({ day: '31', month: '2', year: '1996' })).toBeNull();
    expect(toIsoDate({ day: '29', month: '2', year: '2001' })).toBeNull();
    expect(toIsoDate({ day: '29', month: '2', year: '2004' })).toBe('2004-02-29');
    expect(toIsoDate({ day: '14', month: '13', year: '1996' })).toBeNull();
    expect(toIsoDate({ day: '', month: '3', year: '1996' })).toBeNull();
    expect(toIsoDate({ day: '14', month: '3', year: '96' })).toBeNull();
  });

  it('splits an ISO date back into fields', () => {
    expect(fromIsoDate('1996-03-14')).toEqual({ day: '14', month: '03', year: '1996' });
  });

  it('computes age, ticking over on the birthday', () => {
    expect(ageOn('2008-03-14', '2026-03-13')).toBe(17);
    expect(ageOn('2008-03-14', '2026-03-14')).toBe(18);
  });

  it('formats today and long dates', () => {
    expect(localToday(new Date(2026, 9, 5))).toBe('2026-10-05');
    expect(formatLongDate('1996-03-14')).toBe('14 March 1996');
  });
});
