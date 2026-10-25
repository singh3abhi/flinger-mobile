import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/core/theme/tokens';
import { Button } from '@/shared/ui/button';
import { RoundButton } from '@/shared/ui/round-button';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { pushPermission } from '@/features/notifications';
import { useMyMainPhoto } from '../use-deck';

/** Open the conversation, asking for notifications first if we never have (it matters now). */
async function sayHello(matchId: string, name: string, photoUrl: string, memberId?: string) {
  const q = new URLSearchParams({ name, photoUrl, ...(memberId ? { memberId } : {}) });
  const thread = `/chat/${matchId}?${q.toString()}`;
  const permission = await pushPermission().catch(() => 'denied');
  if (permission === 'undetermined') {
    router.replace(`/notifications?${new URLSearchParams({ next: thread, name }).toString()}` as Href);
  } else {
    router.replace(thread as Href);
  }
}

/** "It's a match!" with both main photos. "Say hello" opens the conversation. */
export function MatchScreen() {
  const { t } = useTranslation();
  const { matchId, name, photoUrl, memberId } = useLocalSearchParams<{
    matchId: string;
    name: string;
    photoUrl: string;
    memberId?: string;
  }>();
  const myPhoto = useMyMainPhoto();

  return (
    <Screen background="cream">
      <View style={styles.top}>
        <RoundButton
          label={t('common.close')}
          size={36}
          icon={<Feather name="x" size={20} color={colors.ink} />}
          onPress={() => router.back()}
        />
      </View>
      <View style={styles.mid}>
        <View style={styles.pics}>
          {myPhoto ? <Image source={{ uri: myPhoto }} style={[styles.pic, styles.left]} contentFit="cover" /> : null}
          {photoUrl ? <Image source={{ uri: photoUrl }} style={[styles.pic, styles.right]} contentFit="cover" /> : null}
          <View style={styles.heart}>
            <Feather name="heart" size={24} color={colors.accentInk} />
          </View>
        </View>
        <Text variant="title" accessibilityRole="header" style={styles.center}>
          {t('match.title')}
        </Text>
        <Text variant="bodyLg" color="text2" style={[styles.center, styles.body]}>
          {t('match.body', { name })}
        </Text>
      </View>
      <Button
        testID="match-say-hello"
        label={t('match.sayHello')}
        onPress={() => void sayHello(matchId, name, photoUrl, memberId)}
      />
      <Button
        variant="outline"
        label={t('match.keepBrowsing')}
        onPress={() => router.back()}
        style={styles.second}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'flex-end', paddingTop: 12 },
  mid: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pics: { width: 300, height: 170, marginBottom: 34 },
  pic: {
    position: 'absolute',
    top: 0,
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: colors.white,
  },
  left: { left: 0 },
  right: { right: 0 },
  heart: {
    position: 'absolute',
    left: 125,
    top: 50,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { textAlign: 'center' },
  body: { marginTop: 12, paddingHorizontal: 12 },
  second: { marginTop: 12, marginBottom: 24 },
});
