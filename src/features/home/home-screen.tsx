import { useQuery } from '@tanstack/react-query';
import { Redirect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { queryKeys } from '@/core/api/query-keys';
import { errorMessage } from '@/core/i18n';
import { colors } from '@/core/theme/tokens';
import { fetchMe } from '@/features/auth';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';

/** Where a signed-in member lands: onboarding until it is finished, then Discover. */
export function HomeScreen() {
  const { t } = useTranslation();
  const me = useQuery({ queryKey: queryKeys.me, queryFn: fetchMe });

  if (me.data) {
    return <Redirect href={me.data.status === 'pending' ? '/onboarding' : '/discover'} />;
  }
  return (
    <View style={styles.center}>
      {me.isError ? (
        <>
          <Text variant="body" style={styles.text}>
            {errorMessage(me.error)}
          </Text>
          <Button variant="dark" label={t('common.retry')} onPress={() => me.refetch()} />
        </>
      ) : (
        <ActivityIndicator color={colors.ink} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
    backgroundColor: colors.page,
  },
  text: { textAlign: 'center' },
});
