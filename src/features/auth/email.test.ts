import { formatCountdown, maskEmail, normaliseEmail } from './email';

describe('email helpers', () => {
  it('normalises like the backend', () => {
    expect(normaliseEmail('  Rohan.Mehta@Gmail.COM ')).toBe('rohan.mehta@gmail.com');
  });

  it('rejects invalid addresses', () => {
    for (const bad of ['', 'rohan', 'rohan@', '@gmail.com', 'a b@c.com']) {
      expect(normaliseEmail(bad)).toBeNull();
    }
  });

  it('masks the local part', () => {
    expect(maskEmail('rohan.mehta@gmail.com')).toBe('r••••••a@gmail.com');
    expect(maskEmail('ab@x.co')).toBe('a•@x.co');
  });

  it('formats the resend countdown', () => {
    expect(formatCountdown(102)).toBe('1:42');
    expect(formatCountdown(5)).toBe('0:05');
  });
});
