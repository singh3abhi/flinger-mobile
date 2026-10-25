import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '@/core/theme/tokens';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { enablePush } from './push';

const bell = require('../../../assets/images/bell.png');

/** Asked once, right after a first match (when it obviously matters), never at launch. */
export function NotificationsPrimerScreen() {
  const { t } = useTranslation();
  const { next, name } = useLocalSearchParams<{ next?: string; name?: string }>();
  const go = () => (next ? router.replace(next as Href) : router.back());

  return (
    <Screen background="cream">
      <View style={styles.body}>
        {name ? (
          <View style={styles.tag}>
            <Feather name="heart" size={14} color={colors.accentInk} />
            <Text variant="small">{t('primer.matched', { name })}</Text>
          </View>
        ) : null}
        <Image source={bell} style={styles.art} contentFit="contain" />
        <Text variant="title" accessibilityRole="header" style={styles.title}>
          {t('primer.title')}
        </Text>
        <Text variant="bodyLg" style={styles.text}>
          {t('primer.body')}
        </Text>
      </View>
      <Button
        testID="primer-enable"
        label={t('primer.enable')}
        onPress={() => void enablePush().finally(go)}
      />
      <Pressable accessibilityRole="button" onPress={go} style={styles.later}>
        <Text variant="label" style={styles.underline}>
          {t('primer.later')}
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingTop: 80 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: colors.white,
  },
  art: { width: 128, height: 128, marginTop: 28 },
  title: { marginTop: 28 },
  text: { marginTop: 14 },
  later: { alignItems: 'center', paddingVertical: 16, marginBottom: 8 },
  underline: { textDecorationLine: 'underline' },
});
