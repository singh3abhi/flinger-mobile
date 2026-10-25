import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, radius as radii } from '@/core/theme/tokens';

/**
 * The Flinger "hard shadow": a solid ink block offset 4 pt below the control.
 * Drawn as a real view (not shadow props) so it looks identical on iOS and Android.
 */
export function HardShadow({
  children,
  radius = radii.control,
  offset = 4,
  style,
}: {
  children: ReactNode;
  radius?: number;
  offset?: number;
  style?: ViewStyle;
}) {
  return (
    <View style={[{ paddingBottom: offset }, style]}>
      <View
        pointerEvents="none"
        style={[styles.shadow, { borderRadius: radius, top: offset }]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.ink,
  },
});
