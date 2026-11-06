import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { errorMessage } from '@/core/i18n';
import { colors, radius } from '@/core/theme/tokens';
import { Button } from '@/shared/ui/button';
import { ListRow, ListSection } from '@/shared/ui/list-row';
import { PageHeader } from '@/shared/ui/page-header';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { useMyProfileSummary, usePreferences, useUpdateInterestedIn, useUpdatePreferences } from './api';

const GENDERS = ['men', 'women', 'non_binary'] as const;
const DISTANCES = [5, 10, 25, 50, 100, 150, 200];

function Stepper({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  const button = (delta: number, icon: 'minus' | 'plus') => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} ${icon === 'plus' ? '+' : '−'}`}
      disabled={value + delta < min || value + delta > max}
      onPress={() => onChange(value + delta)}
      style={({ pressed }) => [styles.stepButton, pressed && styles.pressed]}
    >
      <Feather name={icon} size={18} color={colors.ink} />
    </Pressable>
  );
  return (
    <View style={styles.stepper} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text variant="small" color="text3">
        {label}
      </Text>
      <View style={styles.stepRow}>
        {button(-1, 'minus')}
        <Text variant="headline" style={styles.stepValue}>
          {value}
        </Text>
        {button(1, 'plus')}
      </View>
    </View>
  );
}

/** Who to show me: genders, age range, distance. */
export function PreferencesScreen() {
  const { t } = useTranslation();
  const prefs = usePreferences();
  const me = useMyProfileSummary().data;
  const savePrefs = useUpdatePreferences();
  const saveGenders = useUpdateInterestedIn();

  const [genders, setGenders] = useState<(typeof GENDERS)[number][]>([]);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(40);
  const [distance, setDistance] = useState(50);
  const [showDistance, setShowDistance] = useState(true);
  const [expand, setExpand] = useState(true);

  useEffect(() => {
    if (prefs.data) {
      setMinAge(prefs.data.minAge);
      setMaxAge(prefs.data.maxAge);
      setDistance(prefs.data.maxDistanceKm);
      setShowDistance(prefs.data.showDistance);
      setExpand(prefs.data.expandRadiusWhenEmpty);
    }
  }, [prefs.data]);
  useEffect(() => {
    if (me) setGenders(me.interestedIn);
  }, [me]);

  const save = async () => {
    await savePrefs.mutateAsync({ minAge, maxAge, maxDistanceKm: distance, showDistance, expandRadiusWhenEmpty: expand });
    if (me && [...genders].sort().join() !== [...me.interestedIn].sort().join()) {
      await saveGenders.mutateAsync(genders);
    }
    router.back();
  };
  const error = savePrefs.error ?? saveGenders.error;

  return (
    <Screen padded={false}>
      <PageHeader title={t('preferences.title')} />
      {prefs.isPending ? (
        <ActivityIndicator color={colors.ink} style={styles.loading} />
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            <ListSection title={t('preferences.showMe')} />
            <View style={styles.chips}>
              {GENDERS.map((g) => {
                const on = genders.includes(g);
                return (
                  <Pressable
                    key={g}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: on }}
                    onPress={() => setGenders((list) => (on ? list.filter((x) => x !== g) : [...list, g]))}
                    style={[styles.chip, on && styles.chipOn]}
                  >
                    <Text variant="small" color={on ? 'white' : 'ink'} style={styles.chipText}>
                      {t(`options.interestedIn.${g}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <ListSection title={t('preferences.age')} />
            <View style={styles.row}>
              <Stepper label={t('preferences.from')} value={minAge} min={18} max={maxAge} onChange={setMinAge} />
              <Stepper label={t('preferences.to')} value={maxAge} min={minAge} max={99} onChange={setMaxAge} />
            </View>
            <Text variant="caption" color="text3" style={styles.hint}>
              {t('preferences.ageHint')}
            </Text>

            <ListSection title={t('preferences.distance')} />
            <View style={styles.chips}>
              {DISTANCES.map((km) => {
                const on = km === distance;
                return (
                  <Pressable
                    key={km}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    onPress={() => setDistance(km)}
                    style={[styles.chip, on && styles.chipOn]}
                  >
                    <Text variant="small" color={on ? 'white' : 'ink'} style={styles.chipText}>
                      {t('preferences.km', { km })}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <ListRow
              label={t('preferences.expand')}
              hint={t('preferences.expandHint')}
              toggle={{ value: expand, onChange: setExpand }}
            />
            <ListRow label={t('preferences.showDistance')} toggle={{ value: showDistance, onChange: setShowDistance }} />
            {error ? (
              <Text variant="caption" color="danger" style={styles.hint}>
                {errorMessage(error)}
              </Text>
            ) : null}
          </ScrollView>
          <View style={styles.footer}>
            <Button
              testID="preferences-save"
              label={t('preferences.save')}
              disabled={genders.length === 0}
              loading={savePrefs.isPending || saveGenders.isPending}
              onPress={() => void save().catch(() => undefined)}
            />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 40 },
  content: { paddingHorizontal: 20, paddingBottom: 24 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.ink,
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  chipOn: { backgroundColor: colors.ink },
  chipText: { fontSize: 14 },
  row: { flexDirection: 'row', gap: 12, marginTop: 8 },
  stepper: { flex: 1, padding: 12, borderRadius: radius.control, backgroundColor: colors.surface, gap: 6 },
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  stepValue: { minWidth: 40, textAlign: 'center' },
  hint: { marginTop: 8 },
  footer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
});
