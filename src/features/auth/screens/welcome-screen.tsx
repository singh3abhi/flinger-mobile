import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/core/theme/tokens';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';

const poster = require('../../../../assets/images/onboarding-poster.jpg');
const logo = require('../../../../assets/images/logo.png');

export function WelcomeScreen() {
  const { t } = useTranslation();
  return (
    <View style={styles.fill}>
      <Image source={poster} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" />
      <View style={[StyleSheet.absoluteFill, styles.scrim]} />
      <SafeAreaView style={styles.content}>
        <View style={styles.brandRow}>
          <Image source={logo} style={styles.logo} contentFit="contain" accessibilityIgnoresInvertColors />
          <Text variant="display" style={styles.wordmark} accessibilityRole="header">
            Flinger
          </Text>
        </View>
        <Text variant="small" style={styles.tagline}>
          {t('landing.tagline')}
        </Text>
        <View style={styles.spacer} />
        <Text variant="title" style={styles.headline}>
          {t('landing.headline')}
        </Text>
        <Button testID="create-account" label={t('landing.create')} onPress={() => router.push('/email')} />
        <Button
          variant="outlineLight"
          label={t('landing.haveAccount')}
          onPress={() => router.push('/email')}
          style={styles.outline}
        />
        <Text variant="small" style={styles.legal}>
          {t('landing.legal')}
        </Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.ink },
  spacer: { flex: 1 },
  scrim: { backgroundColor: 'rgba(0,0,0,0.55)' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8 },
  brandRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 6 },
  logo: { width: 42, height: 45 },
  wordmark: { color: colors.cream, fontSize: 42, lineHeight: 44 },
  tagline: { color: colors.accentOnDark, textAlign: 'center', marginTop: 8, fontSize: 14 },
  headline: { color: colors.cream, textAlign: 'center', marginBottom: 28, fontSize: 36, lineHeight: 41 },
  outline: { marginTop: 12 },
  legal: { color: colors.white, textAlign: 'center', marginTop: 16, lineHeight: 18 },
});
