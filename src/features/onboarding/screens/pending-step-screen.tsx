import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '@/core/theme/tokens';
import { Text } from '@/shared/ui/text';
import { OnboardingFrame } from '../components/onboarding-frame';
import { useStep } from '../use-step';

/**
 * Temporary stand-in for the photos and location steps while their backends are built
 * (F2 slices 2c and 2d). Lets the rest of onboarding be walked end to end.
 */
export function PendingStepScreen({ route }: { route: 'photos' | 'location' }) {
  const { t } = useTranslation();
  const { goNext } = useStep(route);
  return (
    <OnboardingFrame route={route} title={t(`onboarding.pending.${route}`)} onNext={goNext}>
      <View style={styles.box}>
        <Text variant="body">{t('onboarding.pending.body')}</Text>
      </View>
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  box: { padding: 16, borderRadius: radius.control, backgroundColor: colors.surface },
});
