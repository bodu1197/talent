import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

/**
 * YouTube 썸네일 다운로드 및 관리 훅
 *
 * 사용 예시:
 * ```typescript
 * const { videoId, loading, fetchThumbnail } = useYoutubeThumbnail()
 *
 * const handleUrlChange = async (url: string) => {
 *   const result = await fetchThumbnail(url)
 *   if (result) {
 *     // result.thumbnailUrl, result.videoId 사용
 *   }
 * }
 * ```
 */
export function useYoutubeThumbnail() {
  const [videoId, setVideoId] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * YouTube URL에서 비디오 ID 추출
   */
  const extractVideoId = useCallback((url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  }, []);

  /**
   * YouTube 썸네일 다운로드 및 Blob URL 생성
   */
  const fetchThumbnail = useCallback(
    async (url: string) => {
      if (!url.trim()) {
        setVideoId('');
        return null;
      }

      const id = extractVideoId(url);
      if (!id) {
        toast.error('유효한 YouTube URL을 입력해주세요');
        return null;
      }

      setVideoId(id);
      setLoading(true);

      try {
        // YouTube 썸네일 URL 시도 순서
        const thumbnailUrls = [
          `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
          `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
          `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
          `https://img.youtube.com/vi/${id}/default.jpg`,
        ];

        // 첫 번째로 사용 가능한 썸네일 찾기
        for (const thumbnailUrl of thumbnailUrls) {
          try {
            const response = await fetch(thumbnailUrl);
            if (response.ok) {
              const blob = await response.blob();
              const blobUrl = URL.createObjectURL(blob);

              return {
                thumbnailUrl: blobUrl,
                videoId: id,
                blob,
              };
            }
          } catch {
            continue;
          }
        }

        toast.error('YouTube 썸네일을 가져올 수 없습니다');
        return null;
      } catch (error) {
        logger.error('YouTube thumbnail fetch error:', error);
        toast.error('YouTube 썸네일을 가져오는 중 오류가 발생했습니다');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [extractVideoId]
  );

  /**
   * 비디오 ID 초기화
   */
  const resetVideoId = useCallback(() => {
    setVideoId('');
  }, []);

  return {
    videoId,
    loading,
    extractVideoId,
    fetchThumbnail,
    resetVideoId,
  };
}
