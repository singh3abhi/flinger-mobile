import { ApiError } from '@/core/api/errors';
import { SessionManager, type RefreshTokenStorage, type TokenPair } from './session-manager';

class MemoryStorage implements RefreshTokenStorage {
  value: string | null = null;
  async get() {
    return this.value;
  }
  async set(token: string) {
    this.value = token;
  }
  async clear() {
    this.value = null;
  }
}

function pair(n: number, expiresIn = 900): TokenPair {
  return { accessToken: `access-${n}`, refreshToken: `refresh-${n}`, expiresIn };
}

function setup() {
  const storage = new MemoryStorage();
  let clock = 1_000_000;
  let issued = 0;
  const refreshCall = jest.fn(async (_token: string) => pair(++issued + 100));
  const manager = new SessionManager(storage, refreshCall, () => clock);
  const events: boolean[] = [];
  manager.onChange((signedIn) => events.push(signedIn));
  return {
    storage,
    refreshCall,
    manager,
    events,
    advance: (ms: number) => {
      clock += ms;
    },
  };
}

describe('SessionManager', () => {
  it('stores the refresh token securely and keeps the access token in memory', async () => {
    const { manager, storage, events } = setup();
    await manager.start(pair(1));
    expect(storage.value).toBe('refresh-1');
    await expect(manager.getAccessToken()).resolves.toBe('access-1');
    expect(events).toEqual([true]);
  });

  it('refreshes shortly before the access token expires', async () => {
    const { manager, refreshCall, advance } = setup();
    await manager.start(pair(1, 900));
    advance(900_000 - 20_000); // 20 s left: inside the early-refresh window
    await expect(manager.getAccessToken()).resolves.toBe('access-101');
    expect(refreshCall).toHaveBeenCalledWith('refresh-1');
  });

  it('shares one refresh between concurrent callers (the server rotates tokens)', async () => {
    const { manager, refreshCall } = setup();
    await manager.start(pair(1, 900));
    const results = await Promise.all([manager.refresh(), manager.refresh(), manager.refresh()]);
    expect(refreshCall).toHaveBeenCalledTimes(1);
    expect(new Set(results)).toEqual(new Set(['access-101']));
  });

  it('ends the session when the server rejects the refresh token', async () => {
    const { manager, refreshCall, storage, events } = setup();
    await manager.start(pair(1));
    refreshCall.mockRejectedValueOnce(new ApiError(401, 'INVALID_REFRESH_TOKEN', 'gone'));
    await expect(manager.refresh()).resolves.toBeNull();
    expect(storage.value).toBeNull();
    expect(events).toEqual([true, false]);
  });

  it('keeps the session when the network is down, and surfaces the error', async () => {
    const { manager, refreshCall, storage } = setup();
    await manager.start(pair(1));
    refreshCall.mockRejectedValueOnce(new ApiError(0, 'NETWORK', 'offline'));
    await expect(manager.refresh()).rejects.toMatchObject({ code: 'NETWORK' });
    expect(storage.value).toBe('refresh-1');
  });

  it('resume() reports signed out when nothing is stored, without calling the server', async () => {
    const { manager, refreshCall } = setup();
    await expect(manager.resume()).resolves.toBe(false);
    expect(refreshCall).not.toHaveBeenCalled();
  });

  it('resume() restores a stored session on app launch', async () => {
    const { manager, storage } = setup();
    storage.value = 'refresh-saved';
    await expect(manager.resume()).resolves.toBe(true);
    await expect(manager.getAccessToken()).resolves.toBe('access-101');
  });

  it('end() clears everything and notifies once', async () => {
    const { manager, storage, events } = setup();
    await manager.start(pair(1));
    await manager.end();
    await manager.end();
    expect(storage.value).toBeNull();
    await expect(manager.getAccessToken()).resolves.toBeNull();
    expect(events).toEqual([true, false]);
  });
});
