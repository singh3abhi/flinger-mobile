import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '@/core/theme/tokens';
import { Text } from './text';

/** Back arrow, title and an optional action on the right. */
export function PageHeader({ title, right }: { title: string; right?: ReactNode }) {
  const { t } = useTranslation();
  return (
    <View style={styles.bar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        onPress={() => router.back()}
        style={styles.icon}
      >
        <Feather name="arrow-left" size={22} color={colors.ink} />
      </Pressable>
      <Text variant="headline" accessibilityRole="header" numberOfLines={1} style={styles.title}>
        {title}
      </Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  icon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 20 },
  right: { minWidth: 44, alignItems: 'flex-end', paddingRight: 12 },
});
