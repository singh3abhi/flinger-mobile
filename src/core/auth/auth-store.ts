import { create } from 'zustand';

/**
 * Auth status for routing. Holds no tokens (those live in the SessionManager).
 * - booting: native splash stays up while a stored session is resumed
 * - unreachable: a session exists but the server could not be reached; offer a retry
 */
export type AuthStatus = 'booting' | 'signedOut' | 'signedIn' | 'unreachable';

interface AuthState {
  status: AuthStatus;
  setStatus: (status: AuthStatus) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'booting',
  setStatus: (status) => set({ status }),
}));
