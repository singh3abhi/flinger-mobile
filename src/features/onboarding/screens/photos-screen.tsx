import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { MAX_PHOTOS, MIN_PHOTOS, PhotoGrid, usableCount, usePhotoActions } from '@/features/photos';
import { Text } from '@/shared/ui/text';
import { OnboardingFrame } from '../components/onboarding-frame';
import { useStep } from '../use-step';

/** Step 10: 4 to 6 photos. Each one uploads as soon as it is picked. */
export function PhotosScreen() {
  const { t } = useTranslation();
  const { profile, goNext } = useStep('photos');
  const photos = profile.photos;
  const actions = usePhotoActions(photos);
  const count = usableCount(photos);

  return (
    <OnboardingFrame
      route="photos"
      title={t('onboarding.photos.title')}
      subtitle={t('onboarding.photos.subtitle', { min: MIN_PHOTOS })}
      note={t('onboarding.photos.count', { count, max: MAX_PHOTOS, min: MIN_PHOTOS })}
      onNext={goNext}
      nextDisabled={count < MIN_PHOTOS || actions.busy}
      error={actions.error}
    >
      <PhotoGrid
        photos={photos}
        uploads={actions.uploads}
        onAdd={() => void actions.pickAndUpload()}
        onRemove={actions.remove}
        onMakeMain={actions.makeMain}
        onDismissUpload={actions.dismissUpload}
      />
      <Text variant="caption" style={styles.tips}>
        {t('onboarding.photos.tips')}
      </Text>
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  tips: { marginTop: 18 },
});
