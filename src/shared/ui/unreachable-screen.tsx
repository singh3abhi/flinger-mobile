import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Button } from './button';
import { Screen } from './screen';
import { Text } from './text';

/** Shown when a saved session exists but the server could not be reached at launch. */
export function UnreachableScreen({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <Screen>
      <View style={styles.center}>
        <Text variant="heading" accessibilityRole="header" style={styles.text}>
          {t('unreachable.title')}
        </Text>
        <Text variant="bodyLg" color="text2" style={[styles.text, styles.body]}>
          {t('unreachable.body')}
        </Text>
        <Button label={t('common.retry')} onPress={onRetry} variant="dark" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  text: { textAlign: 'center' },
  body: { marginTop: 12, marginBottom: 28 },
});
