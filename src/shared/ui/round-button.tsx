import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { colors } from '@/core/theme/tokens';

/** Round icon-only button (back arrow, next arrow). Always has an accessibility label. */
export function RoundButton({
  icon,
  onPress,
  label,
  size = 44,
  variant = 'white',
  disabled = false,
  testID,
}: {
  icon: ReactNode;
  onPress: () => void;
  label: string;
  size?: number;
  variant?: 'white' | 'accent';
  disabled?: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={size < 44 ? (44 - size) / 2 : 0}
      style={({ pressed }) => [
        styles.base,
        { width: size, height: size, borderRadius: size / 2 },
        { backgroundColor: variant === 'accent' ? colors.accent : colors.white },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  disabled: { opacity: 0.5 },
  pressed: { transform: [{ translateY: 1 }] },
});
