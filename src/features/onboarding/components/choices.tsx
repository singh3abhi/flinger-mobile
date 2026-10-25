import { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius } from '@/core/theme/tokens';
import { Text } from '@/shared/ui/text';

/** A full-width answer row (gender, who to meet). Selected rows invert to ink with a check. */
export function ChoiceTile({
  label,
  selected,
  onPress,
  icon,
  multi = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: (color: string) => ReactNode;
  multi?: boolean;
}) {
  const fg = selected ? colors.white : colors.ink;
  return (
    <Pressable
      accessibilityRole={multi ? 'checkbox' : 'radio'}
      accessibilityState={multi ? { checked: selected } : { selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.tile, selected && styles.tileSelected]}
    >
      {icon ? icon(fg) : null}
      <Text variant="label" style={[styles.tileText, { color: fg }]}>
        {label}
      </Text>
      {selected ? (
        <View style={styles.check}>
          <Feather name="check" size={16} color={colors.ink} />
        </View>
      ) : null}
    </Pressable>
  );
}

/** A pill answer (values, causes, religion). */
export function Chip({
  label,
  selected,
  onPress,
  multi = true,
  disabled = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  multi?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole={multi ? 'checkbox' : 'radio'}
      accessibilityState={multi ? { checked: selected, disabled } : { selected, disabled }}
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      style={[styles.chip, selected && styles.chipSelected, disabled && styles.dim]}
    >
      <Text variant="small" style={[styles.chipText, { color: selected ? colors.white : colors.ink }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ChipGroup({ children }: { children: ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

/** Bold question label above a group of answers. */
export function Question({ children }: { children: string }) {
  return (
    <Text variant="label" style={styles.question}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 60,
    paddingHorizontal: 16,
    borderRadius: radius.control,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    marginBottom: 12,
  },
  tileSelected: {
    backgroundColor: colors.ink,
    shadowColor: colors.ink,
    shadowOpacity: 0.35,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  tileText: { flex: 1 },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  group: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, rowGap: 12 },
  chip: {
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.white,
  },
  chipSelected: {
    backgroundColor: colors.ink,
    shadowColor: colors.ink,
    shadowOpacity: 0.35,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  chipText: { fontSize: 14 },
  dim: { opacity: 0.45 },
  question: { fontSize: 17, marginBottom: 14 },
});
