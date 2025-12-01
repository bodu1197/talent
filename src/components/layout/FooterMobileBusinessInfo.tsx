'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FooterMobileBusinessInfo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="px-5 pt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 text-mobile-md font-semibold text-gray-800 focus:outline-none"
        aria-expanded={isOpen}
        aria-label="사업자정보 토글"
      >
        <span>돌파구 사업자정보</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-600 transition-transform" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-600 transition-transform" />
        )}
      </button>

      {/* 드롭다운 내용 */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="text-mobile-sm text-gray-600 space-y-1.5 pb-3">
          <p>대표이사: 배미미</p>
          <p>사업자등록번호: 363-06-01936</p>
          <p>통신판매업신고번호: 제 2022-경기광명-1283호</p>
          <p>주소: 서울시 마포구 월드컵로 81 3층</p>
          <p>고객센터: dolpagu@dolpagu.com</p>
          <p>운영시간: 주말 및 공휴일 휴무 / 오전 10시 ~ 오후 7시</p>
          <p className="mt-3 text-gray-500 text-[11px]">
            (주)플랫폼몬스터에서 결제된 예약금 환불 관련한 의무 및 책임은 저희 플랫폼몬스터에
            있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
