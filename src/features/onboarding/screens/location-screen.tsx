import { Feather } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState, Linking, StyleSheet, View } from 'react-native';
import { ApiError } from '@/core/api/errors';
import { errorMessage } from '@/core/i18n';
import { colors, radius } from '@/core/theme/tokens';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { saveLocation } from '../api';
import { OnboardingFrame } from '../components/onboarding-frame';
import { profileKeys } from '../queries';
import { useStep } from '../use-step';

const art = require('../../../../assets/images/location.png');

class PermissionDenied extends Error {
  constructor(readonly canAskAgain: boolean) {
    super('Location permission denied');
  }
}

/** Ask for permission, take one fix and send it. GPS only: there is no manual city. */
async function shareLocation() {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== Location.PermissionStatus.GRANTED) {
    throw new PermissionDenied(permission.canAskAgain);
  }
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return saveLocation({
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracyMeters: position.coords.accuracy ?? 10_000,
    mocked: position.mocked ?? false,
    capturedAt: new Date(position.timestamp).toISOString(),
  });
}

/** Step 12: GPS location. Required; members who refuse see how to turn it on in Settings. */
export function LocationScreen() {
  const { t } = useTranslation();
  const { profile, goNext } = useStep('location');
  const queryClient = useQueryClient();
  const [blocked, setBlocked] = useState(false);

  const share = useMutation({
    mutationFn: shareLocation,
    onSuccess: async () => {
      setBlocked(false);
      await queryClient.invalidateQueries({ queryKey: profileKeys.mine });
    },
    onError: (error) => {
      if (error instanceof PermissionDenied && !error.canAskAgain) setBlocked(true);
    },
  });

  // Coming back from Settings with permission granted: try again straight away.
  useEffect(() => {
    if (!blocked) return;
    const subscription = AppState.addEventListener('change', async (state) => {
      if (state !== 'active') return;
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === Location.PermissionStatus.GRANTED) share.mutate();
    });
    return () => subscription.remove();
  }, [blocked, share]);

  const city = profile.location?.city ?? null;
  const done = profile.location !== null;

  const problem = (() => {
    if (!share.isError) return undefined;
    const error = share.error;
    if (error instanceof PermissionDenied) return t('onboarding.location.denied');
    if (error instanceof ApiError) return errorMessage(error);
    return t('onboarding.location.unavailable');
  })();

  return (
    <OnboardingFrame
      route="location"
      hero={<Image source={art} style={styles.art} contentFit="contain" />}
      title={t('onboarding.location.title')}
      subtitle={t('onboarding.location.subtitle')}
      onNext={goNext}
      error={problem}
      footer={
        <View style={styles.footer}>
          {done ? (
            <Button testID="location-continue" label={t('common.next')} onPress={goNext} />
          ) : blocked ? (
            <Button
              testID="location-settings"
              label={t('onboarding.location.openSettings')}
              onPress={() => void Linking.openSettings()}
            />
          ) : (
            <Button
              testID="location-enable"
              label={t('onboarding.location.enable')}
              loading={share.isPending}
              onPress={() => share.mutate()}
            />
          )}
        </View>
      }
    >
      <View style={styles.privacy}>
        <Feather name="shield" size={18} color={colors.ink} />
        <Text variant="caption" style={styles.flex}>
          {t('onboarding.location.privacy')}
        </Text>
      </View>
      {done ? (
        <View style={styles.result} accessibilityLiveRegion="polite">
          <Feather name="map-pin" size={20} color={colors.accentInk} />
          <Text variant="label" style={styles.flex}>
            {city ? t('onboarding.location.found', { city }) : t('onboarding.location.foundNoCity')}
          </Text>
        </View>
      ) : null}
      {blocked ? (
        <Text variant="body" style={styles.blocked}>
          {t('onboarding.location.blocked')}
        </Text>
      ) : null}
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  art: { width: 128, height: 128 },
  privacy: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: radius.control,
    backgroundColor: colors.white,
  },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    padding: 14,
    borderRadius: radius.control,
    backgroundColor: colors.accentTint,
  },
  blocked: { marginTop: 16 },
  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
});
