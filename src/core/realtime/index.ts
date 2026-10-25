import { session } from '@/core/auth/session';
import { env } from '@/core/config/env';
import { RealtimeClient } from './realtime-client';

/** The app's single realtime connection (connected by the signed-in layout). */
export const realtime = new RealtimeClient({
  url: env.realtimeUrl,
  getAccessToken: () => session.getAccessToken(),
  refresh: async () => {
    try {
      return (await session.refresh()) !== null; // null: signed out
    } catch {
      return true; // network trouble: keep retrying
    }
  },
});

export { useRealtimeStatus, type Ack, type RealtimeStatus } from './realtime-client';
