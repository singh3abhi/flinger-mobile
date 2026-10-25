import { useRef, type ComponentRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors, fonts, radius } from '@/core/theme/tokens';
import { HardShadow } from './hard-shadow';
import { Text } from './text';

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  /** Called once all digits are entered. */
  onComplete?: (value: string) => void;
  hasError?: boolean;
  autoFocus?: boolean;
}

/**
 * Six boxes backed by one hidden input, so paste and the iOS/Android one-time-code autofill work.
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  onComplete,
  hasError = false,
  autoFocus = true,
}: OtpInputProps) {
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const digits = value.split('');
  const active = Math.min(value.length, length - 1);

  return (
    <Pressable
      accessibilityLabel={`${length}-digit code`}
      onPress={() => input.current?.focus()}
      style={styles.row}
    >
      {Array.from({ length }, (_, index) => {
        const filled = index < value.length;
        const isActive = index === active && value.length < length;
        const cell = (
          <View
            style={[
              styles.cell,
              hasError && styles.cellError,
              isActive && styles.cellActive,
            ]}
          >
            <Text variant="headline" style={styles.digit}>
              {filled ? digits[index] : ''}
            </Text>
          </View>
        );
        return (
          <View key={index} style={styles.slot}>
            {isActive ? <HardShadow>{cell}</HardShadow> : cell}
          </View>
        );
      })}
      <TextInput
        ref={input}
        testID="otp-hidden-input"
        value={value}
        onChangeText={(text) => {
          const next = text.replace(/\D/g, '').slice(0, length);
          onChange(next);
          if (next.length === length) onComplete?.(next);
        }}
        autoFocus={autoFocus}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        caretHidden
        style={styles.hidden}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  slot: { flex: 1 },
  cell: {
    height: 60,
    borderRadius: radius.control,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellActive: { borderWidth: 2 },
  cellError: { borderColor: colors.danger },
  digit: { fontFamily: fonts.bold, fontSize: 26 },
  hidden: { position: 'absolute', opacity: 0, width: 1, height: 1 },
});
