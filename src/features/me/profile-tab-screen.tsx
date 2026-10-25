import { useMutation } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius } from '@/core/theme/tokens';
import { signOut } from '@/features/auth';
import { unregisterPush } from '@/features/notifications';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { useMyProfileSummary } from './api';

/** Profile tab (first version): who I am, and sign out. Edit profile and settings come next. */
export function ProfileTabScreen() {
  const { t } = useTranslation();
  const profile = useMyProfileSummary();
  const logout = useMutation({
    mutationFn: async () => {
      await unregisterPush();
      await signOut();
    },
  });
  const me = profile.data;
  const photo = me?.photos[0]?.url;

  return (
    <SafeAreaView style={styles.fill} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="title" accessibilityRole="header">
          {t('me.title')}
        </Text>
        {me ? (
          <View style={styles.card}>
            {photo ? <Image source={{ uri: photo }} style={styles.avatar} contentFit="cover" /> : null}
            <View style={styles.flex}>
              <Text variant="headline">
                {t('discover.nameAge', { name: me.displayName ?? '', age: me.age ?? '' })}
              </Text>
              {me.location?.city ? (
                <Text variant="body" color="text3">
                  {me.location.city}
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}
        <Text variant="caption" color="text3" style={styles.note}>
          {t('me.soon')}
        </Text>
      </ScrollView>
      <Button
        testID="sign-out"
        variant="dark"
        label={t('common.signOut')}
        onPress={() => logout.mutate()}
        loading={logout.isPending}
        style={styles.signOut}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.page },
  flex: { flex: 1 },
  content: { padding: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
  },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  note: { marginTop: 20 },
  signOut: { marginHorizontal: 20, marginBottom: 16 },
});
