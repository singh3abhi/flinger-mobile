import { useRef, useState, type ComponentRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { colors, radius } from '@/core/theme/tokens';
import { HardShadow } from '@/shared/ui/hard-shadow';
import { Text } from '@/shared/ui/text';
import { OnboardingFrame } from '../components/onboarding-frame';
import { feetAndInches, HEIGHT_CM } from '../options';
import { useStep } from '../use-step';

const ROW = 44;
const VISIBLE = 7; // odd, so one row sits in the middle band
const HEIGHTS = Array.from({ length: HEIGHT_CM.max - HEIGHT_CM.min + 1 }, (_, i) => HEIGHT_CM.min + i);

const clamp = (cm: number) => Math.min(HEIGHT_CM.max, Math.max(HEIGHT_CM.min, cm));

/** Scroll wheel in centimetres; VoiceOver/TalkBack adjust it with swipe up/down. */
export function HeightScreen() {
  const { t } = useTranslation();
  const { profile, saveAndContinue, saving, error } = useStep('height');
  const [cm, setCm] = useState(profile.heightCm ?? HEIGHT_CM.default);
  const list = useRef<ComponentRef<typeof ScrollView>>(null);

  const scrollTo = (value: number, animated: boolean) =>
    list.current?.scrollTo({ y: (value - HEIGHT_CM.min) * ROW, animated });

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setCm(clamp(HEIGHT_CM.min + Math.round(e.nativeEvent.contentOffset.y / ROW)));
  };

  const adjust = (delta: number) => {
    const next = clamp(cm + delta);
    setCm(next);
    scrollTo(next, true);
  };

  return (
    <OnboardingFrame
      route="height"
      title={t('onboarding.height.title')}
      subtitle={t('onboarding.height.subtitle')}
      note={t('onboarding.editLater')}
      noteIcon="lock"
      onNext={() => saveAndContinue(cm === profile.heightCm ? {} : { heightCm: cm })}
      saving={saving}
      error={error}
    >
      <HardShadow radius={radius.card}>
        <View
          style={styles.wheel}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={t('onboarding.height.a11y')}
          accessibilityValue={{ text: `${cm} cm, ${feetAndInches(cm)}` }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(e) => adjust(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
        >
          <View pointerEvents="none" style={styles.band} />
          {/* 111 rows: a plain ScrollView (no virtualization) avoids nesting a list in the page scroll. */}
          <ScrollView
            ref={list}
            nestedScrollEnabled
            contentOffset={{ x: 0, y: (cm - HEIGHT_CM.min) * ROW }}
            snapToInterval={ROW}
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.padding}
            onMomentumScrollEnd={onScrollEnd}
            onScrollEndDrag={(e) => {
              // A drag that stops without momentum still needs to settle on a row.
              if (!e.nativeEvent.velocity?.y) onScrollEnd(e);
            }}
          >
            {HEIGHTS.map((item) => {
              const distance = Math.abs(item - cm);
              return (
                <View key={item} style={styles.row}>
                  <Text
                    variant={distance === 0 ? 'heading' : 'headline'}
                    style={{ opacity: distance === 0 ? 1 : Math.max(0.2, 0.8 - distance * 0.2) }}
                  >
                    {t('onboarding.height.cm', { cm: item })}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </HardShadow>
      <Text variant="label" style={styles.feet}>
        {t('onboarding.height.about', { feet: feetAndInches(cm) })}
      </Text>
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  wheel: {
    height: ROW * VISIBLE,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  band: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: ROW * Math.floor(VISIBLE / 2) - 6,
    height: ROW + 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.accentTint,
  },
  padding: { paddingVertical: ROW * Math.floor(VISIBLE / 2) },
  row: { height: ROW, alignItems: 'center', justifyContent: 'center' },
  feet: { marginTop: 18, textAlign: 'center', fontSize: 15 },
});
