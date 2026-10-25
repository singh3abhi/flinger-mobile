import { Feather } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { ApiError } from '@/core/api/errors';
import { errorMessage } from '@/core/i18n';
import { colors } from '@/core/theme/tokens';
import { Button } from '@/shared/ui/button';
import { OtpInput } from '@/shared/ui/otp-input';
import { RoundButton } from '@/shared/ui/round-button';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { requestCode, verifyCode } from '../api';
import { formatCountdown, maskEmail } from '../email';

function useCountdown(initialSeconds: number) {
  const [left, setLeft] = useState(initialSeconds);
  useEffect(() => {
    if (left <= 0) return;
    const timer = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [left]);
  return [left, setLeft] as const;
}

export function VerifyScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ email: string; resendIn?: string }>();
  const email = params.email ?? '';
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [resendLeft, setResendLeft] = useCountdown(Number(params.resendIn ?? 120));

  // On success the session starts; the root layout then switches to the signed-in screens.
  const verify = useMutation({
    mutationFn: (value: string) => verifyCode(email, value),
    onError: (err) => {
      setError(errorMessage(err));
      setCode('');
    },
  });

  const resend = useMutation({
    mutationFn: () => requestCode(email),
    onSuccess: (result) => {
      setResendLeft(result.resendAvailableInSeconds);
      setError(undefined);
      setNotice(t('verify.resent'));
    },
    onError: (err) => {
      if (err instanceof ApiError && err.retryAfterSeconds) setResendLeft(err.retryAfterSeconds);
      setError(errorMessage(err));
    },
  });

  const submit = (value = code) => {
    if (value.length !== 6 || verify.isPending) return;
    setError(undefined);
    setNotice(undefined);
    verify.mutate(value);
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
        {t('verify.title')}
      </Text>
      <Text variant="bodyLg" color="text2" style={styles.subtitle}>
        {t('verify.subtitle', { email: maskEmail(email) })}
      </Text>

      <OtpInput
        value={code}
        onChange={(value) => {
          setCode(value);
          if (error) setError(undefined);
        }}
        onComplete={submit}
        hasError={Boolean(error)}
      />
      {error ? (
        <Text variant="caption" color="danger" accessibilityLiveRegion="polite" style={styles.message}>
          {error}
        </Text>
      ) : notice ? (
        <Text variant="caption" color="success" accessibilityLiveRegion="polite" style={styles.message}>
          {notice}
        </Text>
      ) : null}

      <Button
        testID="verify-submit"
        label={t('verify.submit')}
        onPress={() => submit()}
        loading={verify.isPending}
        disabled={code.length !== 6}
        style={styles.submit}
      />

      {resendLeft > 0 ? (
        <Text variant="body" style={styles.center}>
          {t('verify.resendIn', { time: formatCountdown(resendLeft) })}
        </Text>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={() => resend.mutate()}
          disabled={resend.isPending}
          style={styles.linkHit}
        >
          <Text variant="label" style={[styles.center, styles.link]}>
            {t('verify.resend')}
          </Text>
        </Pressable>
      )}
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.linkHit}>
        <Text variant="label" style={[styles.center, styles.link]}>
          {t('verify.edit')}
        </Text>
      </Pressable>

      <View style={styles.fill} />
      <View style={styles.footer}>
        <Feather name="lock" size={20} color={colors.ink} />
        <Text variant="caption" style={styles.fill}>
          {t('verify.warning')}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  top: { paddingTop: 12 },
  title: { marginTop: 24 },
  subtitle: { marginTop: 12, marginBottom: 32 },
  message: { marginTop: 12 },
  submit: { marginTop: 28 },
  center: { textAlign: 'center' },
  link: { textDecorationLine: 'underline', fontSize: 14 },
  linkHit: { minHeight: 44, justifyContent: 'center', marginTop: 4 },
  footer: { flexDirection: 'row', gap: 8, paddingBottom: 16 },
});
