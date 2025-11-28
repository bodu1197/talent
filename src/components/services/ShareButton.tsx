'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareButtonProps {
  readonly serviceId: string;
  readonly serviceTitle: string;
}

export default function ShareButton({ serviceId, serviceTitle }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = `${globalThis.location.origin}/services/${serviceId}`;
    const shareData = {
      title: serviceTitle,
      text: `${serviceTitle} - 돌파구`,
      url: shareUrl,
    };

    // Web Share API 지원 여부 확인 (모바일에서 주로 지원)
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // 사용자가 공유를 취소한 경우 무시
        if ((error as Error).name !== 'AbortError') {
          // 공유 실패 시 클립보드 복사로 대체
          await copyToClipboard(shareUrl);
        }
      }
    } else {
      // Web Share API 미지원 시 클립보드 복사
      await copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('링크가 복사되었습니다');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드 API 실패 (HTTPS가 아니거나 권한 없음)
      toast.error('링크 복사에 실패했습니다. URL을 수동으로 복사해주세요.');
    }
  };

  return (
    <button
      onClick={handleShare}
      className="w-full py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-500" />
          <span>복사됨</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          <span>공유</span>
        </>
      )}
    </button>
  );
}
