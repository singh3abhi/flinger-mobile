import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '@/core/theme/tokens';
import { Text } from '@/shared/ui/text';
import { OnboardingFrame } from '../components/onboarding-frame';
import { useStep } from '../use-step';

/**
 * Temporary stand-in for the location step while its backend is built (F2 slice 2d). Lets the rest of onboarding be walked end to end.
 */
export function PendingStepScreen({ route }: { route: 'location' }) {
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
