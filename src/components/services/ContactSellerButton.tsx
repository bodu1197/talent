'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

interface Props {
  readonly sellerId: string;
  readonly serviceId: string;
}

export default function ContactSellerButton({ sellerId, serviceId }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleContact = async () => {
    try {
      setIsLoading(true);

      // 채팅방 생성 또는 기존 채팅방 가져오기
      const response = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seller_id: sellerId,
          service_id: serviceId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 401) {
          // 로그인 필요
          router.push('/auth/login?redirect=/services/' + serviceId);
          return;
        }
        throw new Error(error.error || '채팅방 생성 실패');
      }

      const { room_id } = await response.json();

      // 채팅 메인 페이지로 이동 (해당 채팅방 선택된 상태)
      router.push(`/chat?room=${room_id}`);
    } catch (error) {
      logger.error('Contact seller error:', error);
      toast.error('문의 시작에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleContact}
      disabled={isLoading}
      className="w-full py-3 bg-white border border-brand-primary text-brand-primary rounded-lg font-medium hover:bg-brand-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
    >
      {isLoading ? (
        <span>
          <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
          처리 중...
        </span>
      ) : (
        <span>
          <MessageCircle className="w-4 h-4 mr-2 inline" />
          전문가에게 문의하기
        </span>
      )}
    </button>
  );
}
