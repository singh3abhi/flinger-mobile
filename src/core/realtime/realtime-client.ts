import { io, type Socket } from 'socket.io-client';
import { create } from 'zustand';

export type RealtimeStatus = 'idle' | 'connecting' | 'connected' | 'offline';

export const useRealtimeStatus = create<{ status: RealtimeStatus; set: (s: RealtimeStatus) => void }>(
  (set) => ({ status: 'idle', set: (status) => set({ status }) }),
);

type Listener = (payload: unknown) => void;

export interface RealtimeDeps {
  url: string;
  getAccessToken: () => Promise<string | null>;
  /** Called when the server rejects the token; returns false when the session is gone. */
  refresh: () => Promise<boolean>;
}

export interface Ack {
  ok: boolean;
  code?: string;
  message?: unknown;
}

/**
 * One Socket.IO connection to /chat while signed in. The server only sends events to this member's
 * room; screens subscribe by event name. Postgres (via REST) stays the truth: on every (re)connect
 * the `reconnected` listeners run so screens can gap-fill.
 */
export class RealtimeClient {
  private socket: Socket | null = null;
  private readonly listeners = new Map<string, Set<Listener>>();

  constructor(private readonly deps: RealtimeDeps) {}

  async connect(): Promise<void> {
    if (this.socket) return;
    const status = useRealtimeStatus.getState();
    status.set('connecting');
    const socket = io(`${this.deps.url}/chat`, {
      transports: ['websocket'],
      // Fresh token on every (re)connect attempt.
      auth: (cb) => {
        void this.deps.getAccessToken().then((token) => cb({ token }));
      },
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10_000,
    });
    this.socket = socket;

    socket.on('connect', () => {
      useRealtimeStatus.getState().set('connected');
      this.dispatch('reconnected', undefined);
    });
    socket.on('disconnect', () => useRealtimeStatus.getState().set('offline'));
    socket.on('connect_error', (error: Error) => {
      useRealtimeStatus.getState().set('offline');
      if (error.message === 'UNAUTHORIZED') {
        // The access token expired: refresh, then let Socket.IO retry with the new one.
        void this.deps.refresh().then((ok) => {
          if (ok) socket.connect();
          else this.disconnect();
        });
      }
    });
    socket.onAny((event: string, payload: unknown) => this.dispatch(event, payload));
  }

  disconnect(): void {
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
    useRealtimeStatus.getState().set('idle');
  }

  get connected(): boolean {
    return this.socket?.connected ?? false;
  }

  /** Emit and wait for the server's acknowledgement (rejects on timeout or when offline). */
  async request(event: string, payload: unknown, timeoutMs = 8000): Promise<Ack> {
    if (!this.socket?.connected) throw new Error('offline');
    return (await this.socket.timeout(timeoutMs).emitWithAck(event, payload)) as Ack;
  }

  /** Fire and forget (e.g. typing). */
  emit(event: string, payload: unknown): void {
    if (this.socket?.connected) this.socket.emit(event, payload);
  }

  /** Subscribe to a server event (or `reconnected`). Returns the unsubscribe function. */
  on(event: string, listener: Listener): () => void {
    const set = this.listeners.get(event) ?? new Set<Listener>();
    set.add(listener);
    this.listeners.set(event, set);
    return () => set.delete(listener);
  }

  private dispatch(event: string, payload: unknown): void {
    for (const listener of this.listeners.get(event) ?? []) listener(payload);
  }
}
