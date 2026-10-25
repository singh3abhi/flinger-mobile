import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/core/theme/tokens';

/** Page frame: safe areas, keyboard avoidance, background token, 20 pt side padding. */
export function Screen({
  children,
  background = 'page',
  padded = true,
  style,
}: {
  children: ReactNode;
  background?: 'page' | 'cream';
  padded?: boolean;
  style?: ViewStyle;
}) {
  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: colors[background] }]}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.fill, padded && styles.padded, style]}>{children}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  padded: { paddingHorizontal: 20 },
});
