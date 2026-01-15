import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { extractStoragePath, extractBucketName } from './storage-utils-common';

// Re-export common utilities for server usage
export { extractStoragePath, extractBucketName };

/**
 * Storage에서 이미지 삭제 (서버용)
 *
 * @param imageUrl - 삭제할 이미지의 공개 URL
 * @param bucket - Storage 버킷 이름 (옵션)
 * @returns 삭제 성공 여부
 */
export async function deleteImageServer(
  imageUrl: string | null | undefined,
  bucket?: string
): Promise<boolean> {
  if (!imageUrl) return true;

  try {
    const supabase = await createClient();

    const bucketName = bucket || extractBucketName(imageUrl);
    const filePath = extractStoragePath(imageUrl);

    if (!bucketName || !filePath) {
      logger.warn('Could not extract storage path from URL', { url: imageUrl });
      return false;
    }

    const { error } = await supabase.storage.from(bucketName).remove([filePath]);

    if (error) {
      logger.error('Failed to delete image:', error);
      return false;
    }

    logger.info('Successfully deleted image', { filePath });
    return true;
  } catch (error) {
    logger.error('Error deleting image:', error);
    return false;
  }
}

/**
 * 여러 이미지 한번에 삭제 (서버용)
 *
 * @param imageUrls - 삭제할 이미지 URL 배열
 * @param bucket - Storage 버킷 이름
 * @returns 삭제 성공 여부
 */
export async function deleteMultipleImagesServer(
  imageUrls: (string | null | undefined)[],
  bucket: string
): Promise<boolean> {
  const validUrls = imageUrls.filter((url): url is string => !!url);
  if (validUrls.length === 0) return true;

  try {
    const supabase = await createClient();

    const filePaths = validUrls
      .map((url) => extractStoragePath(url))
      .filter((path): path is string => !!path);

    if (filePaths.length === 0) return true;

    const { error } = await supabase.storage.from(bucket).remove(filePaths);

    if (error) {
      logger.error('Failed to delete multiple images:', error);
      return false;
    }

    logger.info(`Successfully deleted ${filePaths.length} images from ${bucket}`);
    return true;
  } catch (error) {
    logger.error('Error deleting multiple images:', error);
    return false;
  }
}
