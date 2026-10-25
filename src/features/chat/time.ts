/** Short time for the chat list: "now", "5m", "4:05 pm", "Yesterday", "Mon", "12 Oct". */
export function listTime(iso: string, now: Date = new Date(), locale = 'en-IN'): string {
  const at = new Date(iso);
  const minutes = Math.floor((now.getTime() - at.getTime()) / 60_000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const days = dayDiff(at, now);
  if (days === 0) return at.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
  if (days === 1) return 'Yesterday';
  if (days < 7) return at.toLocaleDateString(locale, { weekday: 'short' });
  return at.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}

/** Day heading in a conversation: "Today", "Yesterday", "Monday", "12 October 2026". */
export function dayLabel(iso: string, now: Date = new Date(), locale = 'en-IN'): string {
  const at = new Date(iso);
  const days = dayDiff(at, now);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return at.toLocaleDateString(locale, { weekday: 'long' });
  return at.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Calendar days between two dates on this device. */
export function dayDiff(a: Date, b: Date): number {
  const start = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((start(b) - start(a)) / 86_400_000);
}

export function sameDay(a: string, b: string): boolean {
  return dayDiff(new Date(a), new Date(b)) === 0;
}
