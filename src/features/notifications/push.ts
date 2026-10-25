import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { useEffect } from 'react';
import { api } from '@/core/api/client';
import { env } from '@/core/config/env';
import { getDeviceId } from '@/core/device/device-id';

/** How a push from the server appears while the app is open (the server skips most of those). */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export type PushPermission = 'granted' | 'denied' | 'undetermined';

export async function pushPermission(): Promise<PushPermission> {
  const { status } = await Notifications.getPermissionsAsync();
  return status as PushPermission;
}

/**
 * Ask for permission (if not decided yet) and register this install's push token with the API.
 * Quietly does nothing where push isn't available (simulators, no Expo project id yet: D-31).
 */
export async function enablePush(): Promise<PushPermission> {
  let status = await pushPermission();
  if (status === 'undetermined') {
    status = (await Notifications.requestPermissionsAsync()).status as PushPermission;
  }
  if (status === 'granted') await registerToken();
  return status;
}

/** Register the token if permission was already given (on every launch: tokens can change). */
export async function refreshPushToken(): Promise<void> {
  if ((await pushPermission()) === 'granted') await registerToken();
}

async function registerToken(): Promise<void> {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (!projectId || env.platform === 'web') return;
  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await api.PUT('/v1/devices/{deviceId}/push-token', {
      params: { path: { deviceId: await getDeviceId() } },
      body: { provider: 'expo', token, platform: env.platform },
    });
  } catch {
    // No token on simulators / without push credentials: chat still works in the app.
  }
}

/** Stop pushes to this phone (before signing out). */
export async function unregisterPush(): Promise<void> {
  try {
    await api.DELETE('/v1/devices/{deviceId}/push-token', {
      params: { path: { deviceId: await getDeviceId() } },
    });
  } catch {
    // Best effort.
  }
}

/** Opening a push goes to the conversation, or to Chats for a new match. */
export function useOpenFromPush(): void {
  const response = Notifications.useLastNotificationResponse();
  useEffect(() => {
    const key = response?.notification.request.identifier;
    const data = response?.notification.request.content.data as
      | { type?: string; conversationId?: string }
      | undefined;
    if (!key || !data || handled.has(key)) return;
    handled.add(key);
    if (data.type === 'new_message' && data.conversationId) {
      router.push(`/chat/${data.conversationId}` as Href);
    } else if (data.type === 'new_match') {
      router.push('/chats' as Href);
    }
  }, [response]);
}

/** Pushes already acted on (the last response stays available after it was handled). */
const handled = new Set<string>();
