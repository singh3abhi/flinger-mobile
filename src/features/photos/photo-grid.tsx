import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { colors, radius } from '@/core/theme/tokens';
import { Text } from '@/shared/ui/text';
import type { Photo } from './api';
import { MAX_PHOTOS, type LocalUpload } from './use-photos';

const GAP = 10;
const COLUMNS = 3;
/** Portrait tiles, like the design (≈ 4:5.5). */
const ASPECT = 0.72;

interface PhotoGridProps {
  photos: readonly Photo[];
  uploads: readonly LocalUpload[];
  onAdd: () => void;
  onRemove: (photoId: string) => void;
  onMakeMain: (photoId: string) => void;
  onDismissUpload: (key: string) => void;
}

/** Six slots in a 3 × 2 grid: saved photos in order, uploads in progress, then empty slots. */
export function PhotoGrid({ photos, uploads, onAdd, onRemove, onMakeMain, onDismissUpload }: PhotoGridProps) {
  const { t } = useTranslation();
  const empty = Math.max(0, MAX_PHOTOS - photos.length - uploads.length);
  // Tile size from the measured width: percentage widths plus gaps can round past 100% and wrap.
  const [width, setWidth] = useState(0);
  const tileWidth = Math.floor((width - GAP * (COLUMNS - 1)) / COLUMNS);
  const tile = { width: tileWidth, height: Math.round(tileWidth / ASPECT) };

  const openActions = (photo: Photo) => {
    const buttons = [
      ...(photo.position === 1
        ? []
        : [{ text: t('photos.makeMain'), onPress: () => onMakeMain(photo.id) }]),
      { text: t('photos.remove'), style: 'destructive' as const, onPress: () => onRemove(photo.id) },
      { text: t('common.cancel'), style: 'cancel' as const },
    ];
    Alert.alert(t('photos.actionsTitle'), undefined, buttons);
  };

  return (
    <View style={styles.grid} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {photos.map((photo) => (
        <Pressable
          key={photo.id}
          testID={`photo-${photo.position}`}
          accessibilityRole="button"
          accessibilityLabel={t('photos.a11yPhoto', { position: photo.position })}
          accessibilityHint={t('photos.a11yActions')}
          onPress={() => openActions(photo)}
          style={[styles.slot, tile]}
        >
          {photo.url ? (
            <Image
              source={{ uri: photo.url, cacheKey: photo.id }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={150}
            />
          ) : null}
          {photo.position === 1 ? (
            <View style={styles.main}>
              <Text variant="small" color="white" style={styles.badgeText}>
                {t('photos.main')}
              </Text>
            </View>
          ) : null}
          {photo.status === 'pending' ? (
            <View style={styles.status}>
              <Text variant="small" style={styles.badgeText}>
                {t('photos.inReview')}
              </Text>
            </View>
          ) : null}
          {photo.status === 'rejected' ? (
            <View style={styles.rejected}>
              <Text variant="small" color="white" style={styles.rejectedText}>
                {photo.rejectionReason ?? t('photos.rejected')}
              </Text>
            </View>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('photos.remove')}
            hitSlop={8}
            onPress={() => onRemove(photo.id)}
            style={styles.remove}
          >
            <Feather name="x" size={16} color={colors.ink} />
          </Pressable>
        </Pressable>
      ))}

      {uploads.map((upload) => (
        <View key={upload.key} style={[styles.slot, tile]}>
          <Image source={{ uri: upload.uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <View style={styles.veil}>
            {upload.error ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={upload.error}
                onPress={() => onDismissUpload(upload.key)}
                style={styles.failed}
              >
                <Feather name="alert-circle" size={22} color={colors.white} />
                <Text variant="small" color="white" style={styles.failedText}>
                  {t('photos.failed')}
                </Text>
              </Pressable>
            ) : (
              <ActivityIndicator color={colors.white} />
            )}
          </View>
        </View>
      ))}

      {Array.from({ length: empty }, (_, i) => (
        <Pressable
          key={`empty-${i}`}
          testID={i === 0 ? 'photo-add' : undefined}
          accessibilityRole="button"
          accessibilityLabel={t('photos.add')}
          onPress={onAdd}
          style={[styles.slot, tile, styles.empty]}
        >
          <View style={styles.add}>
            <Feather name="plus" size={20} color={colors.ink} />
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  slot: {
    borderRadius: radius.control,
    borderWidth: 1.5,
    borderColor: colors.ink,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  empty: {
    borderWidth: 2,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  add: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 11,
    backgroundColor: colors.ink,
    justifyContent: 'center',
  },
  status: {
    position: 'absolute',
    left: 6,
    top: 6,
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 11,
    backgroundColor: colors.accentTint,
    justifyContent: 'center',
  },
  badgeText: { fontSize: 11 },
  remove: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  veil: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  failed: { alignItems: 'center', gap: 6, padding: 8 },
  failedText: { textAlign: 'center' },
  rejected: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 6,
    backgroundColor: colors.danger,
  },
  rejectedText: { fontSize: 11 },
});
