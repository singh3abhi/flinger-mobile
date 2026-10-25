export interface FieldError {
  path: string;
  message: string;
}

/**
 * Every failed API call becomes an ApiError. Screens switch on `code` (stable, from the backend
 * contract), never on message text. status 0 means the request never reached the server.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fieldErrors: FieldError[] = [],
    readonly requestId?: string,
    /** From the Retry-After header (rate limits, resend cooldown). */
    readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isNetwork(): boolean {
    return this.status === 0;
  }

  /** The session is gone or the account is not allowed in: the app must sign out. */
  get isAuth(): boolean {
    return this.status === 401 || this.code === 'ACCOUNT_UNAVAILABLE';
  }
}

interface ProblemBody {
  code?: string;
  detail?: string;
  title?: string;
  errors?: FieldError[];
  requestId?: string;
}

function retryAfter(response: Response): number | undefined {
  const value = Number(response.headers.get('retry-after'));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

/** Build an ApiError from an RFC 7807 problem+json response (or anything else). */
export function apiErrorFromBody(response: Response, body: unknown): ApiError {
  const problem = (body && typeof body === 'object' ? body : {}) as ProblemBody;
  return new ApiError(
    response.status,
    problem.code ?? `HTTP_${response.status}`,
    problem.detail ?? problem.title ?? `Request failed (${response.status})`,
    Array.isArray(problem.errors) ? problem.errors : [],
    problem.requestId,
    retryAfter(response),
  );
}

export function networkError(cause: unknown): ApiError {
  const error = new ApiError(0, 'NETWORK', 'Could not reach Flinger. Check your connection.');
  (error as { cause?: unknown }).cause = cause;
  return error;
}

/** Unwrap an openapi-fetch result: return data or throw ApiError. */
export function unwrap<T>(result: { data?: T; error?: unknown; response: Response }): T {
  if (result.error !== undefined || !result.response.ok) {
    throw apiErrorFromBody(result.response, result.error);
  }
  return result.data as T;
}

/** Same as unwrap, for calls that return no body (204). */
export function ensureOk(result: { error?: unknown; response: Response }): void {
  if (result.error !== undefined || !result.response.ok) {
    throw apiErrorFromBody(result.response, result.error);
  }
}
