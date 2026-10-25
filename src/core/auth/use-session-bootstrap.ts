import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { session } from './session';
import { useAuthStore } from './auth-store';

/**
 * Resume a stored session on launch and keep the auth status in sync with the SessionManager.
 * Signing out (or the server revoking the session) clears all cached server data.
 */
export function useSessionBootstrap() {
  const setStatus = useAuthStore((s) => s.setStatus);
  const queryClient = useQueryClient();

  const resume = useCallback(async () => {
    setStatus('booting');
    try {
      setStatus((await session.resume()) ? 'signedIn' : 'signedOut');
    } catch {
      setStatus('unreachable');
    }
  }, [setStatus]);

  useEffect(() => {
    const unsubscribe = session.onChange((signedIn) => {
      setStatus(signedIn ? 'signedIn' : 'signedOut');
      if (!signedIn) queryClient.clear();
    });
    void resume();
    return unsubscribe;
  }, [queryClient, resume, setStatus]);

  return { retry: resume };
}
