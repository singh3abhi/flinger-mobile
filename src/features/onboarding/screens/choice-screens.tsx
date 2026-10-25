import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { Chip, ChipGroup, ChoiceTile, Question } from '../components/choices';
import { OnboardingFrame } from '../components/onboarding-frame';
import { maxPicks, options } from '../options';
import { useStep } from '../use-step';

/** Add or remove `id`, refusing to go past `max` picks. */
export function toggle<T>(list: readonly T[], id: T, max = Infinity): T[] {
  if (list.includes(id)) return list.filter((x) => x !== id);
  return list.length >= max ? [...list] : [...list, id];
}

/** Same members, ignoring order. */
function sameSet<T>(a: readonly T[], b: readonly T[]): boolean {
  return a.length === b.length && a.every((x) => b.includes(x));
}

const GENDER_ICONS = {
  woman: 'gender-female',
  man: 'gender-male',
  non_binary: 'gender-non-binary',
} as const;

export function GenderScreen() {
  const { t } = useTranslation();
  const { profile, saveAndContinue, saving, error } = useStep('gender');
  const [gender, setGender] = useState(profile.gender);

  return (
    <OnboardingFrame
      route="gender"
      title={t('onboarding.gender.title')}
      subtitle={t('onboarding.gender.subtitle')}
      note={t('onboarding.editLater')}
      noteIcon="lock"
      onNext={() => gender && saveAndContinue(gender === profile.gender ? {} : { gender })}
      nextDisabled={!gender}
      saving={saving}
      error={error}
    >
      <Question>{t('onboarding.gender.question')}</Question>
      <View accessibilityRole="radiogroup">
        {options.gender.map((id) => (
          <ChoiceTile
            key={id}
            label={t(`options.gender.${id}`)}
            selected={gender === id}
            onPress={() => setGender(id)}
            icon={(color) => <MaterialCommunityIcons name={GENDER_ICONS[id]} size={26} color={color} />}
          />
        ))}
      </View>
    </OnboardingFrame>
  );
}

export function WhoToMeetScreen() {
  const { t } = useTranslation();
  const { profile, saveAndContinue, saving, error } = useStep('who-to-meet');
  const [picked, setPicked] = useState(profile.interestedIn);
  const everyone = picked.length === options.interestedIn.length;

  return (
    <OnboardingFrame
      route="who-to-meet"
      title={t('onboarding.whoToMeet.title')}
      subtitle={t('onboarding.whoToMeet.subtitle')}
      note={t('onboarding.whoToMeet.note')}
      onNext={() =>
        saveAndContinue(sameSet(picked, profile.interestedIn) ? {} : { interestedIn: picked })
      }
      nextDisabled={picked.length === 0}
      saving={saving}
      error={error}
    >
      {options.interestedIn.map((id) => (
        <ChoiceTile
          key={id}
          multi
          label={t(`options.interestedIn.${id}`)}
          selected={picked.includes(id)}
          onPress={() => setPicked((list) => toggle(list, id))}
        />
      ))}
      <ChoiceTile
        multi
        label={t('onboarding.whoToMeet.everyone')}
        selected={everyone}
        onPress={() => setPicked(everyone ? [] : [...options.interestedIn])}
      />
    </OnboardingFrame>
  );
}

export function IntentionsScreen() {
  const { t } = useTranslation();
  const { profile, saveAndContinue, saving, error } = useStep('intentions');
  const [picked, setPicked] = useState(profile.hopingToFind);
  const max = maxPicks.hopingToFind;

  return (
    <OnboardingFrame
      route="intentions"
      title={t('onboarding.intentions.title')}
      subtitle={t('onboarding.pickUpTo', { count: max })}
      note={t('onboarding.selectedOf', { count: picked.length, max })}
      onNext={() =>
        saveAndContinue(sameSet(picked, profile.hopingToFind) ? {} : { hopingToFind: picked })
      }
      nextDisabled={picked.length === 0}
      saving={saving}
      error={error}
    >
      {options.hopingToFind.map((id) => (
        <ChoiceTile
          key={id}
          multi
          label={t(`options.hopingToFind.${id}`)}
          selected={picked.includes(id)}
          onPress={() => setPicked((list) => toggle(list, id, max))}
        />
      ))}
    </OnboardingFrame>
  );
}

export function ValuesScreen() {
  const { t } = useTranslation();
  const { profile, saveAndContinue, saving, error } = useStep('values');
  const [picked, setPicked] = useState(profile.values);
  const max = maxPicks.values;

  return (
    <OnboardingFrame
      route="values"
      title={t('onboarding.values.title')}
      subtitle={t('onboarding.pickUpTo', { count: max })}
      note={t('onboarding.selectedOf', { count: picked.length, max })}
      onNext={() => saveAndContinue(sameSet(picked, profile.values) ? {} : { values: picked })}
      nextDisabled={picked.length === 0}
      saving={saving}
      error={error}
    >
      <ChipGroup>
        {options.values.map((id) => (
          <Chip
            key={id}
            label={t(`options.values.${id}`)}
            selected={picked.includes(id)}
            disabled={!picked.includes(id) && picked.length >= max}
            onPress={() => setPicked((list) => toggle(list, id, max))}
          />
        ))}
      </ChipGroup>
    </OnboardingFrame>
  );
}

export function KidsFamilyScreen() {
  const { t } = useTranslation();
  const { profile, saveAndContinue, goNext, saving, error } = useStep('kids-family');
  const [kids, setKids] = useState(profile.kidsStatus);
  const [plans, setPlans] = useState(profile.familyPlans);

  const changes = {
    ...(kids !== profile.kidsStatus ? { kidsStatus: kids } : {}),
    ...(plans !== profile.familyPlans ? { familyPlans: plans } : {}),
  };

  return (
    <OnboardingFrame
      route="kids-family"
      title={t('onboarding.kids.title')}
      subtitle={t('onboarding.kids.subtitle')}
      onSkip={goNext}
      onNext={() => saveAndContinue(changes)}
      saving={saving}
      error={error}
    >
      <Question>{t('onboarding.kids.haveKids')}</Question>
      <ChipGroup>
        {options.kidsStatus.map((id) => (
          <Chip
            key={id}
            multi={false}
            label={t(`options.kidsStatus.${id}`)}
            selected={kids === id}
            onPress={() => setKids(kids === id ? null : id)}
          />
        ))}
      </ChipGroup>
      <View style={styles.section}>
        <Question>{t('onboarding.kids.future')}</Question>
        <ChipGroup>
          {options.familyPlans.map((id) => (
            <Chip
              key={id}
              multi={false}
              label={t(`options.familyPlans.${id}`)}
              selected={plans === id}
              onPress={() => setPlans(plans === id ? null : id)}
            />
          ))}
        </ChipGroup>
      </View>
    </OnboardingFrame>
  );
}

export function BeliefsScreen() {
  const { t } = useTranslation();
  const { profile, saveAndContinue, goNext, saving, error } = useStep('beliefs');
  const [religion, setReligion] = useState(profile.religion);
  const [politics, setPolitics] = useState(profile.politics);

  const changes = {
    ...(religion !== profile.religion ? { religion } : {}),
    ...(politics !== profile.politics ? { politics } : {}),
  };

  return (
    <OnboardingFrame
      route="beliefs"
      title={t('onboarding.beliefs.title')}
      onSkip={goNext}
      onNext={() => saveAndContinue(changes)}
      saving={saving}
      error={error}
    >
      <Question>{t('onboarding.beliefs.religion')}</Question>
      <ChipGroup>
        {options.religion.map((id) => (
          <Chip
            key={id}
            multi={false}
            label={t(`options.religion.${id}`)}
            selected={religion === id}
            onPress={() => setReligion(religion === id ? null : id)}
          />
        ))}
      </ChipGroup>
      <View style={styles.section}>
        <Question>{t('onboarding.beliefs.politics')}</Question>
        <ChipGroup>
          {options.politics.map((id) => (
            <Chip
              key={id}
              multi={false}
              label={t(`options.politics.${id}`)}
              selected={politics === id}
              onPress={() => setPolitics(politics === id ? null : id)}
            />
          ))}
        </ChipGroup>
      </View>
    </OnboardingFrame>
  );
}

export function CausesScreen() {
  const { t } = useTranslation();
  const { profile, saveAndContinue, goNext, saving, error } = useStep('causes');
  const [picked, setPicked] = useState(profile.causes);
  const max = maxPicks.causes;

  return (
    <OnboardingFrame
      route="causes"
      title={t('onboarding.causes.title')}
      subtitle={t('onboarding.causes.subtitle', { count: max })}
      onSkip={goNext}
      onNext={() => saveAndContinue(sameSet(picked, profile.causes) ? {} : { causes: picked })}
      saving={saving}
      error={error}
    >
      <ChipGroup>
        {options.causes.map((id) => (
          <Chip
            key={id}
            label={t(`options.causes.${id}`)}
            selected={picked.includes(id)}
            disabled={!picked.includes(id) && picked.length >= max}
            onPress={() => setPicked((list) => toggle(list, id, max))}
          />
        ))}
      </ChipGroup>
      <Text variant="small" style={styles.count}>
        {t('onboarding.selectedOf', { count: picked.length, max })}
      </Text>
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 28 },
  count: { marginTop: 16 },
});
