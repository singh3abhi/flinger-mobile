import { Redirect } from 'expo-router';
import { useAuthStore } from '@/core/auth/auth-store';

/** Entry point: send people to the right place for their sign-in state. */
export default function Index() {
  const signedIn = useAuthStore((s) => s.status === 'signedIn');
  return <Redirect href={signedIn ? '/home' : '/welcome'} />;
}
