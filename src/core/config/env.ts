import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * App configuration. Only EXPO_PUBLIC_* variables are available in the app, and they are public:
 * never put a secret here. The iOS Simulator reaches the Mac's localhost directly; an Android
 * emulator needs http://10.0.2.2:4000.
 */
export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000',
  /** The chat socket server (the backend's realtime process). */
  realtimeUrl: process.env.EXPO_PUBLIC_REALTIME_URL ?? 'http://localhost:4001',
  appVersion: Constants.expoConfig?.version ?? '0.0.0',
  platform: (Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web') as
    | 'ios'
    | 'android'
    | 'web',
} as const;
