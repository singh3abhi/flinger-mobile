import { useInfiniteQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { errorMessage } from '@/core/i18n';
import { colors, fonts } from '@/core/theme/tokens';
import { Button } from '@/shared/ui/button';
import { usePullToRefresh } from '@/shared/hooks/use-pull-to-refresh';
import { Text } from '@/shared/ui/text';
import { fetchConversations, type Conversation } from '../api';
import { chatKeys } from '../cache';
import { listTime } from '../time';

export function threadHref(c: Pick<Conversation, 'id' | 'member'>): Href {
  const q = new URLSearchParams({
    name: c.member.displayName,
    photoUrl: c.member.photoUrl,
    memberId: c.member.userId,
  });
  return `/chat/${c.id}?${q.toString()}` as Href;
}

export function useConversations() {
  return useInfiniteQuery({
    queryKey: chatKeys.conversations,
    queryFn: ({ pageParam }) => fetchConversations(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

/** Chats tab: new matches (no messages yet) as a rail, then conversations by last activity. */
export function ChatsScreen() {
  const { t } = useTranslation();
  const query = useConversations();
  const all = query.data?.pages.flatMap((p) => p.items) ?? [];
  const pull = usePullToRefresh(() => query.refetch());
  const fresh = all.filter((c) => !c.lastMessage);
  const talking = all.filter((c) => c.lastMessage);

  const header = (
    <View>
      {fresh.length > 0 ? (
        <>
          <Text variant="small" color="text3" style={styles.section}>
            {t('chats.newMatches')}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
            {fresh.map((c) => (
              <Pressable
                key={c.id}
                accessibilityRole="button"
                accessibilityLabel={t('chats.openWith', { name: c.member.displayName })}
                onPress={() => router.push(threadHref(c))}
                style={styles.railItem}
              >
                <View style={styles.ring}>
                  <Image source={{ uri: c.member.photoUrl }} style={styles.railAvatar} contentFit="cover" />
                </View>
                <Text variant="small" numberOfLines={1} style={styles.railName}>
                  {c.member.displayName}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </>
      ) : null}
      {talking.length > 0 ? (
        <Text variant="small" color="text3" style={styles.section}>
          {t('chats.messages')}
        </Text>
      ) : null}
    </View>
  );

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
        <View style={styles.pad}>
          <Text variant="body">{errorMessage(query.error)}</Text>
          <Button variant="dark" label={t('common.retry')} onPress={() => query.refetch()} style={styles.retry} />
        </View>
      ) : all.length === 0 ? (
        <Text variant="body" color="text3" style={styles.pad}>
          {t('chats.empty')}
        </Text>
      ) : (
        <FlatList
          data={talking}
          keyExtractor={(c) => c.id}
          ListHeaderComponent={header}
          onRefresh={pull.onRefresh}
          refreshing={pull.refreshing}
          onEndReached={() => query.hasNextPage && query.fetchNextPage()}
          renderItem={({ item }) => {
            const unread = item.unreadCount > 0;
            const last = item.lastMessage;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('chats.openWith', { name: item.member.displayName })}
                onPress={() => router.push(threadHref(item))}
                style={styles.row}
              >
                <Image source={{ uri: item.member.photoUrl }} style={styles.avatar} contentFit="cover" />
                <View style={styles.main}>
                  <View style={styles.nameRow}>
                    <Text variant="label" numberOfLines={1} style={styles.flex}>
                      {item.member.displayName}
                    </Text>
                    {last ? (
                      <Text variant="small" color="muted">
                        {listTime(last.createdAt)}
                      </Text>
                    ) : null}
                  </View>
                  <Text
                    variant="body"
                    color={unread ? 'ink' : 'text3'}
                    numberOfLines={1}
                    style={unread ? styles.unreadText : undefined}
                  >
                    {last ? (last.fromMe ? t('chats.you', { body: last.body }) : last.body) : ''}
                  </Text>
                </View>
                {unread ? (
                  <View style={styles.dot} accessibilityLabel={t('chats.unread', { count: item.unreadCount })}>
                    <Text variant="small" style={styles.dotText}>
                      {item.unreadCount > 9 ? '9+' : item.unreadCount}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            );
          }}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.page },
  flex: { flex: 1 },
  head: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 6 },
  loading: { marginTop: 40 },
  pad: { padding: 20 },
  retry: { marginTop: 16 },
  section: {
    marginTop: 16,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 13,
  },
  rail: { gap: 16 },
  railItem: { width: 68, alignItems: 'center' },
  ring: { padding: 2, borderRadius: 36, borderWidth: 3, borderColor: colors.accent },
  railAvatar: { width: 60, height: 60, borderRadius: 30 },
  railName: { marginTop: 6 },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  main: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  unreadText: { fontFamily: fonts.bold },
  dot: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotText: { fontSize: 12 },
});
