import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius } from '@/core/theme/tokens';
import { Button } from '@/shared/ui/button';
import { ListRow } from '@/shared/ui/list-row';
import { Text } from '@/shared/ui/text';
import { useMyProfileSummary } from './api';
import { completeness, nextNudge } from './completeness';

/** Profile tab: my card, how complete it is, and the way into editing, preferences and settings. */
export function ProfileTabScreen() {
  const { t } = useTranslation();
  const me = useMyProfileSummary().data;
  const photo = me?.photos[0]?.url;
  const percent = me ? completeness(me) : 0;
  const nudge = me ? nextNudge(me) : null;

  return (
    <SafeAreaView style={styles.fill} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.head}>
          <Text variant="title" accessibilityRole="header">
            {t('me.title')}
          </Text>
          {me ? (
            <View style={styles.pill}>
              <Text variant="small" color="accentTintInk">
                {t('me.complete', { percent })}
              </Text>
            </View>
          ) : null}
        </View>

        {me ? (
          <View style={styles.card}>
            {photo ? <Image source={{ uri: photo }} style={styles.avatar} contentFit="cover" /> : null}
            <Text variant="heading" style={styles.center}>
              {t('discover.nameAge', { name: me.displayName ?? '', age: me.age ?? '' })}
            </Text>
            {me.location?.city ? (
              <View style={styles.city}>
                <Feather name="map-pin" size={14} color={colors.text3} />
                <Text variant="body" color="text3">
                  {me.location.city}
                </Text>
              </View>
            ) : null}
            <Button
              testID="edit-profile"
              label={t('me.edit')}
              onPress={() => router.push('/edit-profile' as Href)}
              style={styles.editButton}
            />
          </View>
        ) : null}

        {nudge ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/edit-profile' as Href)}
            style={styles.nudge}
          >
            <Feather name="zap" size={20} color={colors.accentInk} />
            <View style={styles.flex}>
              <Text variant="label">{t(`me.nudge.${nudge}.title`)}</Text>
              <Text variant="caption" color="text2">
                {t(`me.nudge.${nudge}.body`)}
              </Text>
            </View>
          </Pressable>
        ) : null}

        <View style={styles.rows}>
          <ListRow
            icon="sliders"
            label={t('me.preferences')}
            onPress={() => router.push('/preferences' as Href)}
          />
          <ListRow icon="settings" label={t('me.settings')} onPress={() => router.push('/settings' as Href)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.page },
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  content: { padding: 20 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 14,
    justifyContent: 'center',
    backgroundColor: colors.accentTint,
  },
  card: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
  },
  avatar: { width: 112, height: 112, borderRadius: 56, marginBottom: 14 },
  city: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  editButton: { alignSelf: 'stretch', marginTop: 18 },
  nudge: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 16,
    padding: 16,
    borderRadius: radius.card,
    backgroundColor: colors.accentTint,
  },
  rows: { marginTop: 12 },
});
