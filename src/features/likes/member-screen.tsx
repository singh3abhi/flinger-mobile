import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { queryKeys } from '@/core/api/query-keys';
import { errorMessage } from '@/core/i18n';
import { colors, radius } from '@/core/theme/tokens';
import {
  fetchProfile,
  LikeSheet,
  LimitSheet,
  matchHref,
  ProfileCard,
  useDecisions,
  useLimits,
  type LikeTarget,
} from '@/features/discover';
import { RoundButton } from '@/shared/ui/round-button';
import { Text } from '@/shared/ui/text';

/** Someone's full profile (from Liked You): like any photo or prompt back to match, or remove them. */
export function MemberScreen() {
  const { t } = useTranslation();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const profile = useQuery({ queryKey: queryKeys.profile(userId), queryFn: () => fetchProfile(userId) });
  const limits = useLimits();
  const { like, pass, isLimitError } = useDecisions();
  const [target, setTarget] = useState<LikeTarget | null>(null);
  const [limitOpen, setLimitOpen] = useState(false);
  const member = profile.data;

  const send = (comment?: string) => {
    if (!member || !target) return;
    like.mutate(
      { targetId: member.userId, itemType: target.type, itemId: target.id, comment },
      {
        onSuccess: (result) => {
          setTarget(null);
          if (result.matched && result.matchId) {
            router.replace(matchHref(result.matchId, member.displayName, member.photos[0]?.url ?? '', member.userId));
          } else {
            router.back();
          }
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

  return (
    <SafeAreaView style={styles.fill} edges={['top']}>
      <View style={styles.bar}>
        <RoundButton
          label={t('common.back')}
          size={36}
          icon={<Feather name="arrow-left" size={20} color={colors.ink} />}
          onPress={() => router.back()}
        />
      </View>
      {profile.isPending ? (
        <ActivityIndicator color={colors.ink} style={styles.loading} />
      ) : !member ? (
        <Text variant="body" style={styles.pad}>
          {errorMessage(profile.error)}
        </Text>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.feed}>
            <ProfileCard profile={member} onLike={(item) => { like.reset(); setTarget(item); }} />
          </ScrollView>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('discover.pass', { name: member.displayName })}
            onPress={() => pass.mutate(member.userId, { onSuccess: () => router.back() })}
            style={styles.pass}
          >
            <Feather name="x" size={28} color={colors.white} />
          </Pressable>
          <LikeSheet
            name={member.displayName}
            target={target}
            likesRemaining={limits.data?.likesRemaining ?? null}
            sending={like.isPending}
            error={like.isError && !isLimitError(like.error) ? errorMessage(like.error) : undefined}
            onSend={send}
            onClose={() => setTarget(null)}
          />
          <LimitSheet
            visible={limitOpen}
            perDay={limits.data?.likesPerDay ?? 25}
            resetsAt={limits.data?.resetsAt ?? null}
            onClose={() => setLimitOpen(false)}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.page },
  bar: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  loading: { marginTop: 40 },
  pad: { padding: 20 },
  feed: { paddingHorizontal: 20, paddingBottom: 120 },
  pass: {
    position: 'absolute',
    left: 20,
    bottom: 34,
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
