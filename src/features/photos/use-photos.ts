import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { queryKeys } from '@/core/api/query-keys';
import { errorMessage } from '@/core/i18n';
import { deletePhoto, reorderPhotos, uploadPhoto, type Photo } from './api';

export const MAX_PHOTOS = 6;
export const MIN_PHOTOS = 4;

/** A photo still on its way up, shown in the grid from its local file. */
export interface LocalUpload {
  key: string;
  uri: string;
  error?: string;
}

let nextKey = 0;

/** Pick, upload, remove and reorder. Server state stays in the profile query. */
export function usePhotoActions(photos: readonly Photo[]) {
  const queryClient = useQueryClient();
  const [uploads, setUploads] = useState<LocalUpload[]>([]);
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.myProfile });

  const free = MAX_PHOTOS - photos.length - uploads.length;

  const pickAndUpload = async () => {
    if (free <= 0) return;
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: free,
      orderedSelection: true,
      quality: 1,
      exif: false,
    });
    if (picked.canceled) return;

    const items = picked.assets.slice(0, free).map((asset) => ({
      asset,
      local: { key: `upload-${(nextKey += 1)}`, uri: asset.uri },
    }));
    setUploads((list) => [...list, ...items.map((i) => i.local)]);

    // One at a time keeps positions in the order the photos were picked.
    for (const { asset, local } of items) {
      try {
        await uploadPhoto({ uri: asset.uri, width: asset.width, height: asset.height });
        await refresh();
        setUploads((list) => list.filter((u) => u.key !== local.key));
      } catch (error) {
        setUploads((list) =>
          list.map((u) => (u.key === local.key ? { ...u, error: errorMessage(error) } : u)),
        );
      }
    }
  };

  const dismissUpload = (key: string) => setUploads((list) => list.filter((u) => u.key !== key));

  const remove = useMutation({ mutationFn: deletePhoto, onSettled: refresh });
  const reorder = useMutation({ mutationFn: reorderPhotos, onSettled: refresh });

  const makeMain = (photoId: string) => {
    const ids = photos.filter((p) => p.status !== 'uploading').map((p) => p.id);
    reorder.mutate([photoId, ...ids.filter((id) => id !== photoId)]);
  };

  return {
    uploads,
    free,
    pickAndUpload,
    dismissUpload,
    remove: (photoId: string) => remove.mutate(photoId),
    makeMain,
    busy: uploads.some((u) => !u.error) || remove.isPending || reorder.isPending,
    error: remove.isError
      ? errorMessage(remove.error)
      : reorder.isError
        ? errorMessage(reorder.error)
        : undefined,
  };
}

/** Photos that count towards the minimum (uploaded and not rejected). */
export function usableCount(photos: readonly Photo[]): number {
  return photos.filter((p) => p.status === 'pending' || p.status === 'approved').length;
}
