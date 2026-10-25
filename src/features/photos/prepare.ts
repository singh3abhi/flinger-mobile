import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

export interface PickedImage {
  uri: string;
  width: number;
  height: number;
}

/** Longest side of an uploaded photo. Enough for a full-screen card on any phone. */
export const MAX_EDGE = 1440;
const JPEG_QUALITY = 0.8;

/** The resize that fits `width × height` inside MAX_EDGE, or null if it already fits. */
export function fitWithin(width: number, height: number, maxEdge = MAX_EDGE) {
  if (Math.max(width, height) <= maxEdge) return null;
  return width >= height ? { width: maxEdge } : { height: maxEdge };
}

/**
 * Re-encode as JPEG (also strips EXIF such as GPS) and shrink to MAX_EDGE, so uploads are small
 * and every photo has the same format.
 */
export async function prepareForUpload(image: PickedImage) {
  const context = ImageManipulator.manipulate(image.uri);
  const resize = fitWithin(image.width, image.height);
  if (resize) context.resize(resize);
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: JPEG_QUALITY });
  const file = new File(saved.uri);
  return { file, size: file.size, width: saved.width, height: saved.height };
}
