'use client';

import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import Link from 'next/link';
import { Quote } from '@/types/common';
import { Plus, FileText } from 'lucide-react';

interface BuyerQuotesClientProps {
  readonly quotes: Quote[];
}

export default function BuyerQuotesClient({ quotes }: BuyerQuotesClientProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기중';
      case 'received':
        return '답변 도착';
      case 'selected':
        return '선택 완료';
      case 'cancelled':
        return '취소됨';
      default:
        return status;
    }
  };

  return (
    <MypageLayoutWrapper mode="buyer">
      <div className="py-4 px-4 lg:py-8 lg:px-6">
        <div className="mb-4 lg:mb-6">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-base lg:text-lg font-semibold text-gray-900">견적 요청 내역</h1>
              <p className="text-gray-600 mt-1 text-sm">맞춤 견적 요청을 관리하세요</p>
            </div>
            <button
              disabled
              className="px-3 py-1.5 lg:px-4 lg:py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-xs lg:text-sm font-medium whitespace-nowrap"
              title="견적 요청 기능은 준비 중입니다"
            >
              <Plus className="w-3 h-3 lg:w-4 lg:h-4 mr-1 inline" />
              <span className="hidden sm:inline">견적 요청 </span>(준비중)
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {quotes.length > 0 ? (
            quotes.map((quote) => (
              <div key={quote.id} className="bg-white border border-gray-200 rounded-lg p-3 lg:p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {quote.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          (quote.response_count || 0) > 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {(quote.response_count || 0) > 0
                          ? '답변 도착'
                          : getStatusLabel(quote.status)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {quote.category?.name || '기타'} •{' '}
                      {new Date(quote.created_at).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                  {(quote.response_count || 0) > 0 && (
                    <div className="text-right ml-2">
                      <div className="text-lg lg:text-xl font-semibold text-brand-primary">
                        {quote.response_count}
                      </div>
                      <div className="text-xs text-gray-600">답변</div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/mypage/buyer/quotes/${quote.id}`}
                    className="px-3 py-1.5 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-xs font-medium"
                  >
                    상세보기
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-3 text-sm">등록한 견적 요청이 없습니다</p>
              <button
                disabled
                className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-sm font-medium"
                title="견적 요청 기능은 준비 중입니다"
              >
                <Plus className="w-4 h-4 mr-1" />
                견적 요청 (준비중)
              </button>
            </div>
          )}
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
