"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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
          isOpen ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
        }`}
      >
        <div className="text-mobile-sm text-gray-600 space-y-1.5 pb-3">
          <p>대표이사: 홍길동</p>
          <p>사업자등록번호: 123-45-67890</p>
          <p>통신판매업신고번호: 2025-서울강남-00000</p>
          <p>주소: 서울특별시 강남구 테헤란로 123 AI빌딩 5층</p>
          <p>고객센터: 1234-5678</p>
          <p>이메일: contact@dolpagu.com</p>
        </div>
      </div>
    </div>
  );
}
