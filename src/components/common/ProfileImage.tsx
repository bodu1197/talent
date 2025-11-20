"use client";

import { useState } from "react";
import Image from "next/image";

interface ProfileImageProps {
  /** 프로필 이미지 URL */
  src: string | null | undefined;
  /** 이미지 alt 텍스트 (접근성) */
  alt: string;
  /** 이미지 크기 (px) */
  size?: number;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 프로필 이미지 컴포넌트
 * - onError fallback 제거 (기본 아이콘 표시 안 함)
 * - 이미지 로드 실패 시 빈 상태 유지 또는 재시도
 */
export default function ProfileImage({
  src,
  alt,
  size = 32,
  className = "",
}: ProfileImageProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [imageError, setImageError] = useState(false);

  // 이미지 URL이 없으면 빈 div 표시 (아이콘 없음)
  if (!src) {
    return (
      <div
        className={`bg-gray-200 rounded-full ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
        aria-hidden="true"
      />
    );
  }

  // 이미지 로드 실패 시 재시도 (최대 2회)
  const handleError = () => {
    if (retryCount < 2) {
      setRetryCount((prev) => prev + 1);
      // 강제 재로드를 위해 URL에 타임스탬프 추가
      return;
    }
    setImageError(true);
  };

  // 재시도 후에도 실패 시 빈 div 표시
  if (imageError) {
    return (
      <div
        className={`bg-gray-200 rounded-full ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
        aria-hidden="true"
      />
    );
  }

  // 재시도 시 캐시 무효화를 위한 URL
  const imageUrl = retryCount > 0 ? `${src}?retry=${retryCount}` : src;

  return (
    <div
      className={`rounded-full overflow-hidden relative ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className="object-cover"
        sizes={`${size}px`}
        loading="lazy"
        onError={handleError}
      />
    </div>
  );
}
