import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { colors } from '@/core/theme/tokens';
import { Text } from './text';

/** Settings-style row: label (and hint) with a value and chevron, or a switch. */
export function ListRow({
  label,
  hint,
  value,
  onPress,
  toggle,
  icon,
  danger = false,
  testID,
}: {
  label: string;
  hint?: string;
  value?: string;
  onPress?: () => void;
  toggle?: { value: boolean; onChange: (next: boolean) => void };
  icon?: ComponentProps<typeof Feather>['name'];
  danger?: boolean;
  testID?: string;
}) {
  const content = (
    <>
      {icon ? <Feather name={icon} size={20} color={danger ? colors.danger : colors.ink} /> : null}
      <View style={styles.text}>
        <Text variant="label" color={danger ? 'danger' : 'ink'} style={styles.label}>
          {label}
        </Text>
        {hint ? (
          <Text variant="caption" color="text3">
            {hint}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text variant="body" color="text3" numberOfLines={1} style={styles.value}>
          {value}
        </Text>
      ) : null}
      {toggle ? (
        <Switch
          testID={testID}
          accessibilityLabel={label}
          value={toggle.value}
          onValueChange={toggle.onChange}
          trackColor={{ true: colors.accent, false: colors.control }}
          thumbColor={colors.white}
        />
      ) : onPress ? (
        <Feather name="chevron-right" size={20} color={colors.muted} />
      ) : null}
    </>
  );
  return onPress && !toggle ? (
    <Pressable testID={testID} accessibilityRole="button" onPress={onPress} style={styles.row}>
      {content}
    </Pressable>
  ) : (
    <View style={styles.row}>{content}</View>
  );
}

/** Small uppercase heading above a group of rows. */
export function ListSection({ title }: { title: string }) {
  return (
    <Text variant="small" color="text3" style={styles.section}>
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 56,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  text: { flex: 1, gap: 2 },
  label: { fontSize: 15 },
  value: { maxWidth: '50%' },
  section: { marginTop: 24, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
});
