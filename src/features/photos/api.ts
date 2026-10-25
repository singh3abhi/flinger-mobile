import { UploadTask, UploadType } from 'expo-file-system';
import { api } from '@/core/api/client';
import { ApiError, ensureOk, networkError, unwrap } from '@/core/api/errors';
import type { SchemaPhotoDto } from '@/core/api/schema';
import { prepareForUpload, type PickedImage } from './prepare';

export type Photo = SchemaPhotoDto;
type Prepared = Awaited<ReturnType<typeof prepareForUpload>>;

export async function deletePhoto(photoId: string): Promise<void> {
  ensureOk(await api.DELETE('/v1/me/photos/{photoId}', { params: { path: { photoId } } }));
}

export async function reorderPhotos(photoIds: string[]): Promise<Photo[]> {
  return unwrap(await api.PATCH('/v1/me/photos/order', { body: { photoIds } })).items;
}

/**
 * The full upload: shrink on the device, reserve a slot, PUT the bytes straight to storage with
 * the presigned URL, then confirm. Photo bytes never go through the API server.
 */
export async function uploadPhoto(image: PickedImage): Promise<Photo> {
  const prepared = await prepareForUpload(image);
  const { photo, upload } = unwrap(
    await api.POST('/v1/me/photos', {
      body: { contentType: 'image/jpeg', byteSize: prepared.size },
    }),
  );
  try {
    await putToStorage(upload, prepared);
    return unwrap(
      await api.POST('/v1/me/photos/{photoId}/complete', {
        params: { path: { photoId: photo.id } },
        body: { width: prepared.width, height: prepared.height },
      }),
    );
  } catch (error) {
    // Give the reserved slot back straight away (the server would otherwise hold it for 30 min).
    await deletePhoto(photo.id).catch(() => undefined);
    throw error;
  }
}

/**
 * Native upload straight from the file. React Native's fetch is not used here: with a Blob body it
 * replaces our Content-Type with the blob's (empty) type, which breaks the signed URL.
 */
async function putToStorage(
  upload: { url: string; method: 'PUT'; headers: Record<string, string> },
  prepared: Prepared,
): Promise<void> {
  let status: number;
  try {
    const task = new UploadTask(prepared.file, upload.url, {
      httpMethod: upload.method,
      uploadType: UploadType.BINARY_CONTENT,
      headers: upload.headers,
      sessionType: 'foreground',
    });
    status = (await task.uploadAsync()).status;
  } catch (cause) {
    throw networkError(cause);
  }
  if (status < 200 || status >= 300) {
    throw new ApiError(status, 'PHOTO_UPLOAD_FAILED', 'The photo upload failed.');
  }
}
