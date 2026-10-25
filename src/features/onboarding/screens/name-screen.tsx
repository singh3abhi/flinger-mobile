import { useRef, useState, type ComponentRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, View } from 'react-native';
import { ApiError } from '@/core/api/errors';
import { colors, fonts, radius } from '@/core/theme/tokens';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { HardShadow } from '@/shared/ui/hard-shadow';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';
import { ageOn, formatLongDate, fromIsoDate, localToday, toIsoDate, type DateParts } from '../birthday';
import { OnboardingFrame } from '../components/onboarding-frame';
import { useStep } from '../use-step';

const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
const MIN_AGE = 18;

export function NameScreen() {
  const { t } = useTranslation();
  const { profile, saveAndContinue, saving, error, rawError } = useStep('name');
  const locked = profile.birthDate !== null;

  const [name, setName] = useState(profile.displayName ?? '');
  const [date, setDate] = useState<DateParts>(
    profile.birthDate ? fromIsoDate(profile.birthDate) : { day: '', month: '', year: '' },
  );
  const [problem, setProblem] = useState<string>();
  const [confirming, setConfirming] = useState<string | null>(null);
  const month = useRef<ComponentRef<typeof TextInput>>(null);
  const year = useRef<ComponentRef<typeof TextInput>>(null);

  const trimmed = name.trim();
  const birthDate = toIsoDate(date);

  const submit = () => {
    if (trimmed.length < 2 || trimmed.length > 30 || !NAME_PATTERN.test(trimmed)) {
      return setProblem(t('onboarding.name.invalidName'));
    }
    if (!birthDate) return setProblem(t('onboarding.name.invalidDate'));
    if (ageOn(birthDate, localToday()) < MIN_AGE) return setProblem(t('onboarding.name.underage'));
    setProblem(undefined);
    if (locked) return saveAndContinue({ displayName: trimmed });
    setConfirming(birthDate);
  };

  const serverProblem =
    rawError instanceof ApiError && rawError.code === 'PROFILE_UNDERAGE'
      ? t('onboarding.name.underage')
      : error;

  const field = (key: keyof DateParts, placeholder: string, flex: number, max: number) => (
    <HardShadow style={{ flex }}>
      <TextInput
        ref={key === 'month' ? month : key === 'year' ? year : undefined}
        testID={`birthday-${key}`}
        accessibilityLabel={t(`onboarding.name.${key}`)}
        value={date[key]}
        editable={!locked}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType="number-pad"
        maxLength={max}
        onChangeText={(text) => {
          const digits = text.replace(/\D/g, '');
          setDate((d) => ({ ...d, [key]: digits }));
          if (digits.length === max && key === 'day') month.current?.focus();
          if (digits.length === max && key === 'month') year.current?.focus();
        }}
        style={[styles.dateInput, locked && styles.locked]}
      />
    </HardShadow>
  );

  return (
    <OnboardingFrame
      route="name"
      showBack={false}
      title={t('onboarding.name.title')}
      subtitle={t('onboarding.name.subtitle')}
      note={t('onboarding.name.note')}
      noteIcon="lock"
      onNext={submit}
      nextDisabled={trimmed.length === 0 || !date.day || !date.month || date.year.length < 4}
      saving={saving}
      error={problem ?? serverProblem}
    >
      <TextField
        testID="name-input"
        label={t('onboarding.name.nameLabel')}
        hint={t('onboarding.name.nameHint')}
        value={name}
        onChangeText={setName}
        placeholder={t('onboarding.name.namePlaceholder')}
        autoCapitalize="words"
        autoComplete="given-name"
        textContentType="givenName"
        maxLength={30}
        returnKeyType="next"
      />

      <Text variant="label" style={styles.label}>
        {t('onboarding.name.birthdayLabel')}
      </Text>
      <Text variant="caption" style={styles.sub}>
        {locked ? t('onboarding.name.birthdayLocked') : t('onboarding.name.birthdayHint')}
      </Text>
      <View style={styles.dateRow}>
        {field('day', 'DD', 1, 2)}
        {field('month', 'MM', 1, 2)}
        {field('year', 'YYYY', 1.6, 4)}
      </View>
      <Text variant="caption" color="text3" style={styles.format}>
        {t('onboarding.name.dateFormat')}
      </Text>

      <ConfirmDialog
        visible={confirming !== null}
        title={t('onboarding.name.confirmTitle')}
        message={
          confirming
            ? t('onboarding.name.confirmBody', {
                date: formatLongDate(confirming),
                age: ageOn(confirming, localToday()),
              })
            : ''
        }
        cancelLabel={t('onboarding.name.edit')}
        confirmLabel={t('onboarding.name.confirm')}
        onCancel={() => setConfirming(null)}
        onConfirm={() => {
          const confirmed = confirming;
          setConfirming(null);
          if (confirmed) saveAndContinue({ displayName: trimmed, birthDate: confirmed });
        }}
      />
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  label: { marginTop: 28, fontSize: 15 },
  sub: { marginTop: 4, marginBottom: 10 },
  dateRow: { flexDirection: 'row', gap: 10 },
  dateInput: {
    height: 54,
    borderRadius: radius.control,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    textAlign: 'center',
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.ink,
  },
  locked: { backgroundColor: colors.surface },
  format: { marginTop: 12 },
});
