import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, HIT, radius } from '@/core/theme/tokens';
import { Text } from './text';

/** outlineLight: white outline and text, for use on photos and dark backgrounds. */
export type ButtonVariant = 'accent' | 'dark' | 'outline' | 'outlineLight';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

/** Primary actions. Accent buttons always carry ink text (4.7:1); white on accent is not used. */
export function Button({
  label,
  onPress,
  variant = 'accent',
  loading = false,
  disabled = false,
  style,
  testID,
}: ButtonProps) {
  const inactive = disabled || loading;
  const textColor = variant === 'dark' || variant === 'outlineLight' ? 'white' : 'ink';
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        inactive && styles.inactive,
        pressed && !inactive && styles.pressed,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            color={variant === 'dark' || variant === 'outlineLight' ? colors.white : colors.ink}
          />
        ) : (
          <Text variant="label" color={textColor}>
            {label}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: radius.control,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  content: { minHeight: HIT, alignItems: 'center', justifyContent: 'center' },
  accent: {
    backgroundColor: colors.accent,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  dark: { backgroundColor: colors.ink },
  outline: { borderWidth: 1.5, borderColor: colors.ink, backgroundColor: 'transparent' },
  outlineLight: { borderWidth: 1.5, borderColor: colors.white, backgroundColor: 'transparent' },
  inactive: { opacity: 0.5 },
  pressed: { transform: [{ translateY: 1 }], opacity: 0.9 },
});
