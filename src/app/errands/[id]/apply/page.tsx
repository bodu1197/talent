'use client';

import { logger } from '@/lib/logger';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { Errand, ERRAND_CATEGORY_LABELS } from '@/types/errand';
import ErrandMypageLayout from '@/components/errands/ErrandMypageLayout';

export default function ErrandApplyPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [errand, setErrand] = useState<Errand | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 지원 폼 상태
  const [message, setMessage] = useState('');
  const [proposedPrice, setProposedPrice] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const id = params?.id as string;

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

        // 이미 마감된 심부름인지 확인
        if (data.errand.status !== 'OPEN') {
          setError('이미 마감된 심부름입니다');
        }

        // 본인 심부름인지 확인
        if (data.errand.requester_id === profile?.id) {
          setError('본인의 심부름에는 지원할 수 없습니다');
        }
      } catch {
        setError('네트워크 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchErrand();
  }, [id, profile?.id]);

  // 지원 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push(`/login?redirect=/errands/${id}/apply`);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/errands/${id}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim() || null,
          proposed_price: proposedPrice,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.error || '지원에 실패했습니다';
        setSubmitError(errorMsg);
        logger.error('지원 실패:', data);
        return;
      }

      // 성공 시 채팅 페이지로 바로 이동
      router.push(`/errands/${id}/chat`);
    } catch (err) {
      logger.error('네트워크 오류:', err);
      setSubmitError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ErrandMypageLayout mode="helper">
        <div className="p-4 lg:p-0 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
        </div>
      </ErrandMypageLayout>
    );
  }

  if (error || !errand) {
    return (
      <ErrandMypageLayout mode="helper">
        <div className="p-4 lg:p-0 flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="text-gray-500 text-lg">{error || '심부름을 찾을 수 없습니다'}</div>
          <Link
            href={`/errands/${id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            상세 페이지로 돌아가기
          </Link>
        </div>
      </ErrandMypageLayout>
    );
  }

  if (!user) {
    return (
      <ErrandMypageLayout mode="helper">
        <div className="p-4 lg:p-0 flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="text-gray-500 text-lg">로그인이 필요합니다</div>
          <Link
            href={`/login?redirect=/errands/${id}/apply`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            로그인하기
          </Link>
        </div>
      </ErrandMypageLayout>
    );
  }

  return (
    <ErrandMypageLayout mode="helper">
      <div className="p-4 lg:p-0">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">심부름 수락</h1>
          <p className="text-gray-600 mt-1">심부름을 수락하고 수익을 올려보세요</p>
        </div>

        <div className="max-w-2xl">
          {/* 심부름 요약 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                {ERRAND_CATEGORY_LABELS[errand.category]}
              </span>
              <span className="text-blue-600 font-bold text-lg">
                {errand.total_price?.toLocaleString()}원
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">{errand.title}</h1>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-green-600">출발</span>
                <span>{errand.pickup_address}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-600">도착</span>
                <span>{errand.delivery_address}</span>
              </div>
            </div>
          </div>

          {/* 수락 폼 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">심부름 수락하기</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 에러 메시지 */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                  <p className="font-medium">지원 실패</p>
                  <p className="text-sm mt-1">{submitError}</p>
                </div>
              )}

              {/* 메시지 */}
              <div>
                <label
                  htmlFor="apply-message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  지원 메시지 (선택)
                </label>
                <textarea
                  id="apply-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="요청자에게 전달할 메시지를 입력하세요. 예: 빠르게 배달해드리겠습니다!"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                  maxLength={500}
                />
                <div className="text-sm text-gray-500 mt-1 text-right">{message.length}/500</div>
              </div>

              {/* 제안 금액 */}
              <div>
                <label
                  htmlFor="proposed-price"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  제안 금액 (선택)
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  요청자의 제시 금액: {errand.total_price?.toLocaleString()}원
                </p>
                <div className="relative">
                  <input
                    id="proposed-price"
                    type="number"
                    value={proposedPrice ?? ''}
                    onChange={(e) =>
                      setProposedPrice(e.target.value ? Number.parseInt(e.target.value, 10) : null)
                    }
                    placeholder="다른 금액을 제안하려면 입력하세요"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                    min={1000}
                    step={100}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    원
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  비워두면 요청자의 제시 금액으로 지원합니다
                </p>
              </div>

              {/* 안내 */}
              <div className="bg-green-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-green-800 mb-2">수락 안내</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• 수락하면 바로 심부름이 배정됩니다</li>
                  <li>• 심부름 완료 후 요금이 정산됩니다</li>
                  <li>• 수락 후 취소 시 패널티가 있을 수 있습니다</li>
                </ul>
              </div>

              {/* 제출 버튼 */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    수락 중...
                  </span>
                ) : (
                  '수락하기'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </ErrandMypageLayout>
  );
}
