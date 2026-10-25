import createClient from 'openapi-fetch';
import { env } from '@/core/config/env';
import { getDeviceId } from '@/core/device/device-id';
import { session } from '@/core/auth/session';
import { createAuthFetch } from './auth-fetch';
import type { paths } from './schema';

/**
 * The typed API client. Types come from the backend contract (`pnpm api:sync`); a wrong path,
 * missing field or wrong type is a compile error. Feature code calls this through feature API
 * modules; components never call it directly.
 */
export const api = createClient<paths>({
  baseUrl: env.apiUrl,
  fetch: createAuthFetch({
    getAccessToken: () => session.getAccessToken(),
    refresh: () => session.refresh(),
    getDeviceId,
    appVersion: env.appVersion,
    platform: env.platform,
  }),
});
