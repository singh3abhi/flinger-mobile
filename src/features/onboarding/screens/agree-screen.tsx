import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { errorMessage } from '@/core/i18n';
import { colors, radius } from '@/core/theme/tokens';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { OnboardingFrame } from '../components/onboarding-frame';
import { useAcceptConsents, useClientConfig } from '../queries';

const DOCUMENTS = ['terms', 'privacy', 'guidelines'] as const;

function Checkbox({ checked, label, onPress, testID }: {
  checked: boolean;
  label: string;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      style={styles.check}
    >
      <View style={[styles.box, checked && styles.boxOn]}>
        {checked ? <Feather name="check" size={16} color={colors.white} /> : null}
      </View>
      <Text variant="body" style={styles.flex}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Step 13: read and accept the legal documents, then finish. */
export function AgreeScreen() {
  const { t } = useTranslation();
  const config = useClientConfig();
  const accept = useAcceptConsents();
  const [terms, setTerms] = useState(false);
  const [guidelines, setGuidelines] = useState(false);

  const finish = () => {
    if (!config.data) return;
    accept.mutate(
      { documents: [...DOCUMENTS], version: config.data.legalVersion },
      // Finishing onboarding (photos, location, account activation) lands in the next F2 slices.
      { onSuccess: () => router.replace('/home') },
    );
  };

  return (
    <OnboardingFrame
      route="agree"
      title={t('onboarding.agree.title')}
      subtitle={t('onboarding.agree.subtitle')}
      onNext={finish}
      error={accept.isError ? errorMessage(accept.error) : undefined}
      footer={
        <View style={styles.footer}>
          <Button
            testID="agree-finish"
            label={t('onboarding.agree.finish')}
            onPress={finish}
            loading={accept.isPending}
            disabled={!terms || !guidelines || !config.data}
          />
        </View>
      }
    >
      {DOCUMENTS.map((doc) => (
        <Pressable
          key={doc}
          accessibilityRole="link"
          // The documents are not written yet (discussion log D-10).
          onPress={() => Alert.alert(t(`onboarding.agree.docs.${doc}`), t('onboarding.agree.docSoon'))}
          style={styles.doc}
        >
          <Text variant="label">{t(`onboarding.agree.docs.${doc}`)}</Text>
          <Feather name="chevron-right" size={22} color={colors.ink} />
        </Pressable>
      ))}
      <Checkbox
        testID="agree-terms"
        checked={terms}
        onPress={() => setTerms((v) => !v)}
        label={t('onboarding.agree.terms')}
      />
      <Checkbox
        testID="agree-guidelines"
        checked={guidelines}
        onPress={() => setGuidelines((v) => !v)}
        label={t('onboarding.agree.guidelines')}
      />
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  doc: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    borderRadius: radius.control,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    marginBottom: 10,
  },
  check: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginTop: 18 },
  box: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: colors.ink },
  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
});
