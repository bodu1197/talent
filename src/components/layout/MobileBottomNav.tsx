"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useChatUnreadCount } from "@/components/providers/ChatUnreadProvider";
import {
  FaHome,
  FaSearch,
  FaHeart,
  FaUser,
  FaArrowLeft,
  FaTimes,
} from "react-icons/fa";
import { FaRegComments } from "react-icons/fa";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const { unreadCount } = useChatUnreadCount();

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* 모바일 하단 네비게이션 - 모바일에서만 표시 */}
      <nav className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 lg:hidden z-50 shadow-lg">
        <div className="grid grid-cols-5 h-16 max-w-screen-sm mx-auto overflow-hidden">
          {/* 홈 */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              isActive("/") ? "text-brand-primary" : "text-gray-500"
            }`}
            aria-label="홈으로 이동"
            aria-current={isActive("/") ? "page" : undefined}
          >
            <FaHome className="text-xl" aria-hidden="true" />
            <span className="text-xs font-medium">홈</span>
          </Link>

          {/* 검색 */}
          <button
            onClick={() => setShowSearch(true)}
            className="flex flex-col items-center justify-center space-y-1 text-gray-500 transition-colors active:text-brand-primary"
            aria-label="검색 열기"
          >
            <FaSearch className="text-xl" aria-hidden="true" />
            <span className="text-xs font-medium">검색</span>
          </button>

          {/* 찜목록 */}
          <Link
            href={user ? "/mypage/buyer/favorites" : "/auth/login"}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              pathname === "/mypage/buyer/favorites"
                ? "text-brand-primary"
                : "text-gray-500"
            }`}
            aria-label="찜목록 보기"
            aria-current={
              pathname === "/mypage/buyer/favorites" ? "page" : undefined
            }
          >
            <FaHeart className="text-xl" aria-hidden="true" />
            <span className="text-xs font-medium">찜목록</span>
          </Link>

          {/* 메시지 */}
          <Link
            href={user ? "/chat" : "/auth/login"}
            className={`relative flex flex-col items-center justify-center space-y-1 transition-colors ${
              pathname.startsWith("/chat")
                ? "text-brand-primary"
                : "text-gray-500"
            }`}
            aria-label={unreadCount > 0 ? `메시지 ${unreadCount}개` : "메시지"}
            aria-current={pathname.startsWith("/chat") ? "page" : undefined}
          >
            <div className="relative">
              <FaRegComments className="text-xl" aria-hidden="true" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  aria-hidden="true"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">메시지</span>
          </Link>

          {/* 마이페이지 */}
          <Link
            href={user ? "/mypage/buyer/dashboard" : "/auth/login"}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              pathname.startsWith("/mypage")
                ? "text-brand-primary"
                : "text-gray-500"
            }`}
            aria-label="마이페이지로 이동"
            aria-current={pathname.startsWith("/mypage") ? "page" : undefined}
          >
            <FaUser className="text-xl" aria-hidden="true" />
            <span className="text-xs font-medium">마이페이지</span>
          </Link>
        </div>
      </nav>

      {/* 모바일 검색 오버레이 */}
      {showSearch && (
        <div className="fixed inset-0 bg-white z-50 lg:hidden">
          <div className="flex items-center p-4 border-b border-gray-200">
            <button
              aria-label="검색 닫기"
              onClick={() => setShowSearch(false)}
              className="mr-4"
            >
              <FaArrowLeft className="text-xl" aria-hidden="true" />
            </button>
            <div className="flex-1 relative">
              <label htmlFor="search-mobile" className="sr-only">
                서비스 검색
              </label>
              <input
                id="search-mobile"
                name="search"
                type="text"
                placeholder="찾으시는 재능을 검색해보세요"
                className="w-full px-4 py-2 pr-10 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                autoComplete="off"
                autoFocus
                aria-label="서비스 검색"
              />
              <button
                aria-label="검색 실행"
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <FaSearch className="text-gray-500" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-semibold mb-4">인기 검색어</h3>
            <div className="flex flex-wrap gap-2">
              {[
                "로고 디자인",
                "AI 이미지",
                "영상 편집",
                "번역",
                "블로그 작성",
                "PPT 디자인",
              ].map((keyword) => (
                <button
                  key={keyword}
                  className="px-3 py-1.5 bg-gray-100 rounded-full text-sm hover:bg-gray-200 hover:text-brand-primary"
                  onClick={() => {
                    // 검색 실행
                    setShowSearch(false);
                  }}
                  aria-label={`${keyword} 검색하기`}
                >
                  {keyword}
                </button>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="font-semibold mb-4">최근 검색</h3>
              <ul className="space-y-3">
                <li className="flex items-center justify-between">
                  <span className="text-gray-600">웹 개발</span>
                  <button
                    aria-label="웹 개발 검색 기록 삭제"
                    className="text-gray-400"
                  >
                    <FaTimes className="text-sm" aria-hidden="true" />
                  </button>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-gray-600">로고 디자인</span>
                  <button
                    aria-label="로고 디자인 검색 기록 삭제"
                    className="text-gray-400"
                  >
                    <FaTimes className="text-sm" aria-hidden="true" />
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
