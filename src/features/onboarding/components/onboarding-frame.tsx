import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { colors, radius } from '@/core/theme/tokens';
import { RoundButton } from '@/shared/ui/round-button';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { stepNumber, TOTAL_STEPS, type OnboardingRoute } from '../steps';

export interface OnboardingFrameProps {
  route: OnboardingRoute;
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Footer note next to the Next button. `lock` adds the padlock icon. */
  note?: string;
  noteIcon?: 'lock';
  /** Optional screens show "Skip" in place of the note. */
  onSkip?: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  saving?: boolean;
  /** Shown above the footer, announced to screen readers. */
  error?: string;
  showBack?: boolean;
  /** Replace the round Next button with a custom footer (the last screen). */
  footer?: ReactNode;
}

/** Shared chrome for every onboarding screen: progress, back, title, body, footer. */
export function OnboardingFrame({
  route,
  title,
  subtitle,
  children,
  note,
  noteIcon,
  onSkip,
  onNext,
  nextDisabled = false,
  saving = false,
  error,
  showBack = true,
  footer,
}: OnboardingFrameProps) {
  const { t } = useTranslation();
  const step = stepNumber(route);

  return (
    <Screen background="cream" padded={false}>
      <View style={styles.top}>
        <View
          style={styles.track}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: TOTAL_STEPS, now: step }}
        >
          <View style={[styles.fill, { width: `${(step / TOTAL_STEPS) * 100}%` }]} />
        </View>
        <Text variant="small" style={styles.step}>
          {t('onboarding.stepOf', { step, total: TOTAL_STEPS })}
        </Text>
        {showBack ? (
          <View style={styles.back}>
            <RoundButton
              label={t('common.back')}
              size={36}
              icon={<Feather name="arrow-left" size={20} color={colors.ink} />}
              onPress={() => router.back()}
            />
          </View>
        ) : null}
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="title" accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="body" style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
        <View style={styles.body}>{children}</View>
      </ScrollView>

      {error ? (
        <Text variant="caption" color="danger" accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : null}

      {footer ?? (
        <View style={styles.footer}>
          {onSkip ? (
            <Pressable
              accessibilityRole="button"
              onPress={onSkip}
              hitSlop={12}
              style={styles.flex}
              disabled={saving}
            >
              <Text variant="label" style={styles.skip}>
                {t('onboarding.skip')}
              </Text>
            </Pressable>
          ) : (
            <View style={styles.note}>
              {noteIcon === 'lock' ? <Feather name="lock" size={18} color={colors.ink} /> : null}
              {note ? (
                <Text variant="caption" style={styles.flex}>
                  {note}
                </Text>
              ) : null}
            </View>
          )}
          {saving ? (
            <View style={styles.spinner}>
              <ActivityIndicator color={colors.ink} />
            </View>
          ) : (
            <RoundButton
              testID="onboarding-next"
              label={t('common.next')}
              size={56}
              variant="accent"
              disabled={nextDisabled}
              icon={<Feather name="arrow-right" size={28} color={colors.ink} />}
              onPress={onNext}
            />
          )}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { paddingHorizontal: 20, paddingTop: 12 },
  track: { height: 4, borderRadius: 4, backgroundColor: colors.track, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4, backgroundColor: colors.accent },
  step: { marginTop: 6 },
  back: { marginTop: 18, alignSelf: 'flex-start' },
  scroll: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 24 },
  subtitle: { marginTop: 12 },
  body: { marginTop: 26 },
  error: { paddingHorizontal: 20, paddingBottom: 4 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  note: { flex: 1, flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  skip: { textDecorationLine: 'underline' },
  spinner: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
});
