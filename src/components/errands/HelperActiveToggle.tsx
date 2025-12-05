'use client';

import { useState, useEffect } from 'react';
import { Power, Loader2, MapPin, AlertCircle } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface HelperActiveToggleProps {
  className?: string;
}

export default function HelperActiveToggle({ className = '' }: HelperActiveToggleProps) {
  const { user } = useAuth();
  const [isHelper, setIsHelper] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);

  // 라이더 프로필 조회
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchHelperProfile = async () => {
      const supabase = createClient();

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        setLoading(false);
        return;
      }

      const { data: helperProfile } = await supabase
        .from('helper_profiles')
        .select('is_active, subscription_status')
        .eq('profile_id', profile.id)
        .single();

      if (helperProfile) {
        setIsHelper(true);
        setIsActive(helperProfile.is_active);
        setSubscriptionStatus(helperProfile.subscription_status);
      }

      setLoading(false);
    };

    fetchHelperProfile();
  }, [user]);

  // 활성 상태 토글
  const handleToggle = async () => {
    if (!user || toggling) return;

    setToggling(true);
    try {
      const supabase = createClient();

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const newActiveState = !isActive;

      await supabase
        .from('helper_profiles')
        .update({ is_active: newActiveState })
        .eq('profile_id', profile.id);

      setIsActive(newActiveState);

      // 활성화 시 위치 업데이트 시도
      if (newActiveState) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- navigator.geolocation may not exist in some environments
        navigator.geolocation?.getCurrentPosition(
          async (position) => {
            await fetch('/api/helper/location', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }),
            });
          },
          () => {
            // 위치 권한 거부 시 무시
          }
        );
      }
    } finally {
      setToggling(false);
    }
  };

  // 로딩 중
  if (loading) {
    return null;
  }

  // 비로그인 사용자
  if (!user) {
    return null;
  }

  // 라이더가 아닌 경우
  if (!isHelper) {
    return (
      <div className={`bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">라이더로 활동하세요</p>
              <p className="text-green-100 text-xs">심부름 수행으로 수익을 올려보세요</p>
            </div>
          </div>
          <Link
            href="/helper/register"
            className="px-4 py-2 bg-white text-green-600 rounded-lg font-bold text-sm hover:bg-green-50 transition"
          >
            등록하기
          </Link>
        </div>
      </div>
    );
  }

  // 구독 만료된 경우
  const hasValidSubscription = subscriptionStatus === 'active' || subscriptionStatus === 'trial';
  if (!hasValidSubscription) {
    return (
      <div className={`bg-gray-100 rounded-xl p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="font-bold text-gray-700 text-sm">구독이 필요합니다</p>
              <p className="text-gray-500 text-xs">라이더 활동을 위해 구독을 시작하세요</p>
            </div>
          </div>
          <Link
            href="/errands/mypage/helper"
            className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold text-sm hover:bg-green-600 transition"
          >
            구독하기
          </Link>
        </div>
      </div>
    );
  }

  // 라이더 활성 토글
  return (
    <div
      className={`rounded-xl p-4 transition-colors ${isActive ? 'bg-green-500' : 'bg-gray-800'} ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isActive ? 'bg-white/20' : 'bg-gray-700'
            }`}
          >
            <MapPin className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
          </div>
          <div>
            <p className={`font-bold text-sm ${isActive ? 'text-white' : 'text-gray-200'}`}>
              {isActive ? '라이더 활동 중' : '라이더 활동 대기'}
            </p>
            <p className={`text-xs ${isActive ? 'text-green-100' : 'text-gray-400'}`}>
              {isActive ? '심부름 요청을 받을 수 있어요' : '활성화하면 요청을 받을 수 있어요'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isActive
              ? 'bg-white text-green-500 hover:bg-green-50'
              : 'bg-green-500 text-white hover:bg-green-400'
          } disabled:opacity-50`}
        >
          {toggling ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Power className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
