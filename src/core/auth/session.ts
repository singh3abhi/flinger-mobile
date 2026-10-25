import * as SecureStore from 'expo-secure-store';
import { env } from '@/core/config/env';
import { getDeviceId } from '@/core/device/device-id';
import { apiErrorFromBody, networkError } from '@/core/api/errors';
import { SessionManager, type RefreshTokenStorage, type TokenPair } from './session-manager';

const REFRESH_KEY = 'flinger.refreshToken';

const secureStorage: RefreshTokenStorage = {
  get: () => SecureStore.getItemAsync(REFRESH_KEY),
  set: (token) =>
    SecureStore.setItemAsync(REFRESH_KEY, token, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    }),
  clear: () => SecureStore.deleteItemAsync(REFRESH_KEY),
};

/** Refresh goes straight to fetch (not the API client) so it can never recurse into itself. */
async function refreshCall(refreshToken: string): Promise<TokenPair> {
  let response: Response;
  try {
    response = await fetch(`${env.apiUrl}/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Version': env.appVersion,
        'X-Platform': env.platform,
        'X-Device-Id': await getDeviceId(),
      },
      body: JSON.stringify({ refreshToken }),
    });
  } catch (cause) {
    throw networkError(cause);
  }
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok) throw apiErrorFromBody(response, body);
  return body as TokenPair;
}

/** The single session for the app. */
export const session = new SessionManager(secureStorage, refreshCall);
