import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { errorMessage } from '@/core/i18n';
import { colors, fonts, radius } from '@/core/theme/tokens';
import { Button } from '@/shared/ui/button';
import { HardShadow } from '@/shared/ui/hard-shadow';
import { RoundButton } from '@/shared/ui/round-button';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { OnboardingFrame } from '../components/onboarding-frame';
import { withAnswer, withoutSlot } from '../prompt-list';
import { useMyProfile, usePromptLibrary, useSavePrompts } from '../queries';
import { useStep } from '../use-step';

const REQUIRED = 3;
const MAX_LENGTH = 150;

const pickerHref = (slot: number) => `/onboarding/prompt-picker?slot=${slot}` as Href;
const answerHref = (slot: number, promptId: string) =>
  `/onboarding/prompt-answer?slot=${slot}&promptId=${encodeURIComponent(promptId)}` as Href;

/** Step 11: three prompt cards. Each answer is saved as soon as it is written. */
export function PromptsScreen() {
  const { t } = useTranslation();
  const { profile, goNext } = useStep('prompts');
  const prompts = profile.prompts;

  return (
    <OnboardingFrame
      route="prompts"
      title={t('onboarding.prompts.title')}
      subtitle={t('onboarding.prompts.subtitle', { max: MAX_LENGTH })}
      note={t('onboarding.prompts.added', { count: prompts.length, max: REQUIRED })}
      onNext={goNext}
      nextDisabled={prompts.length < REQUIRED}
    >
      {prompts.map((p, slot) => (
        <Pressable
          key={p.promptId}
          accessibilityRole="button"
          accessibilityHint={t('onboarding.prompts.editHint')}
          onPress={() => router.push(answerHref(slot, p.promptId))}
          style={styles.cardWrap}
        >
          <HardShadow radius={16}>
            <View style={styles.card}>
              <Text variant="small" color="accentInk" style={styles.question}>
                {p.text}
              </Text>
              <Text variant="headline" style={styles.answer}>
                {p.answer}
              </Text>
              <Text variant="small" color="muted" style={styles.count}>
                {p.answer.length} / {MAX_LENGTH}
              </Text>
            </View>
          </HardShadow>
        </Pressable>
      ))}
      {Array.from({ length: REQUIRED - prompts.length }, (_, i) => (
        <Pressable
          key={`empty-${i}`}
          testID={`choose-prompt-${prompts.length + i}`}
          accessibilityRole="button"
          onPress={() => router.push(pickerHref(prompts.length))}
          style={[styles.empty, styles.cardWrap]}
        >
          <View style={styles.add}>
            <Feather name="plus" size={20} color={colors.ink} />
          </View>
          <Text variant="label">{t('onboarding.prompts.choose')}</Text>
        </Pressable>
      ))}
    </OnboardingFrame>
  );
}

/** Pick a question for slot `slot`. Prompts used in other slots are hidden. */
export function PromptPickerScreen() {
  const { t } = useTranslation();
  const { slot } = useLocalSearchParams<{ slot: string }>();
  const index = Number(slot ?? 0);
  const library = usePromptLibrary();
  const profile = useMyProfile().data;
  const used = new Set(
    (profile?.prompts ?? []).filter((_, i) => i !== index).map((p) => p.promptId),
  );

  return (
    <Screen background="cream" padded={false}>
      <View style={styles.sheetHeader}>
        <RoundButton
          label={t('common.close')}
          size={36}
          icon={<Feather name="x" size={20} color={colors.ink} />}
          onPress={() => router.back()}
        />
        <Text variant="headline" accessibilityRole="header" style={styles.sheetTitle}>
          {t('onboarding.prompts.pickTitle')}
        </Text>
      </View>
      {library.isPending ? (
        <ActivityIndicator color={colors.ink} style={styles.loading} />
      ) : library.isError ? (
        <Text variant="body" color="danger" style={styles.pad}>
          {errorMessage(library.error)}
        </Text>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {library.data
            .filter((p) => !used.has(p.id))
            .map((p) => (
              <Pressable
                key={p.id}
                testID={`prompt-option-${p.id}`}
                accessibilityRole="button"
                onPress={() => router.replace(answerHref(index, p.id))}
                style={({ pressed }) => [styles.option, pressed && styles.pressed]}
              >
                <Text variant="bodyLg" style={styles.flex}>
                  {p.text}
                </Text>
                <Feather name="chevron-right" size={20} color={colors.ink} />
              </Pressable>
            ))}
        </ScrollView>
      )}
    </Screen>
  );
}

/** Write (or edit) the answer to one prompt, then save the whole list. */
export function PromptAnswerScreen() {
  const { t } = useTranslation();
  const { slot, promptId } = useLocalSearchParams<{ slot: string; promptId: string }>();
  const index = Number(slot ?? 0);
  const profile = useMyProfile().data;
  const library = usePromptLibrary();
  const save = useSavePrompts();

  const existing = profile?.prompts[index];
  const [answer, setAnswer] = useState(existing?.promptId === promptId ? existing.answer : '');
  const question =
    library.data?.find((p) => p.id === promptId)?.text ??
    profile?.prompts.find((p) => p.promptId === promptId)?.text ??
    '';

  const current = (profile?.prompts ?? []).map(({ promptId: id, answer: a }) => ({
    promptId: id,
    answer: a,
  }));
  const trimmed = answer.trim();

  return (
    <Screen background="cream">
      <View style={styles.answerHeader}>
        <RoundButton
          label={t('common.back')}
          size={36}
          icon={<Feather name="arrow-left" size={20} color={colors.ink} />}
          onPress={() => router.back()}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace(pickerHref(index))}
          hitSlop={12}
        >
          <Text variant="label" style={styles.link}>
            {t('onboarding.prompts.change')}
          </Text>
        </Pressable>
      </View>
      <Text variant="headline" accessibilityRole="header" style={styles.answerQuestion}>
        {question}
      </Text>
      <HardShadow radius={16} style={styles.inputWrap}>
        <TextInput
          testID="prompt-answer-input"
          accessibilityLabel={question}
          value={answer}
          onChangeText={setAnswer}
          multiline
          autoFocus
          maxLength={MAX_LENGTH}
          placeholder={t('onboarding.prompts.placeholder')}
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
      </HardShadow>
      <Text variant="small" color="muted" style={styles.counter}>
        {answer.length} / {MAX_LENGTH}
      </Text>
      {save.isError ? (
        <Text variant="caption" color="danger" accessibilityLiveRegion="polite">
          {errorMessage(save.error)}
        </Text>
      ) : null}
      <View style={styles.flex} />
      {existing ? (
        <Button
          variant="outline"
          label={t('onboarding.prompts.remove')}
          onPress={() => save.mutate(withoutSlot(current, index), { onSuccess: () => router.back() })}
          disabled={save.isPending}
          style={styles.remove}
        />
      ) : null}
      <Button
        testID="prompt-answer-save"
        label={t('onboarding.prompts.save')}
        loading={save.isPending}
        disabled={trimmed.length === 0}
        onPress={() =>
          save.mutate(withAnswer(current, index, promptId ?? '', trimmed), {
            onSuccess: () => router.back(),
          })
        }
        style={styles.save}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  cardWrap: { marginBottom: 18 },
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    padding: 16,
  },
  question: { fontSize: 13 },
  answer: { marginTop: 8, fontSize: 18, lineHeight: 24 },
  count: { marginTop: 8, textAlign: 'right' },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.ink,
  },
  add: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 20 },
  sheetTitle: { flex: 1 },
  loading: { marginTop: 40 },
  pad: { padding: 20 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  pressed: { opacity: 0.6 },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  link: { textDecorationLine: 'underline' },
  answerQuestion: { marginTop: 24 },
  inputWrap: { marginTop: 20 },
  input: {
    minHeight: 140,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    padding: 16,
    fontFamily: fonts.semibold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  counter: { marginTop: 8, textAlign: 'right' },
  remove: { marginBottom: 12 },
  save: { marginBottom: 16, borderRadius: radius.control },
});
