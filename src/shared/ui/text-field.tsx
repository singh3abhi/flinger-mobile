import { forwardRef, type ComponentRef } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { colors, fonts, radius } from '@/core/theme/tokens';
import { HardShadow } from './hard-shadow';
import { Text } from './text';

export interface TextFieldProps extends TextInputProps {
  label: string;
  /** Shown under the field, announced to screen readers. */
  error?: string;
  hint?: string;
}

export const TextField = forwardRef<ComponentRef<typeof TextInput>, TextFieldProps>(function TextField(
  { label, error, hint, style, ...rest },
  ref,
) {
  return (
    <View>
      <Text variant="small" style={styles.label}>
        {label}
      </Text>
      <HardShadow>
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors.muted}
          style={[styles.input, error ? styles.inputError : null, style]}
          {...rest}
        />
      </HardShadow>
      {error ? (
        <Text variant="caption" color="danger" accessibilityLiveRegion="polite" style={styles.below}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color="text3" style={styles.below}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  label: { marginBottom: 8, fontSize: 13 },
  input: {
    height: 54,
    borderRadius: radius.control,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.ink,
  },
  inputError: { borderColor: colors.danger },
  below: { marginTop: 8 },
});
