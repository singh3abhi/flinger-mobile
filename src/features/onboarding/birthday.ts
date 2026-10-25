/** Birthday helpers. The server is the authority on age (it uses the date in India). */

export interface DateParts {
  day: string;
  month: string;
  year: string;
}

/** "14", "3", "1996" → "1996-03-14", or null when it is not a real calendar date. */
export function toIsoDate({ day, month, year }: DateParts): string | null {
  if (!/^\d{1,2}$/.test(day) || !/^\d{1,2}$/.test(month) || !/^\d{4}$/.test(year)) return null;
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    return null;
  }
  return `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function fromIsoDate(iso: string): DateParts {
  const [year, month, day] = iso.split('-');
  return { day, month, year };
}

/** Whole years between a YYYY-MM-DD birthday and `today` (YYYY-MM-DD). */
export function ageOn(birthDate: string, today: string): number {
  const [by, bm, bd] = birthDate.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  return ty - by - (tm < bm || (tm === bm && td < bd) ? 1 : 0);
}

/** Today's date on this device as YYYY-MM-DD. */
export function localToday(now: Date = new Date()): string {
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${m}-${d}`;
}

/** "1996-03-14" → "14 March 1996". */
export function formatLongDate(iso: string, locale = 'en-IN'): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
