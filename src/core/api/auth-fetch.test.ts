import { createAuthFetch } from './auth-fetch';

const BASE = 'http://api.test';

function deps(overrides: Partial<Parameters<typeof createAuthFetch>[0]> = {}) {
  const sent: Request[] = [];
  const responses: Response[] = [];
  const fetchMock = jest.fn(async (request: Request) => {
    sent.push(request);
    return responses.shift() ?? new Response('{}', { status: 200 });
  });
  const config = {
    getAccessToken: jest.fn(async () => 'token-1' as string | null),
    refresh: jest.fn(async () => 'token-2' as string | null),
    getDeviceId: async () => 'device-123',
    appVersion: '1.2.3',
    platform: 'ios',
    fetch: fetchMock as unknown as typeof fetch,
    ...overrides,
  };
  return { config, sent, responses, fetchMock };
}

describe('authFetch', () => {
  it('adds the client headers and the access token', async () => {
    const { config, sent } = deps();
    await createAuthFetch(config)(new Request(`${BASE}/v1/me`));
    expect(sent[0].headers.get('Authorization')).toBe('Bearer token-1');
    expect(sent[0].headers.get('X-App-Version')).toBe('1.2.3');
    expect(sent[0].headers.get('X-Platform')).toBe('ios');
    expect(sent[0].headers.get('X-Device-Id')).toBe('device-123');
  });

  it('never sends a token to sign-in routes', async () => {
    const { config, sent } = deps();
    await createAuthFetch(config)(
      new Request(`${BASE}/v1/auth/otp/request`, { method: 'POST', body: '{"email":"a@b.co"}' }),
    );
    expect(sent[0].headers.get('Authorization')).toBeNull();
    expect(config.getAccessToken).not.toHaveBeenCalled();
  });

  it('on 401 refreshes once and retries with the new token and the same body', async () => {
    const { config, sent, responses } = deps();
    responses.push(new Response('{}', { status: 401 }), new Response('{"ok":true}', { status: 200 }));
    const response = await createAuthFetch(config)(
      new Request(`${BASE}/v1/me/profile`, { method: 'PATCH', body: '{"name":"Rohan"}' }),
    );
    expect(response.status).toBe(200);
    expect(config.refresh).toHaveBeenCalledTimes(1);
    expect(sent).toHaveLength(2);
    expect(sent[1].headers.get('Authorization')).toBe('Bearer token-2');
    await expect(sent[1].text()).resolves.toBe('{"name":"Rohan"}');
  });

  it('returns the 401 when the session cannot be refreshed', async () => {
    const { config, responses, sent } = deps({ refresh: jest.fn(async () => null) });
    responses.push(new Response('{}', { status: 401 }));
    const response = await createAuthFetch(config)(new Request(`${BASE}/v1/me`));
    expect(response.status).toBe(401);
    expect(sent).toHaveLength(1);
  });

  it('turns a network failure into ApiError NETWORK', async () => {
    const { config } = deps({
      fetch: (async () => {
        throw new TypeError('Network request failed');
      }) as unknown as typeof fetch,
    });
    await expect(createAuthFetch(config)(new Request(`${BASE}/v1/me`))).rejects.toMatchObject({
      code: 'NETWORK',
      status: 0,
    });
  });
});
