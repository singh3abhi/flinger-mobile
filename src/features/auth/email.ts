import { z } from 'zod';

/** Same normalisation as the backend: trimmed, lowercased, a valid address. */
export const emailSchema = z.string().trim().toLowerCase().max(254).pipe(z.email());

export function normaliseEmail(input: string): string | null {
  const parsed = emailSchema.safeParse(input);
  return parsed.success ? parsed.data : null;
}

/** r••••••a@gmail.com: enough to recognise, not enough to read over a shoulder. */
export function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  if (name.length <= 2) return `${name[0]}•@${domain}`;
  return `${name[0]}${'•'.repeat(Math.min(name.length - 2, 6))}${name.at(-1)}@${domain}`;
}

export function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
