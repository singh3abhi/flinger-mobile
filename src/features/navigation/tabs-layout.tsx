import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import type { ColorValue } from 'react-native';
import { colors, fonts } from '@/core/theme/tokens';
import { useConversations } from '@/features/chat';
import { useLikesReceived } from '@/features/likes';

type IconName = 'compass' | 'heart' | 'message-circle' | 'user';

const icon =
  (name: IconName) =>
  ({ color, size }: { color: ColorValue; size: number }) => (
    <Feather name={name} size={size} color={color as string} />
  );

/** The four tabs of the main app (Discover and People merged, as in the design). */
export function TabsLayout() {
  const { t } = useTranslation();
  const likes = useLikesReceived();
  const firstPage = likes.data?.pages[0];
  const likeCount = firstPage?.items.length ?? 0;
  const badge = likeCount === 0 ? undefined : firstPage?.nextCursor ? '9+' : likeCount;
  const unreadChats = useConversations().data?.pages[0]?.unreadConversations ?? 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentInk,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.page, borderTopColor: colors.line },
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11 },
        tabBarBadgeStyle: { backgroundColor: colors.accent, color: colors.ink, fontFamily: fonts.extrabold },
      }}
    >
      <Tabs.Screen name="discover" options={{ title: t('tabs.discover'), tabBarIcon: icon('compass') }} />
      <Tabs.Screen
        name="liked-you"
        options={{ title: t('tabs.likedYou'), tabBarIcon: icon('heart'), tabBarBadge: badge }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: t('tabs.chats'),
          tabBarIcon: icon('message-circle'),
          tabBarBadge: unreadChats > 0 ? unreadChats : undefined,
        }}
      />
      <Tabs.Screen name="profile" options={{ title: t('tabs.profile'), tabBarIcon: icon('user') }} />
    </Tabs>
  );
}
