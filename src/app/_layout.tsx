import '@/core/i18n';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/core/auth/auth-store';
import { useSessionBootstrap } from '@/core/auth/use-session-bootstrap';
import { queryClient } from '@/core/providers/query-client';
import { colors } from '@/core/theme/tokens';
import { UnreachableScreen } from '@/shared/ui/unreachable-screen';

void SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const status = useAuthStore((s) => s.status);
  const { retry } = useSessionBootstrap();
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('../../assets/fonts/inter/Inter-Regular.ttf'),
    'Inter-Medium': require('../../assets/fonts/inter/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../../assets/fonts/inter/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../../assets/fonts/inter/Inter-Bold.ttf'),
    'Inter-ExtraBold': require('../../assets/fonts/inter/Inter-ExtraBold.ttf'),
  });

  const ready = fontsLoaded && status !== 'booting';
  useEffect(() => {
    // The native splash stays until we know where to go: no fixed delay.
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;
  if (status === 'unreachable') return <UnreachableScreen onRetry={retry} />;

  const signedIn = status === 'signedIn';
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.page } }}>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Screen name="index" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <RootNavigator />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
