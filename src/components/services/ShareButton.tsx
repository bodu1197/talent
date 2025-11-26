'use client';

import { useState } from 'react';
import { FaShare, FaCheck } from 'react-icons/fa';
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
      // 클립보드 API 실패 시 대체 방법
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        toast.success('링크가 복사되었습니다');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error('링크 복사에 실패했습니다');
      }
      textArea.remove();
    }
  };

  return (
    <button
      onClick={handleShare}
      className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
    >
      {copied ? (
        <>
          <FaCheck className="text-green-500" />
          <span>복사됨</span>
        </>
      ) : (
        <>
          <FaShare />
          <span>공유</span>
        </>
      )}
    </button>
  );
}
