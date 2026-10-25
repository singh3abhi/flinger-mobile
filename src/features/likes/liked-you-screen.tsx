import { Feather } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { queryKeys } from '@/core/api/query-keys';
import { errorMessage } from '@/core/i18n';
import { colors, radius } from '@/core/theme/tokens';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { fetchLikesReceived, type ReceivedLike } from './api';

export function useLikesReceived() {
  return useInfiniteQuery({
    queryKey: queryKeys.likesReceived,
    queryFn: ({ pageParam }) => fetchLikesReceived(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

const memberHref = (like: ReceivedLike) => `/member/${like.from.userId}` as Href;

/** "Liked You": everyone who liked me, on what, with their comment. Like back to match. */
export function LikedYouScreen() {
  const { t } = useTranslation();
  const query = useLikesReceived();
  const items = query.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <SafeAreaView style={styles.fill} edges={['top']}>
      <View style={styles.head}>
        <Text variant="title" accessibilityRole="header">
          {t('likedYou.title')}
        </Text>
        <Text variant="body" color="text3" style={styles.sub}>
          {items.length > 0 ? t('likedYou.subtitle', { count: items.length }) : t('likedYou.empty')}
        </Text>
      </View>
      {query.isPending ? (
        <ActivityIndicator color={colors.ink} style={styles.loading} />
      ) : query.isError ? (
        <View style={styles.pad}>
          <Text variant="body">{errorMessage(query.error)}</Text>
          <Button variant="dark" label={t('common.retry')} onPress={() => query.refetch()} style={styles.retry} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.likeId}
          contentContainerStyle={styles.list}
          onRefresh={() => query.refetch()}
          refreshing={query.isRefetching}
          onEndReached={() => query.hasNextPage && query.fetchNextPage()}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(memberHref(item))}
              style={styles.row}
            >
              <Image source={{ uri: item.from.photoUrl }} style={styles.thumb} contentFit="cover" />
              <View style={styles.main}>
                <Text variant="label" style={styles.name}>
                  {t('discover.nameAge', { name: item.from.displayName, age: item.from.age })}
                </Text>
                <View style={styles.kind}>
                  <Feather name="heart" size={13} color={colors.accentInk} />
                  <Text variant="caption" color="text3">
                    {item.item.type === 'photo' ? t('likedYou.likedPhoto') : t('likedYou.likedPrompt')}
                  </Text>
                </View>
                {item.comment ? (
                  <Text variant="caption" style={styles.comment}>
                    {item.comment}
                  </Text>
                ) : null}
              </View>
              <Feather name="chevron-right" size={20} color={colors.muted} />
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.page },
  head: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  sub: { marginTop: 6 },
  loading: { marginTop: 40 },
  pad: { padding: 20 },
  retry: { marginTop: 16 },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  thumb: { width: 68, height: 86, borderRadius: radius.thumb + 2 },
  main: { flex: 1, minWidth: 0 },
  name: { fontSize: 17 },
  kind: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  comment: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.thumb,
    backgroundColor: colors.surface,
  },
});
