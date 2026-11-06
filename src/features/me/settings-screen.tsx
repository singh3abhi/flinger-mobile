import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, ScrollView, StyleSheet } from 'react-native';
import { queryKeys } from '@/core/api/query-keys';
import { errorMessage } from '@/core/i18n';
import { colors } from '@/core/theme/tokens';
import { fetchMe, signOut } from '@/features/auth';
import { unregisterPush } from '@/features/notifications';
import { ListRow, ListSection } from '@/shared/ui/list-row';
import { PageHeader } from '@/shared/ui/page-header';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import {
  logoutAllDevices,
  pauseAccount,
  requestExport,
  unpauseAccount,
  useBlocked,
  usePreferences,
  useSettings,
  useUpdatePreferences,
  useUpdateSettings,
} from './api';

export function SettingsScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const me = useQuery({ queryKey: queryKeys.me, queryFn: fetchMe }).data;
  const settings = useSettings().data;
  const prefs = usePreferences().data;
  const blocked = useBlocked().data;
  const updateSettings = useUpdateSettings();
  const updatePrefs = useUpdatePreferences();

  const paused = me?.status === 'paused';
  const pause = useMutation({
    mutationFn: () => (paused ? unpauseAccount() : pauseAccount()),
    onSuccess: () => queryClient.invalidateQueries(),
    onError: (e) => Alert.alert(errorMessage(e)),
  });

  const logout = useMutation({
    mutationFn: async (everywhere: boolean) => {
      await unregisterPush();
      if (everywhere) await logoutAllDevices().catch(() => undefined);
      await signOut().catch(() => undefined);
    },
  });

  const exportData = useMutation({
    mutationFn: requestExport,
    onSuccess: (file) => {
      Alert.alert(t('settings.exportReadyTitle'), t('settings.exportReadyBody'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('settings.exportOpen'), onPress: () => file.url && void Linking.openURL(file.url) },
      ]);
    },
    onError: (e) => Alert.alert(errorMessage(e)),
  });

  const confirmLogoutAll = () =>
    Alert.alert(t('settings.logoutAllTitle'), t('settings.logoutAllBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.logoutAll'), style: 'destructive', onPress: () => logout.mutate(true) },
    ]);

  const version = Constants.expoConfig?.version ?? '';

  return (
    <Screen padded={false}>
      <PageHeader title={t('settings.title')} />
      <ScrollView contentContainerStyle={styles.content}>
        <ListSection title={t('settings.account')} />
        <ListRow label={t('settings.email')} value={me?.email ?? ''} />
        <ListRow label={t('settings.phone')} value={t('settings.phoneSoon')} />

        <ListSection title={t('settings.notifications')} />
        <ListRow
          label={t('settings.newMatches')}
          toggle={{
            value: settings?.notifyNewMatches ?? true,
            onChange: (v) => updateSettings.mutate({ notifyNewMatches: v }),
          }}
        />
        <ListRow
          label={t('settings.newMessages')}
          toggle={{
            value: settings?.notifyNewMessages ?? true,
            onChange: (v) => updateSettings.mutate({ notifyNewMessages: v }),
          }}
        />

        <ListSection title={t('settings.privacy')} />
        <ListRow
          testID="read-receipts"
          label={t('settings.readReceipts')}
          hint={t('settings.readReceiptsHint')}
          toggle={{
            value: settings?.readReceipts ?? false,
            onChange: (v) => updateSettings.mutate({ readReceipts: v }),
          }}
        />
        <ListRow
          label={t('settings.showDistance')}
          toggle={{
            value: prefs?.showDistance ?? true,
            onChange: (v) => updatePrefs.mutate({ showDistance: v }),
          }}
        />
        <ListRow
          label={t('settings.blocked')}
          value={blocked ? String(blocked.length) : ''}
          onPress={() => router.push('/blocked' as Href)}
        />

        <ListSection title={t('settings.status')} />
        <ListRow
          testID="pause-account"
          label={t('settings.pause')}
          hint={t('settings.pauseHint')}
          toggle={{ value: paused, onChange: () => pause.mutate() }}
        />

        <ListSection title={t('settings.yourData')} />
        <ListRow
          icon="download"
          label={t('settings.export')}
          hint={exportData.isPending ? t('settings.exporting') : undefined}
          onPress={() => exportData.mutate()}
        />

        <ListSection title={t('settings.about')} />
        <ListRow label={t('settings.legal')} onPress={() => Alert.alert(t('onboarding.agree.docSoon'))} />

        <ListRow icon="log-out" label={t('settings.logout')} onPress={() => logout.mutate(false)} />
        <ListRow icon="smartphone" label={t('settings.logoutAll')} onPress={confirmLogoutAll} />
        <ListRow
          testID="delete-account"
          icon="trash-2"
          label={t('settings.delete')}
          danger
          onPress={() => router.push('/delete-account' as Href)}
        />
        <Text variant="small" color="muted" style={styles.version}>
          {t('settings.version', { version })}
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 40, backgroundColor: colors.page },
  version: { textAlign: 'center', marginTop: 24 },
});
