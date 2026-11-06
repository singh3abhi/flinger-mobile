import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { colors, radius } from '@/core/theme/tokens';
import { PageHeader } from '@/shared/ui/page-header';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { meKeys, unblock, useBlocked } from './api';

export function BlockedScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const blocked = useBlocked();
  const undo = useMutation({
    mutationFn: unblock,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: meKeys.blocks }),
  });

  return (
    <Screen padded={false}>
      <PageHeader title={t('blocked.title')} />
      {blocked.isPending ? (
        <ActivityIndicator color={colors.ink} style={styles.loading} />
      ) : (
        <FlatList
          data={blocked.data ?? []}
          keyExtractor={(b) => b.userId}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text variant="body" color="text3">
              {t('blocked.empty')}
            </Text>
          }
          ListFooterComponent={
            <Text variant="caption" color="text3" style={styles.note}>
              {t('blocked.note')}
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text variant="label" style={styles.flex}>
                {item.displayName}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('blocked.unblockA11y', { name: item.displayName })}
                onPress={() => undo.mutate(item.userId)}
                style={styles.button}
              >
                <Text variant="small">{t('blocked.unblock')}</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loading: { marginTop: 40 },
  list: { padding: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  button: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.control,
    borderWidth: 1.5,
    borderColor: colors.ink,
    justifyContent: 'center',
  },
  note: { marginTop: 16 },
});
