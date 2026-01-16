'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';

interface MobileServiceBottomBarProps {
  readonly serviceId: string;
  readonly sellerId: string;
  readonly sellerUserId: string;
  readonly initialIsFavorite?: boolean;
}

export default function MobileServiceBottomBar({
  serviceId,
  sellerId,
  sellerUserId,
  initialIsFavorite = false,
}: MobileServiceBottomBarProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);

  const handleFavorite = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();

      if (isFavorite) {
        // 찜 해제
        await supabase
          .from('service_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('service_id', serviceId);
        setIsFavorite(false);
      } else {
        // 찜 추가
        await supabase
          .from('service_favorites')
          .insert({ user_id: user.id, service_id: serviceId });
        setIsFavorite(true);
      }
    } catch (error) {
      logger.error('찜 처리 중 오류', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContact = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // 본인 서비스인 경우
    if (user.id === sellerUserId) {
      alert('본인의 서비스입니다.');
      return;
    }

    // 채팅 페이지로 이동
    router.push(`/chat?seller=${sellerId}&service=${serviceId}`);
  };

  const handlePurchase = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // 본인 서비스인 경우
    if (user.id === sellerUserId) {
      alert('본인의 서비스는 구매할 수 없습니다.');
      return;
    }

    // 결제 페이지로 이동
    router.push(`/payment?service=${serviceId}`);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center">
        {/* 찜 버튼 */}
        <button
          type="button"
          onClick={handleFavorite}
          disabled={isLoading}
          className="flex flex-col items-center justify-center w-14 h-12 border-r border-gray-200 hover:bg-gray-50 transition-colors"
          aria-label={isFavorite ? '찜 해제' : '찜하기'}
        >
          {isFavorite ? (
            <Heart className="w-6 h-6 text-red-500 fill-current" />
          ) : (
            <Heart className="w-6 h-6 text-gray-500" />
          )}
        </button>

        {/* 문의하기 버튼 */}
        <button
          type="button"
          onClick={handleContact}
          className="flex items-center justify-center gap-2 flex-1 h-12 border-r border-gray-200 text-brand-primary font-semibold hover:bg-brand-primary/5 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          문의하기
        </button>

        {/* 구매하기 버튼 */}
        <button
          type="button"
          onClick={handlePurchase}
          className="flex items-center justify-center flex-1 h-12 bg-brand-primary text-white font-semibold hover:bg-brand-dark transition-colors"
        >
          구매하기
        </button>
      </div>
    </div>
  );
}
