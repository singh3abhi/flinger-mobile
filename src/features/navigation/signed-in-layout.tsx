import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { realtime } from '@/core/realtime';
import { useChatEvents } from '@/features/chat';
import { refreshPushToken, useOpenFromPush } from '@/features/notifications';

/** Everything behind sign-in: the live connection, chat events and push handling. */
export function SignedInLayout() {
  useEffect(() => {
    void realtime.connect();
    void refreshPushToken();
    return () => realtime.disconnect();
  }, []);
  useChatEvents();
  useOpenFromPush();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="match" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
      <Stack.Screen name="notifications" options={{ presentation: 'fullScreenModal' }} />
    </Stack>
  );
}
