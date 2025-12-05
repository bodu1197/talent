'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ErrandMypageLayout from '@/components/errands/ErrandMypageLayout';
import {
  Errand,
  ERRAND_CATEGORY_LABELS,
  ERRAND_STATUS_LABELS,
  SHOPPING_RANGE_LABELS,
  ShoppingRange,
} from '@/types/errand';
import { useAuth } from '@/components/providers/AuthProvider';

// 날짜 포맷팅 함수 (date-fns 대체)
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

interface ErrandDetailResponse {
  errand: Errand & {
    requester?: {
      id: string;
      name: string;
      avatar_url: string | null;
      profile_image: string | null;
    };
    helper?: {
      id: string;
      name: string;
      avatar_url: string | null;
      profile_image: string | null;
    } | null;
    stops?: Array<{
      id: string;
      stop_order: number;
      address: string;
      address_detail?: string;
      recipient_name?: string;
      recipient_phone?: string;
    }>;
  };
  applications?: Array<{
    id: string;
    message: string | null;
    proposed_price: number | null;
    created_at: string;
    helper: {
      id: string;
      grade: string;
      average_rating: number;
      total_completed: number;
      user: {
        id: string;
        name: string;
        avatar_url: string | null;
      };
    };
  }>;
}

// 상태별 색상 클래스
const statusColorClasses: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  MATCHED: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

export default function ErrandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [errand, setErrand] = useState<ErrandDetailResponse['errand'] | null>(null);
  const [applications, setApplications] = useState<ErrandDetailResponse['applications']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [hasHelperProfile, setHasHelperProfile] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const id = params?.id as string;

  // 권한 체크
  const isRequester = profile?.id === errand?.requester_id;
  const isHelper = profile?.id === errand?.helper_id;

  // 헬퍼 프로필 확인
  useEffect(() => {
    if (!user) return;

    const checkHelperProfile = async () => {
      try {
        const res = await fetch('/api/helper');
        if (res.ok) {
          const data = await res.json();
          setHasHelperProfile(!!data.helperProfile);
        }
      } catch {
        // 에러 무시
      }
    };

    checkHelperProfile();
  }, [user]);

  useEffect(() => {
    if (!id) return;

    const fetchErrand = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/errands/${id}`);

        if (!res.ok) {
          if (res.status === 404) {
            setError('심부름을 찾을 수 없습니다');
          } else {
            setError('심부름 정보를 불러올 수 없습니다');
          }
          return;
        }

        const data = await res.json();
        setErrand(data.errand);
        setApplications(data.applications || []);
        setHasApplied(data.hasApplied || false);
      } catch {
        setError('네트워크 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchErrand();
  }, [id, user]);

  // 심부름 취소
  const handleCancel = async () => {
    if (!confirm('정말로 심부름을 취소하시겠습니까?')) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/errands/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED', cancel_reason: '요청자 취소' }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || '취소에 실패했습니다');
        return;
      }

      const data = await res.json();
      setErrand((prev) => (prev ? { ...prev, ...data.errand } : null));
    } catch {
      alert('네트워크 오류가 발생했습니다');
    } finally {
      setActionLoading(false);
    }
  };

  // 심부름 삭제
  const handleDelete = async () => {
    if (!confirm('정말로 심부름을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/errands/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || '삭제에 실패했습니다');
        return;
      }

      router.push('/errands/mypage');
    } catch {
      alert('네트워크 오류가 발생했습니다');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !errand) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="text-gray-500 text-lg">{error || '심부름을 찾을 수 없습니다'}</div>
        <Link
          href="/errands"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <ErrandMypageLayout mode="requester">
      <div className="p-4 lg:p-0">
        {/* 메인 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* 헤더 */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                    {ERRAND_CATEGORY_LABELS[errand.category]}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${statusColorClasses[errand.status]}`}
                  >
                    {ERRAND_STATUS_LABELS[errand.status]}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{errand.title}</h1>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">총 요금</div>
                <div className="text-2xl font-bold text-blue-600">
                  {errand.total_price?.toLocaleString()}원
                </div>
              </div>
            </div>
          </div>

          {/* 설명 */}
          {errand.description && (
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-sm font-medium text-gray-500 mb-2">상세 설명</h2>
              <p className="text-gray-800 whitespace-pre-wrap">{errand.description}</p>
            </div>
          )}

          {/* 위치 정보 */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-500 mb-4">위치 정보</h2>
            <div className="space-y-4">
              {/* 출발지 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500">출발지</div>
                  <div className="text-gray-900 font-medium">{errand.pickup_address}</div>
                  {errand.pickup_detail && (
                    <div className="text-sm text-gray-600">{errand.pickup_detail}</div>
                  )}
                </div>
              </div>

              {/* 다중 배달 정차지 */}
              {errand.is_multi_stop && errand.stops && errand.stops.length > 0 && (
                <>
                  {errand.stops.map((stop, index) => (
                    <div key={stop.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-yellow-600">{index + 2}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-500">경유지 {index + 1}</div>
                        <div className="text-gray-900 font-medium">{stop.address}</div>
                        {stop.address_detail && (
                          <div className="text-sm text-gray-600">{stop.address_detail}</div>
                        )}
                        {stop.recipient_name && (
                          <div className="text-sm text-gray-600">
                            수령인: {stop.recipient_name} {stop.recipient_phone}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* 도착지 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500">도착지</div>
                  <div className="text-gray-900 font-medium">{errand.delivery_address}</div>
                  {errand.delivery_detail && (
                    <div className="text-sm text-gray-600">{errand.delivery_detail}</div>
                  )}
                </div>
              </div>

              {/* 거리 */}
              {errand.estimated_distance && (
                <div className="text-sm text-gray-500 mt-2">
                  예상 거리: {errand.estimated_distance.toFixed(1)}km
                </div>
              )}
            </div>
          </div>

          {/* 구매대행 품목 */}
          {errand.category === 'SHOPPING' &&
            errand.shopping_items &&
            errand.shopping_items.length > 0 && (
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-sm font-medium text-gray-500 mb-4">구매 품목</h2>
                {errand.shopping_range && (
                  <div className="mb-3 text-sm text-gray-600">
                    {SHOPPING_RANGE_LABELS[errand.shopping_range as ShoppingRange]}
                  </div>
                )}
                <div className="space-y-2">
                  {errand.shopping_items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-600">
                          {index + 1}
                        </span>
                        <span className="text-gray-900">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">x{item.quantity}</span>
                        {item.note && <span className="text-sm text-gray-500">({item.note})</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* 요금 상세 */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-500 mb-4">요금 상세</h2>
            <div className="space-y-2 text-sm">
              {/* 기본 요금 (할증 포함된 금액) */}
              <div className="flex justify-between">
                <span className="text-gray-600">심부름 요금</span>
                <span className="text-gray-900">
                  {(
                    (errand.total_price || 0) -
                    (errand.tip || 0) -
                    (errand.stop_fee || 0) -
                    (errand.range_fee || 0) -
                    (errand.item_fee || 0)
                  ).toLocaleString()}
                  원
                </span>
              </div>
              {/* 정차 요금 (다중 배달) */}
              {errand.stop_fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">정차 요금 ({errand.total_stops}곳)</span>
                  <span className="text-gray-900">{errand.stop_fee?.toLocaleString()}원</span>
                </div>
              )}
              {/* 범위 요금 (구매대행) */}
              {errand.range_fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">범위 요금</span>
                  <span className="text-gray-900">{errand.range_fee?.toLocaleString()}원</span>
                </div>
              )}
              {/* 품목 요금 (구매대행) */}
              {errand.item_fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">품목 요금</span>
                  <span className="text-gray-900">{errand.item_fee?.toLocaleString()}원</span>
                </div>
              )}
              {/* 팁 */}
              {errand.tip > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">팁</span>
                  <span className="text-blue-600">+{errand.tip?.toLocaleString()}원</span>
                </div>
              )}
              {/* 총 요금 */}
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold">
                <span className="text-gray-900">총 요금</span>
                <span className="text-blue-600">{errand.total_price?.toLocaleString()}원</span>
              </div>
            </div>
          </div>

          {/* 요청자 정보 */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-500 mb-4">요청자</h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                {errand.requester?.avatar_url || errand.requester?.profile_image ? (
                  <img
                    src={errand.requester.avatar_url || errand.requester.profile_image || ''}
                    alt={errand.requester.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg font-bold">
                    {errand.requester?.name?.[0]}
                  </div>
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900">{errand.requester?.name}</div>
              </div>
            </div>
          </div>

          {/* 헬퍼 정보 */}
          {errand.helper && (
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-sm font-medium text-gray-500 mb-4">라이더</h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                  {errand.helper?.avatar_url || errand.helper?.profile_image ? (
                    <img
                      src={errand.helper.avatar_url || errand.helper.profile_image || ''}
                      alt={errand.helper.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg font-bold">
                      {errand.helper?.name?.[0]}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{errand.helper?.name}</div>
                </div>
              </div>
            </div>
          )}

          {/* 시간 정보 */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-500 mb-4">시간 정보</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">요청 시간</span>
                <span className="text-gray-900">{formatDate(errand.created_at)}</span>
              </div>
              {errand.scheduled_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">예약 시간</span>
                  <span className="text-blue-600 font-medium">
                    {formatDate(errand.scheduled_at)}
                  </span>
                </div>
              )}
              {errand.started_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">시작 시간</span>
                  <span className="text-gray-900">{formatDate(errand.started_at)}</span>
                </div>
              )}
              {errand.completed_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">완료 시간</span>
                  <span className="text-green-600 font-medium">
                    {formatDate(errand.completed_at)}
                  </span>
                </div>
              )}
              {errand.cancelled_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">취소 시간</span>
                  <span className="text-red-600 font-medium">
                    {formatDate(errand.cancelled_at)}
                  </span>
                </div>
              )}
            </div>
            {errand.cancel_reason && (
              <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-700">
                취소 사유: {errand.cancel_reason}
              </div>
            )}
          </div>

          {/* 지원자 목록 (요청자만, OPEN 상태일 때만) */}
          {isRequester && errand.status === 'OPEN' && applications && applications.length > 0 && (
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-sm font-medium text-gray-500 mb-4">
                지원자 ({applications.length}명)
              </h2>
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                        {app.helper?.user?.avatar_url ? (
                          <img
                            src={app.helper.user.avatar_url}
                            alt={app.helper.user?.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                            {app.helper?.user?.name?.[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{app.helper?.user?.name}</div>
                        <div className="text-xs text-gray-500">
                          ⭐ {app.helper?.average_rating?.toFixed(1) || '-'} · 완료{' '}
                          {app.helper?.total_completed || 0}건
                        </div>
                      </div>
                    </div>
                    {app.proposed_price && (
                      <div className="text-blue-600 font-medium">
                        {app.proposed_price.toLocaleString()}원
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          {user && (
            <div className="p-6 flex flex-wrap gap-3">
              {/* 요청자 액션 */}
              {isRequester && errand.status === 'OPEN' && (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={actionLoading}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    심부름 취소
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                  >
                    삭제
                  </button>
                </>
              )}
              {isRequester && (errand.status === 'MATCHED' || errand.status === 'IN_PROGRESS') && (
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                >
                  심부름 취소
                </button>
              )}

              {/* 취소된 심부름 - 삭제/재요청 */}
              {isRequester && errand.status === 'CANCELLED' && (
                <>
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                  >
                    삭제
                  </button>
                  <Link
                    href="/errands/new"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    재요청
                  </Link>
                </>
              )}

              {/* 헬퍼 액션 */}
              {isHelper && errand.status === 'MATCHED' && (
                <button
                  onClick={async () => {
                    setActionLoading(true);
                    try {
                      const res = await fetch(`/api/errands/${id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'IN_PROGRESS' }),
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setErrand((prev) => (prev ? { ...prev, ...data.errand } : null));
                      }
                    } finally {
                      setActionLoading(false);
                    }
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  심부름 시작
                </button>
              )}
              {isHelper && errand.status === 'IN_PROGRESS' && (
                <button
                  onClick={async () => {
                    setActionLoading(true);
                    try {
                      const res = await fetch(`/api/errands/${id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'COMPLETED' }),
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setErrand((prev) => (prev ? { ...prev, ...data.errand } : null));
                      }
                    } finally {
                      setActionLoading(false);
                    }
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  완료 처리
                </button>
              )}

              {/* 헬퍼 지원하기 버튼 - 헬퍼 프로필이 없는 경우 */}
              {!isRequester &&
                !isHelper &&
                errand.status === 'OPEN' &&
                user &&
                !hasHelperProfile && (
                  <Link
                    href="/mypage/helper/register"
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-medium"
                  >
                    라이더 등록 후 지원하기
                  </Link>
                )}

              {/* 헬퍼 지원하기 버튼 - 헬퍼 프로필이 있고 이미 지원한 경우 */}
              {!isRequester &&
                !isHelper &&
                errand.status === 'OPEN' &&
                user &&
                hasHelperProfile &&
                hasApplied && (
                  <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg">
                    이미 지원함
                  </span>
                )}

              {/* 헬퍼 지원하기 버튼 - 헬퍼 프로필이 있고 아직 지원하지 않은 경우 */}
              {!isRequester &&
                !isHelper &&
                errand.status === 'OPEN' &&
                user &&
                hasHelperProfile &&
                !hasApplied && (
                  <Link
                    href={`/errands/${id}/apply`}
                    className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
                  >
                    심부름 지원하기
                  </Link>
                )}

              {/* 비로그인 사용자 */}
              {!user && errand.status === 'OPEN' && (
                <Link
                  href={`/login?redirect=/errands/${id}`}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
                >
                  로그인하고 지원하기
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </ErrandMypageLayout>
  );
}
