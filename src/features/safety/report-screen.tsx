import { Feather } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { errorMessage } from '@/core/i18n';
import { colors, fonts, radius } from '@/core/theme/tokens';
import { Button } from '@/shared/ui/button';
import { RoundButton } from '@/shared/ui/round-button';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { report, REPORT_REASONS, type ReportInput, type ReportReason } from './api';
import { useForgetPerson } from './safety-sheet';

/** Report a person (or one photo, prompt or message), optionally blocking them too. */
export function ReportScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ userId: string; name: string; targetType?: string; targetId?: string }>();
  const forget = useForgetPerson();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [alsoBlock, setAlsoBlock] = useState(true);

  const submit = useMutation({
    mutationFn: () =>
      report({
        reportedId: params.userId,
        targetType: (params.targetType ?? 'user') as ReportInput['targetType'],
        targetId: params.targetId,
        reason: reason as ReportReason,
        details: details.trim() || undefined,
        alsoBlock,
      }),
    onSuccess: async () => {
      if (alsoBlock) await forget(params.userId);
      Alert.alert(t('safety.reportedTitle'), t('safety.reportedBody'));
      // Blocked: the screens behind (chat, profile) no longer apply.
      if (alsoBlock) router.dismissAll();
      else router.back();
    },
  });

  return (
    <Screen>
      <View style={styles.top}>
        <RoundButton
          label={t('common.close')}
          size={36}
          icon={<Feather name="x" size={20} color={colors.ink} />}
          onPress={() => router.back()}
        />
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text variant="title" accessibilityRole="header">
          {t('safety.reportTitle', { name: params.name })}
        </Text>
        <Text variant="body" color="text2" style={styles.sub}>
          {t('safety.reportSubtitle')}
        </Text>
        <View accessibilityRole="radiogroup" style={styles.reasons}>
          {REPORT_REASONS.map((r) => {
            const selected = reason === r;
            return (
              <Pressable
                key={r}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setReason(r)}
                style={[styles.reason, selected && styles.reasonOn]}
              >
                <Text variant="label" color={selected ? 'white' : 'ink'} style={styles.flex}>
                  {t(`safety.reasons.${r}`)}
                </Text>
                {selected ? <Feather name="check" size={18} color={colors.white} /> : null}
              </Pressable>
            );
          })}
        </View>
        <Text variant="label" style={styles.label}>
          {t('safety.details')}
        </Text>
        <TextInput
          accessibilityLabel={t('safety.details')}
          value={details}
          onChangeText={setDetails}
          maxLength={1000}
          multiline
          placeholder={t('safety.detailsPlaceholder')}
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: alsoBlock }}
          onPress={() => setAlsoBlock((v) => !v)}
          style={styles.check}
        >
          <View style={[styles.box, alsoBlock && styles.boxOn]}>
            {alsoBlock ? <Feather name="check" size={16} color={colors.white} /> : null}
          </View>
          <Text variant="body">{t('safety.alsoBlock', { name: params.name })}</Text>
        </Pressable>
        {submit.isError ? (
          <Text variant="caption" color="danger" style={styles.label}>
            {errorMessage(submit.error)}
          </Text>
        ) : null}
      </ScrollView>
      <Button
        testID="report-submit"
        label={t('safety.submit')}
        disabled={!reason}
        loading={submit.isPending}
        onPress={() => submit.mutate()}
        style={styles.submit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { paddingTop: 12 },
  content: { paddingTop: 20, paddingBottom: 24 },
  sub: { marginTop: 10 },
  reasons: { marginTop: 20, gap: 10 },
  reason: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
    paddingHorizontal: 16,
    borderRadius: radius.control,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.white,
  },
  reasonOn: { backgroundColor: colors.ink },
  label: { marginTop: 20, marginBottom: 8 },
  input: {
    minHeight: 96,
    borderRadius: radius.control,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    padding: 14,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  check: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18 },
  box: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  boxOn: { backgroundColor: colors.ink },
  submit: { marginBottom: 16 },
});
