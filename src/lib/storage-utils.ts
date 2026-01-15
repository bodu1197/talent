'use client';

import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import { extractStoragePath, extractBucketName } from './storage-utils-common';

// Re-export common utilities
export { extractStoragePath, extractBucketName };

/**
 * Storage에서 이전 이미지 삭제
 * 새 이미지 업로드 전에 호출하여 고아 파일 방지
 *
 * @param oldImageUrl - 삭제할 이미지의 공개 URL
 * @param bucket - Storage 버킷 이름 (옵션, URL에서 자동 추출 가능)
 * @returns 삭제 성공 여부
 */
export async function deleteOldImage(
  oldImageUrl: string | null | undefined,
  bucket?: string
): Promise<boolean> {
  if (!oldImageUrl) return true;

  try {
    const supabase = createClient();

    // URL에서 버킷과 경로 추출
    const bucketName = bucket || extractBucketName(oldImageUrl);
    const filePath = extractStoragePath(oldImageUrl);

    if (!bucketName || !filePath) {
      logger.warn('Could not extract storage path from URL', { url: oldImageUrl });
      return false;
    }

    const { error } = await supabase.storage.from(bucketName).remove([filePath]);

    if (error) {
      logger.error('Failed to delete old image:', error);
      return false;
    }

    logger.info('Successfully deleted old image', { filePath });
    return true;
  } catch (error) {
    logger.error('Error deleting old image:', error);
    return false;
  }
}

/**
 * 여러 이미지 한번에 삭제
 *
 * @param imageUrls - 삭제할 이미지 URL 배열
 * @param bucket - Storage 버킷 이름
 * @returns 삭제 성공 여부
 */
export async function deleteMultipleImages(
  imageUrls: (string | null | undefined)[],
  bucket: string
): Promise<boolean> {
  const validUrls = imageUrls.filter((url): url is string => !!url);
  if (validUrls.length === 0) return true;

  try {
    const supabase = createClient();

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

/**
 * 이미지 업로드 with 자동 이전 이미지 삭제
 * 기존 이미지가 있으면 삭제 후 새 이미지 업로드
 *
 * @param file - 업로드할 파일
 * @param bucket - Storage 버킷 이름
 * @param filePath - 저장할 파일 경로
 * @param oldImageUrl - 삭제할 기존 이미지 URL (옵션)
 * @returns 새 이미지의 공개 URL 또는 null
 */
export async function uploadImageWithCleanup(
  file: File,
  bucket: string,
  filePath: string,
  oldImageUrl?: string | null
): Promise<string | null> {
  try {
    const supabase = createClient();

    // 1. 기존 이미지 삭제 (실패해도 계속 진행)
    if (oldImageUrl) {
      await deleteOldImage(oldImageUrl, bucket);
    }

    // 2. 새 이미지 업로드
    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);

    if (uploadError) {
      logger.error('Image upload error:', uploadError);
      return null;
    }

    // 3. 공개 URL 반환
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    logger.error('Error in uploadImageWithCleanup:', error);
    return null;
  }
}
