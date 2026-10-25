import { Feather } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { ApiError } from '@/core/api/errors';
import { errorMessage } from '@/core/i18n';
import { colors, radius } from '@/core/theme/tokens';
import { RoundButton } from '@/shared/ui/round-button';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';
import { requestCode } from '../api';
import { normaliseEmail } from '../email';

export function EmailScreen() {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string>();

  const send = useMutation({
    mutationFn: requestCode,
    onSuccess: (result, email) =>
      router.push({
        pathname: '/verify',
        params: { email, resendIn: String(result.resendAvailableInSeconds) },
      }),
    onError: (err, email) => {
      // A code was sent moments ago and is still valid: go straight to entering it.
      if (err instanceof ApiError && err.code === 'OTP_COOLDOWN') {
        router.push({
          pathname: '/verify',
          params: { email, resendIn: String(err.retryAfterSeconds ?? 60) },
        });
        return;
      }
      setError(errorMessage(err));
    },
  });

  const submit = () => {
    const email = normaliseEmail(value);
    if (!email) {
      setError(t('email.invalid'));
      return;
    }
    setError(undefined);
    send.mutate(email);
  };

  return (
    <Screen background="cream">
      <View style={styles.top}>
        <RoundButton
          label={t('common.back')}
          size={36}
          icon={<Feather name="arrow-left" size={20} color={colors.ink} />}
          onPress={() => router.back()}
        />
      </View>
      <Text variant="title" accessibilityRole="header" style={styles.title}>
        {t('email.title')}
      </Text>
      <Text variant="bodyLg" color="text2" style={styles.subtitle}>
        {t('email.subtitle')}
      </Text>

      <View style={styles.segment} accessibilityRole="tablist">
        <View style={[styles.tab, styles.tabActive]} accessibilityRole="tab" accessibilityState={{ selected: true }}>
          <Text variant="label" color="white" style={styles.tabText}>
            {t('email.tabEmail')}
          </Text>
        </View>
        <Pressable style={styles.tab} accessibilityRole="tab" accessibilityState={{ disabled: true }} disabled>
          <Text variant="label" style={styles.tabText}>
            {t('email.tabPhone')}
          </Text>
          <View style={styles.soon}>
            <Text variant="small" color="accentTintInk" style={styles.soonText}>
              {t('email.soon')}
            </Text>
          </View>
        </Pressable>
      </View>

      <TextField
        testID="email-input"
        label={t('email.label')}
        placeholder={t('email.placeholder')}
        value={value}
        onChangeText={(text) => {
          setValue(text);
          if (error) setError(undefined);
        }}
        onSubmitEditing={submit}
        error={error}
        hint={t('email.hint')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="send"
        autoFocus
      />

      <View style={styles.fill} />
      <View style={styles.footer}>
        <Feather name="lock" size={20} color={colors.ink} />
        <Text variant="caption" style={styles.privacy}>
          {t('email.privacy')}
        </Text>
        <RoundButton
          testID="email-next"
          label={t('common.next')}
          size={56}
          variant="accent"
          disabled={send.isPending}
          icon={<Feather name="arrow-right" size={28} color={colors.ink} />}
          onPress={submit}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  top: { paddingTop: 12 },
  title: { marginTop: 24 },
  subtitle: { marginTop: 12, marginBottom: 28 },
  segment: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: radius.control,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  tabActive: { backgroundColor: colors.ink },
  tabText: { fontSize: 14 },
  soon: { backgroundColor: colors.accentTint, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  soonText: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 16 },
  privacy: { flex: 1 },
});
