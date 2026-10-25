import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { errorMessage } from '@/core/i18n';
import { colors } from '@/core/theme/tokens';
import { Text } from '@/shared/ui/text';
import { useMatches } from './api';

/** Chats tab. Until messaging lands (F4) it lists matches, newest first. */
export function ChatsScreen() {
  const { t } = useTranslation();
  const query = useMatches();
  const items = query.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <SafeAreaView style={styles.fill} edges={['top']}>
      <View style={styles.head}>
        <Text variant="title" accessibilityRole="header">
          {t('chats.title')}
        </Text>
      </View>
      {query.isPending ? (
        <ActivityIndicator color={colors.ink} style={styles.loading} />
      ) : query.isError ? (
        <Text variant="body" style={styles.pad}>
          {errorMessage(query.error)}
        </Text>
      ) : items.length === 0 ? (
        <Text variant="body" color="text3" style={styles.pad}>
          {t('chats.empty')}
        </Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(m) => m.matchId}
          contentContainerStyle={styles.list}
          onRefresh={() => query.refetch()}
          refreshing={query.isRefetching}
          onEndReached={() => query.hasNextPage && query.fetchNextPage()}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Image source={{ uri: item.member.photoUrl }} style={styles.avatar} contentFit="cover" />
              <View style={styles.main}>
                <Text variant="label">{item.member.displayName}</Text>
                <Text variant="caption" color="text3">
                  {t('chats.newMatch')}
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.page },
  head: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  loading: { marginTop: 40 },
  pad: { padding: 20 },
  list: { paddingHorizontal: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  main: { flex: 1 },
});
