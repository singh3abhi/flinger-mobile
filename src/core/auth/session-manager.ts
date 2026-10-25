import { ApiError } from '@/core/api/errors';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  /** Seconds until the access token expires. */
  expiresIn: number;
}

/** Where the refresh token lives between app launches (the platform keychain / keystore). */
export interface RefreshTokenStorage {
  get(): Promise<string | null>;
  set(token: string): Promise<void>;
  clear(): Promise<void>;
}

/** Calls POST /v1/auth/refresh. Throws ApiError. */
export type RefreshCall = (refreshToken: string) => Promise<TokenPair>;

/** Refresh this long before expiry so requests never race the deadline. */
const EARLY_REFRESH_MS = 30_000;

/**
 * Owns the credentials. Nothing else in the app touches tokens.
 *
 * - The access token lives only in memory; the refresh token only in secure storage.
 * - Concurrent callers share ONE refresh request. This matters: the backend rotates refresh tokens
 *   and treats a second use of the same token as theft, revoking the session.
 * - If the server says the session is gone (401) the session ends. Network failures do NOT end it:
 *   the caller sees the error and can retry.
 */
export class SessionManager {
  private accessToken: string | null = null;
  private accessExpiresAt = 0;
  private inflight: Promise<string | null> | null = null;
  private readonly listeners = new Set<(signedIn: boolean) => void>();

  constructor(
    private readonly storage: RefreshTokenStorage,
    private readonly refreshCall: RefreshCall,
    private readonly now: () => number = () => Date.now(),
  ) {}

  /** Subscribe to sign-in / sign-out. Returns an unsubscribe function. */
  onChange(listener: (signedIn: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Store a fresh pair (after sign-in or refresh). The refresh token is persisted first. */
  async start(tokens: TokenPair): Promise<void> {
    await this.storage.set(tokens.refreshToken);
    this.accessToken = tokens.accessToken;
    this.accessExpiresAt = this.now() + tokens.expiresIn * 1000;
    this.emit(true);
  }

  /**
   * On app launch: true when a stored session could be resumed, false when signed out.
   * Throws ApiError (network) when the server could not be reached: the session is kept.
   */
  async resume(): Promise<boolean> {
    if (!(await this.storage.get())) return false;
    return (await this.refresh()) !== null;
  }

  /** A valid access token, refreshing if needed; null when signed out. */
  async getAccessToken(): Promise<string | null> {
    if (this.accessToken && this.now() < this.accessExpiresAt - EARLY_REFRESH_MS) {
      return this.accessToken;
    }
    return this.refresh();
  }

  /** Force a refresh (e.g. after a 401). Concurrent calls share one request. */
  refresh(): Promise<string | null> {
    this.inflight ??= this.runRefresh().finally(() => {
      this.inflight = null;
    });
    return this.inflight;
  }

  /** Forget everything locally (the server-side logout call is the caller's job). */
  async end(): Promise<void> {
    const wasSignedIn = this.accessToken !== null || (await this.storage.get()) !== null;
    this.accessToken = null;
    this.accessExpiresAt = 0;
    await this.storage.clear();
    if (wasSignedIn) this.emit(false);
  }

  private async runRefresh(): Promise<string | null> {
    const refreshToken = await this.storage.get();
    if (!refreshToken) {
      await this.end();
      return null;
    }
    try {
      const pair = await this.refreshCall(refreshToken);
      await this.start(pair);
      return pair.accessToken;
    } catch (error) {
      if (error instanceof ApiError && error.isAuth) {
        await this.end();
        return null;
      }
      throw error;
    }
  }

  private emit(signedIn: boolean): void {
    for (const listener of this.listeners) listener(signedIn);
  }
}
