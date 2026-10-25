import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { colors, typography, type TypographyVariant } from '@/core/theme/tokens';

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: keyof typeof colors;
}

/** Text that only speaks in design tokens. Respects the user's font size, capped for big titles. */
export function Text({ variant = 'body', color = 'ink', style, ...rest }: TextProps) {
  const large = variant === 'display' || variant === 'title' || variant === 'heading';
  return (
    <RNText
      maxFontSizeMultiplier={large ? 1.3 : 1.6}
      style={[typography[variant], { color: colors[color] }, style]}
      {...rest}
    />
  );
}
