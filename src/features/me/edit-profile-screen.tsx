import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { errorMessage } from '@/core/i18n';
import { colors, fonts, radius } from '@/core/theme/tokens';
import { editHref, feetAndInches } from '@/features/onboarding';
import { PhotoGrid, usePhotoActions } from '@/features/photos';
import { Button } from '@/shared/ui/button';
import { ListRow, ListSection } from '@/shared/ui/list-row';
import { PageHeader } from '@/shared/ui/page-header';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { useMyProfileSummary, useUpdateBio } from './api';

const BIO_MAX = 500;

/** Edit everything on my profile. Each answer opens the same screen as in onboarding. */
export function EditProfileScreen() {
  const { t } = useTranslation();
  const me = useMyProfileSummary().data;
  const actions = usePhotoActions(me?.photos ?? []);
  const saveBio = useUpdateBio();
  const [bio, setBio] = useState('');
  useEffect(() => setBio(me?.bio ?? ''), [me?.bio]);

  if (!me) {
    return (
      <Screen padded={false}>
        <PageHeader title={t('me.edit')} />
        <ActivityIndicator color={colors.ink} style={styles.loading} />
      </Screen>
    );
  }

  const list = (group: string, ids: readonly string[]) =>
    ids.length ? ids.map((id) => t(`options.${group}.${id}`)).join(', ') : t('editProfile.notSet');
  const one = (group: string, id: string | null) => (id ? t(`options.${group}.${id}`) : t('editProfile.notSet'));
  const bioChanged = bio.trim() !== (me.bio ?? '');

  return (
    <Screen padded={false}>
      <PageHeader title={t('me.edit')} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ListSection title={t('editProfile.photos')} />
        <PhotoGrid
          photos={me.photos}
          uploads={actions.uploads}
          onAdd={() => void actions.pickAndUpload()}
          onRemove={actions.remove}
          onMakeMain={actions.makeMain}
          onDismissUpload={actions.dismissUpload}
        />
        <Text variant="caption" color="text3" style={styles.hint}>
          {t('editProfile.photosHint')}
        </Text>
        {actions.error ? (
          <Text variant="caption" color="danger">
            {actions.error}
          </Text>
        ) : null}

        <ListSection title={t('editProfile.prompts')} />
        {me.prompts.map((p) => (
          <ListRow key={p.id} label={p.text} hint={p.answer} onPress={() => router.push(editHref('prompts'))} />
        ))}
        {me.prompts.length < 3 ? (
          <ListRow
            icon="plus"
            label={t('editProfile.addPrompt')}
            onPress={() => router.push(editHref('prompts'))}
          />
        ) : null}

        <ListSection title={t('editProfile.bio')} />
        <TextInput
          testID="bio-input"
          accessibilityLabel={t('editProfile.bio')}
          value={bio}
          onChangeText={setBio}
          maxLength={BIO_MAX}
          multiline
          placeholder={t('editProfile.bioPlaceholder')}
          placeholderTextColor={colors.muted}
          style={styles.bio}
        />
        <View style={styles.bioFooter}>
          <Text variant="small" color="muted">
            {bio.length} / {BIO_MAX}
          </Text>
          {bioChanged ? (
            <Button
              label={t('editProfile.saveBio')}
              loading={saveBio.isPending}
              onPress={() => saveBio.mutate(bio.trim() || null)}
              style={styles.saveBio}
            />
          ) : null}
        </View>
        {saveBio.isError ? (
          <Text variant="caption" color="danger">
            {errorMessage(saveBio.error)}
          </Text>
        ) : null}

        <ListSection title={t('editProfile.about')} />
        <ListRow label={t('editProfile.name')} value={me.displayName ?? ''} onPress={() => router.push(editHref('name'))} />
        <ListRow label={t('editProfile.birthday')} value={t('editProfile.locked')} />
        <ListRow label={t('editProfile.gender')} value={one('gender', me.gender)} onPress={() => router.push(editHref('gender'))} />
        <ListRow
          label={t('editProfile.interestedIn')}
          value={list('interestedIn', me.interestedIn)}
          onPress={() => router.push(editHref('who-to-meet'))}
        />
        <ListRow
          label={t('editProfile.hopingToFind')}
          value={list('hopingToFind', me.hopingToFind)}
          onPress={() => router.push(editHref('intentions'))}
        />
        <ListRow
          label={t('editProfile.height')}
          value={me.heightCm ? `${me.heightCm} cm · ${feetAndInches(me.heightCm)}` : t('editProfile.notSet')}
          onPress={() => router.push(editHref('height'))}
        />
        <ListRow label={t('editProfile.values')} value={list('values', me.values)} onPress={() => router.push(editHref('values'))} />
        <ListRow
          label={t('editProfile.kids')}
          value={[me.kidsStatus && one('kidsStatus', me.kidsStatus), me.familyPlans && one('familyPlans', me.familyPlans)]
            .filter(Boolean)
            .join(', ') || t('editProfile.notSet')}
          onPress={() => router.push(editHref('kids-family'))}
        />
        <ListRow
          label={t('editProfile.beliefs')}
          value={[me.religion && one('religion', me.religion), me.politics && one('politics', me.politics)]
            .filter(Boolean)
            .join(', ') || t('editProfile.notSet')}
          onPress={() => router.push(editHref('beliefs'))}
        />
        <ListRow label={t('editProfile.causes')} value={list('causes', me.causes)} onPress={() => router.push(editHref('causes'))} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 40 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  hint: { marginTop: 10 },
  bio: {
    minHeight: 100,
    borderRadius: radius.control,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    padding: 14,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.ink,
    textAlignVertical: 'top',
    marginTop: 8,
  },
  bioFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  saveBio: { minHeight: 40, paddingHorizontal: 18 },
});
