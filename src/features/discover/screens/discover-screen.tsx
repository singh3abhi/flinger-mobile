import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { errorMessage } from '@/core/i18n';
import { colors, radius } from '@/core/theme/tokens';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { ProfileCard, type LikeTarget } from '../components/profile-card';
import { LikeSheet, LimitSheet } from '../components/sheets';
import { useDeck, useDecisions, useLimits } from '../use-deck';

const logo = require('../../../../assets/images/logo.png');
const emptyArt = require('../../../../assets/images/location.png');

export function matchHref(matchId: string, name: string, photoUrl: string, memberId?: string): Href {
  const q = new URLSearchParams({ matchId, name, photoUrl, ...(memberId ? { memberId } : {}) });
  return `/match?${q.toString()}` as Href;
}

export function DiscoverScreen() {
  const { t } = useTranslation();
  const deck = useDeck();
  const limits = useLimits();
  const { like, pass, isLimitError } = useDecisions();
  const [target, setTarget] = useState<LikeTarget | null>(null);
  const [limitOpen, setLimitOpen] = useState(false);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const card = deck.current;

  const next = () => {
    deck.advance();
    scroll.current?.scrollTo({ y: 0, animated: false });
  };

  const openLike = (item: LikeTarget) => {
    if (limits.data && limits.data.likesRemaining <= 0) return setLimitOpen(true);
    like.reset();
    setTarget(item);
  };

  const sendLike = (comment?: string) => {
    if (!card || !target) return;
    like.mutate(
      { targetId: card.userId, itemType: target.type, itemId: target.id, comment },
      {
        onSuccess: (result) => {
          setTarget(null);
          if (result.matched && result.matchId) {
            router.push(matchHref(result.matchId, card.displayName, card.photos[0]?.url ?? '', card.userId));
          }
          next();
        },
        onError: (error) => {
          if (isLimitError(error)) {
            setTarget(null);
            setLimitOpen(true);
          }
        },
      },
    );
  };

  const onPass = () => {
    if (!card) return;
    pass.mutate(card.userId);
    next();
  };

  return (
    <SafeAreaView style={styles.fill} edges={['top']}>
      <View style={styles.bar}>
        <View style={styles.brand}>
          <Image source={logo} style={styles.logo} contentFit="contain" />
          <Text variant="headline" color="accentInk" style={styles.brandText}>
            Flinger
          </Text>
        </View>
        {limits.data ? (
          <View style={styles.pill} accessibilityLabel={t('discover.likesLeft', { count: limits.data.likesRemaining })}>
            <Feather name="heart" size={14} color={colors.accentTintInk} />
            <Text variant="small" color="accentTintInk" style={styles.pillText}>
              {t('discover.likesLeft', { count: limits.data.likesRemaining })}
            </Text>
          </View>
        ) : null}
      </View>

      {card ? (
        <>
          <ScrollView
            ref={scroll}
            contentContainerStyle={styles.feed}
            showsVerticalScrollIndicator={false}
          >
            {deck.meta?.widened ? (
              <Text variant="caption" color="text3" style={styles.widened}>
                {t('discover.widened', { km: deck.meta.radiusKm })}
              </Text>
            ) : null}
            <ProfileCard key={card.userId} profile={card} onLike={openLike} />
          </ScrollView>
          <Pressable
            testID="discover-pass"
            accessibilityRole="button"
            accessibilityLabel={t('discover.pass', { name: card.displayName })}
            onPress={onPass}
            style={styles.pass}
          >
            <Feather name="x" size={28} color={colors.white} />
          </Pressable>
        </>
      ) : deck.loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.ink} />
        </View>
      ) : deck.error ? (
        <View style={styles.center}>
          <Text variant="body" style={styles.centerText}>
            {errorMessage(deck.error)}
          </Text>
          <Button variant="dark" label={t('common.retry')} onPress={deck.reload} style={styles.wide} />
        </View>
      ) : (
        <View style={styles.center}>
          <Image source={emptyArt} style={styles.art} contentFit="contain" />
          <Text variant="headline" accessibilityRole="header" style={[styles.centerText, styles.gap]}>
            {t('discover.empty.title')}
          </Text>
          <Text variant="body" color="text2" style={[styles.centerText, styles.gap]}>
            {t('discover.empty.body')}
          </Text>
          <Button variant="dark" label={t('discover.empty.again')} onPress={deck.reload} style={styles.wide} />
        </View>
      )}

      <LikeSheet
        name={card?.displayName ?? ''}
        target={target}
        likesRemaining={limits.data?.likesRemaining ?? null}
        sending={like.isPending}
        error={like.isError && !isLimitError(like.error) ? errorMessage(like.error) : undefined}
        onSend={sendLike}
        onClose={() => setTarget(null)}
      />
      <LimitSheet
        visible={limitOpen}
        perDay={limits.data?.likesPerDay ?? 25}
        resetsAt={limits.data?.resetsAt ?? null}
        onClose={() => setLimitOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.page },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 24, height: 26 },
  brandText: { letterSpacing: -0.5 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.accentTint,
  },
  pillText: { fontSize: 13 },
  feed: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 120 },
  widened: { marginBottom: 8 },
  pass: {
    position: 'absolute',
    left: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  centerText: { textAlign: 'center' },
  gap: { marginTop: 12 },
  art: { width: 120, height: 120 },
  wide: { alignSelf: 'stretch', marginTop: 26 },
});
