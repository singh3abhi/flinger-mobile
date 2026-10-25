import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius } from '@/core/theme/tokens';
import { Text } from '@/shared/ui/text';
import type { PublicProfile } from '../api';

export type LikeTarget =
  | { type: 'photo'; id: string; url: string; index: number }
  | { type: 'prompt'; id: string; text: string; answer: string };

function HeartButton({ label, onPress, size = 52 }: { label: string; onPress: () => void; size?: number }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={[styles.heart, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Feather name="heart" size={size * 0.46} color={colors.accentInk} />
    </Pressable>
  );
}

/**
 * Someone's profile as one scroll: name, where, then photos interleaved with prompts (Hinge-style).
 * Every photo and prompt can be liked on its own. `onLike` is omitted for read-only views.
 */
export function ProfileCard({
  profile,
  onLike,
}: {
  profile: PublicProfile;
  onLike?: (target: LikeTarget) => void;
}) {
  const { t } = useTranslation();
  const where = [
    profile.city,
    profile.distanceKm !== null ? t('discover.distance', { km: profile.distanceKm }) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const vitals = [
    profile.heightCm ? t('discover.height', { cm: profile.heightCm }) : null,
    profile.religion ? t(`options.religion.${profile.religion}`) : null,
    profile.familyPlans ? t(`options.familyPlans.${profile.familyPlans}`) : null,
    ...profile.hopingToFind.map((id) => t(`options.hopingToFind.${id}`)),
  ].filter((v): v is string => Boolean(v));

  const photo = (index: number) => {
    const p = profile.photos[index];
    if (!p) return null;
    return (
      <View key={`photo-${p.id}`} style={[styles.photo, index > 0 && styles.gap]}>
        <Image
          source={{ uri: p.url, cacheKey: p.id }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={150}
          accessibilityLabel={t('discover.photoA11y', { name: profile.displayName, n: index + 1 })}
        />
        {onLike ? (
          <HeartButton
            label={t('discover.likePhoto')}
            onPress={() => onLike({ type: 'photo', id: p.id, url: p.url, index })}
          />
        ) : null}
      </View>
    );
  };

  const prompt = (index: number) => {
    const q = profile.prompts[index];
    if (!q) return null;
    return (
      <View key={`prompt-${q.id}`} style={[styles.prompt, styles.gap]}>
        <Text variant="small" color="text3" style={styles.promptLabel}>
          {q.text}
        </Text>
        <Text variant="headline" style={[styles.promptAnswer, onLike && styles.promptPadding]}>
          {q.answer}
        </Text>
        {onLike ? (
          <View style={styles.promptHeart}>
            <HeartButton
              size={44}
              label={t('discover.likePrompt')}
              onPress={() => onLike({ type: 'prompt', id: q.id, text: q.text, answer: q.answer })}
            />
          </View>
        ) : null}
      </View>
    );
  };

  // Photo 1, vitals, then alternate prompt / photo, then any photos left.
  const blocks: ReactNode[] = [photo(0)];
  if (vitals.length > 0) {
    blocks.push(
      <View key="vitals" style={styles.vitals}>
        {vitals.map((v) => (
          <View key={v} style={styles.vital}>
            <Text variant="small" style={styles.vitalText}>
              {v}
            </Text>
          </View>
        ))}
      </View>,
    );
  }
  const rest = Math.max(profile.prompts.length, profile.photos.length - 1);
  for (let i = 0; i < rest; i += 1) {
    blocks.push(prompt(i));
    if (i === 0 && profile.bio) {
      blocks.push(
        <View key="bio" style={[styles.prompt, styles.gap]}>
          <Text variant="body">{profile.bio}</Text>
        </View>,
      );
    }
    blocks.push(photo(i + 1));
  }

  return (
    <View>
      <Text variant="heading" accessibilityRole="header">
        {t('discover.nameAge', { name: profile.displayName, age: profile.age })}
      </Text>
      {where ? (
        <View style={styles.where}>
          <Feather name="map-pin" size={14} color={colors.text3} />
          <Text variant="body" color="text3">
            {where}
          </Text>
        </View>
      ) : null}
      {blocks}
    </View>
  );
}

const styles = StyleSheet.create({
  where: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2, marginBottom: 14 },
  photo: {
    height: 420,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  gap: { marginTop: 16 },
  heart: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOpacity: 0.22,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  vitals: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  vital: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  vitalText: { fontSize: 13 },
  prompt: { borderRadius: radius.card, backgroundColor: colors.surface, padding: 18 },
  promptLabel: { fontSize: 13 },
  promptAnswer: { marginTop: 8, fontSize: 22, lineHeight: 28 },
  promptPadding: { marginRight: 52 },
  promptHeart: { position: 'absolute', right: 0, bottom: 0, width: 72, height: 72 },
});
