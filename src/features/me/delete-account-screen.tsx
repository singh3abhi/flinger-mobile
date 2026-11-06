import { Feather } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { errorMessage } from '@/core/i18n';
import { colors, fonts, radius } from '@/core/theme/tokens';
import { signOut } from '@/features/auth';
import { Button } from '@/shared/ui/button';
import { PageHeader } from '@/shared/ui/page-header';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { deleteAccount, pauseAccount } from './api';

const CONFIRM_WORD = 'DELETE';

export function DeleteAccountScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [typed, setTyped] = useState('');

  const remove = useMutation({
    mutationFn: async () => {
      await deleteAccount();
      // The server already ended every session; this clears this phone.
      await signOut().catch(() => undefined);
    },
  });
  const pause = useMutation({
    mutationFn: pauseAccount,
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      router.back();
    },
  });

  const point = (icon: 'eye-off' | 'message-circle' | 'clock', title: string, body: string) => (
    <View style={styles.point}>
      <Feather name={icon} size={22} color={colors.ink} />
      <View style={styles.flex}>
        <Text variant="label">{title}</Text>
        <Text variant="caption" color="text2">
          {body}
        </Text>
      </View>
    </View>
  );

  return (
    <Screen padded={false}>
      <PageHeader title={t('deleteAccount.header')} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text variant="title" accessibilityRole="header">
          {t('deleteAccount.title')}
        </Text>
        <Text variant="body" color="text2" style={styles.sub}>
          {t('deleteAccount.subtitle')}
        </Text>
        {point('eye-off', t('deleteAccount.hiddenTitle'), t('deleteAccount.hiddenBody'))}
        {point('message-circle', t('deleteAccount.chatsTitle'), t('deleteAccount.chatsBody'))}
        {point('clock', t('deleteAccount.eraseTitle'), t('deleteAccount.eraseBody'))}

        <Text variant="label" style={styles.label}>
          {t('deleteAccount.typeToConfirm', { word: CONFIRM_WORD })}
        </Text>
        <TextInput
          testID="delete-confirm"
          accessibilityLabel={t('deleteAccount.typeToConfirm', { word: CONFIRM_WORD })}
          value={typed}
          onChangeText={setTyped}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder={CONFIRM_WORD}
          placeholderTextColor={colors.muted}
          style={styles.input}
        />

        <View style={styles.breakCard}>
          <Text variant="label">{t('deleteAccount.breakTitle')}</Text>
          <Text variant="caption" color="text2">
            {t('deleteAccount.breakBody')}
          </Text>
          <Button
            variant="outline"
            label={t('deleteAccount.pauseInstead')}
            loading={pause.isPending}
            onPress={() => pause.mutate()}
            style={styles.breakButton}
          />
        </View>
        {remove.isError || pause.isError ? (
          <Text variant="caption" color="danger">
            {errorMessage(remove.error ?? pause.error)}
          </Text>
        ) : null}
      </ScrollView>
      <View style={styles.footer}>
        <Button
          testID="delete-account-confirm"
          variant="dark"
          label={t('deleteAccount.confirm')}
          disabled={typed.trim().toUpperCase() !== CONFIRM_WORD}
          loading={remove.isPending}
          onPress={() => remove.mutate()}
        />
        <Button variant="outline" label={t('deleteAccount.keep')} onPress={() => router.back()} style={styles.keep} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20 },
  sub: { marginTop: 8, marginBottom: 12 },
  point: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', marginTop: 14 },
  label: { marginTop: 24, marginBottom: 8 },
  input: {
    height: 54,
    borderRadius: radius.control,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    fontFamily: fonts.bold,
    fontSize: 16,
    letterSpacing: 2,
    color: colors.ink,
  },
  breakCard: { marginTop: 24, padding: 16, gap: 6, borderRadius: radius.card, backgroundColor: colors.surface },
  breakButton: { marginTop: 8 },
  footer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
  keep: { marginTop: 10 },
});
