/**
 * Storage URL 파싱 유틸리티 (클라이언트/서버 공용)
 * 클라이언트: storage-utils.ts에서 re-export
 * 서버: storage-utils-server.ts에서 re-export
 */

/**
 * Supabase Storage URL에서 파일 경로 추출
 * @example
 * extractStoragePath('https://xxx.supabase.co/storage/v1/object/public/services/service-thumbnails/abc.jpg')
 * returns 'service-thumbnails/abc.jpg'
 */
export function extractStoragePath(publicUrl: string): string | null {
  try {
    // URL format: https://xxx.supabase.co/storage/v1/object/public/{bucket}/{path}
    const url = new URL(publicUrl);
    const pathParts = url.pathname.split('/storage/v1/object/public/');
    if (pathParts.length < 2) return null;

    // Get everything after the bucket name
    const afterBucket = pathParts[1];
    const slashIndex = afterBucket.indexOf('/');
    if (slashIndex === -1) return null;

    return afterBucket.substring(slashIndex + 1);
  } catch {
    return null;
  }
}

/**
 * Supabase Storage URL에서 버킷 이름 추출
 */
export function extractBucketName(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl);
    const pathParts = url.pathname.split('/storage/v1/object/public/');
    if (pathParts.length < 2) return null;

    const afterPublic = pathParts[1];
    const slashIndex = afterPublic.indexOf('/');
    if (slashIndex === -1) return afterPublic;

    return afterPublic.substring(0, slashIndex);
  } catch {
    return null;
  }
}
