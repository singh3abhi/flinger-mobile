import { networkError } from './errors';

export interface AuthFetchDeps {
  getAccessToken: () => Promise<string | null>;
  /** Called once after a 401 to get a new token; null means the session is gone. */
  refresh: () => Promise<string | null>;
  getDeviceId: () => Promise<string>;
  appVersion: string;
  platform: string;
  fetch?: typeof fetch;
}

/** Routes that must never carry (or wait for) an access token. */
const PUBLIC_PATHS = ['/v1/auth/otp/request', '/v1/auth/otp/verify', '/v1/auth/refresh', '/v1/config'];

function isPublic(url: string): boolean {
  const { pathname } = new URL(url);
  return PUBLIC_PATHS.includes(pathname);
}

/**
 * The fetch used by the API client. Adds client headers and the access token, and on a 401 refreshes
 * once and retries the request. Network failures become ApiError(status 0).
 */
export function createAuthFetch(deps: AuthFetchDeps) {
  const send = deps.fetch ?? fetch;

  return async function authFetch(input: Request): Promise<Response> {
    const publicRoute = isPublic(input.url);
    const original = input.clone(); // keep an unread copy for a retry
    const deviceId = await deps.getDeviceId();

    const attempt = async (request: Request, token: string | null): Promise<Response> => {
      request.headers.set('X-App-Version', deps.appVersion);
      request.headers.set('X-Platform', deps.platform);
      request.headers.set('X-Device-Id', deviceId);
      if (token) request.headers.set('Authorization', `Bearer ${token}`);
      try {
        return await send(request);
      } catch (cause) {
        throw networkError(cause);
      }
    };

    const token = publicRoute ? null : await deps.getAccessToken();
    const response = await attempt(input, token);
    if (response.status !== 401 || publicRoute || !token) return response;

    const fresh = await deps.refresh();
    if (!fresh) return response;
    return attempt(original, fresh);
  };
}
