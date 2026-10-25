import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const KEY = 'flinger.deviceId';
let cached: string | undefined;

/**
 * A stable random id for this installation. Tags the server-side session so a person can be
 * signed out per device. Not tied to hardware identifiers.
 */
export async function getDeviceId(): Promise<string> {
  if (cached) return cached;
  const existing = await SecureStore.getItemAsync(KEY);
  if (existing) {
    cached = existing;
    return existing;
  }
  const id = Crypto.randomUUID();
  await SecureStore.setItemAsync(KEY, id);
  cached = id;
  return id;
}
