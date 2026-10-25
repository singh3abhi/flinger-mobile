import { api } from '@/core/api/client';
import { ensureOk, unwrap } from '@/core/api/errors';
import { env } from '@/core/config/env';
import { getDeviceId } from '@/core/device/device-id';
import { session } from '@/core/auth/session';

/** Email a sign-in code. */
export async function requestCode(email: string) {
  return unwrap(await api.POST('/v1/auth/otp/request', { body: { email } }));
}

/** Check the code; on success the session starts (tokens stored, routing switches). */
export async function verifyCode(email: string, code: string) {
  const device = { id: await getDeviceId(), platform: env.platform };
  const result = unwrap(await api.POST('/v1/auth/otp/verify', { body: { email, code, device } }));
  await session.start(result);
  return result;
}

export async function fetchMe() {
  return unwrap(await api.GET('/v1/me'));
}

/** Sign out on the server (best effort) and always locally. */
export async function signOut() {
  try {
    ensureOk(await api.POST('/v1/auth/logout'));
  } finally {
    await session.end();
  }
}
