import { Redirect, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { errorMessage } from '@/core/i18n';
import { colors } from '@/core/theme/tokens';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { useMyProfile } from './queries';
import { resumeRoute } from './steps';
import { onboardingHref } from './use-step';

/** Loads the saved answers once; every step screen can then read them synchronously. */
export function OnboardingLayout() {
  const { t } = useTranslation();
  const profile = useMyProfile();

  if (profile.isPending) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }
  if (profile.isError) {
    return (
      <View style={styles.center}>
        <Text variant="body" style={styles.message}>
          {errorMessage(profile.error)}
        </Text>
        <Button label={t('common.retry')} onPress={() => profile.refetch()} />
      </View>
    );
  }
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
      <Stack.Screen name="prompt-picker" options={{ presentation: 'modal' }} />
      <Stack.Screen name="prompt-answer" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

/** /onboarding: jump to the first unanswered required step. */
export function OnboardingResume() {
  const profile = useMyProfile().data;
  if (!profile) return null;
  return <Redirect href={onboardingHref(resumeRoute(profile))} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: colors.cream,
  },
  message: { textAlign: 'center' },
});
