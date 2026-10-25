import { Feather } from '@expo/vector-icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { errorMessage } from '@/core/i18n';
import { colors, radius } from '@/core/theme/tokens';
import { fetchMe, signOut } from '@/features/auth/api';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';

const logo = require('../../../assets/images/logo.png');

/**
 * Temporary signed-in screen for F1: proves the session works end to end (GET /v1/me) and lets
 * you sign out. Replaced by onboarding (F2) and the main tabs (F3).
 */
export function HomeScreen() {
  const { t } = useTranslation();
  const me = useQuery({ queryKey: ['me'], queryFn: fetchMe });
  const logout = useMutation({ mutationFn: signOut });

  return (
    <Screen>
      <View style={styles.center}>
        <Image source={logo} style={styles.logo} contentFit="contain" />
        <Text variant="heading" accessibilityRole="header" style={styles.text}>
          {t('home.title')}
        </Text>
        {me.isPending ? (
          <ActivityIndicator color={colors.ink} style={styles.gap} />
        ) : me.isError ? (
          <Text variant="body" color="danger" style={[styles.text, styles.gap]}>
            {errorMessage(me.error)}
          </Text>
        ) : (
          <View style={[styles.card, styles.gap]}>
            <Feather name="mail" size={18} color={colors.accentInk} />
            <Text testID="signed-in-as" variant="body" style={styles.cardText}>
              {t('home.signedInAs', { email: me.data.email ?? '' })}
            </Text>
          </View>
        )}
        <Text variant="body" color="text2" style={[styles.text, styles.gap]}>
          {t('home.next')}
        </Text>
      </View>
      <Button
        testID="sign-out"
        variant="dark"
        label={t('common.signOut')}
        onPress={() => logout.mutate()}
        loading={logout.isPending}
        style={styles.bottom}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 72, height: 77, marginBottom: 24 },
  text: { textAlign: 'center' },
  gap: { marginTop: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.control,
    backgroundColor: colors.surface,
  },
  cardText: { flexShrink: 1 },
  bottom: { marginBottom: 16 },
});
