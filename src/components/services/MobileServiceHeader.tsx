'use client';

import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaPhone, FaShareAlt } from 'react-icons/fa';

interface MobileServiceHeaderProps {
  serviceId: string;
  serviceTitle: string;
  sellerPhone?: string;
}

export default function MobileServiceHeader({
  serviceId,
  serviceTitle,
  sellerPhone,
}: MobileServiceHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleCall = () => {
    if (sellerPhone) {
      window.location.href = `tel:${sellerPhone}`;
    } else {
      alert('판매자 연락처가 등록되지 않았습니다.');
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/services/${serviceId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: serviceTitle,
          url: shareUrl,
        });
      } catch {
        // 사용자가 공유 취소
      }
    } else {
      // Web Share API 미지원 시 클립보드 복사
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('링크가 복사되었습니다!');
      } catch {
        alert('링크 복사에 실패했습니다.');
      }
    }
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3">
      {/* 뒤로가기 버튼 */}
      <button
        type="button"
        onClick={handleBack}
        className="w-10 h-10 flex items-center justify-center bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors"
        aria-label="뒤로가기"
      >
        <FaArrowLeft className="text-lg" />
      </button>

      {/* 오른쪽 버튼들 */}
      <div className="flex items-center gap-2">
        {/* 전화 버튼 */}
        <button
          type="button"
          onClick={handleCall}
          className="w-10 h-10 flex items-center justify-center bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors"
          aria-label="전화하기"
        >
          <FaPhone className="text-lg" />
        </button>

        {/* 공유 버튼 */}
        <button
          type="button"
          onClick={handleShare}
          className="w-10 h-10 flex items-center justify-center bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors"
          aria-label="공유하기"
        >
          <FaShareAlt className="text-lg" />
        </button>
      </div>
    </div>
  );
}
