"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaSearch,
  FaBell,
  FaPlus,
  FaChevronDown,
  FaUser,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

export default function AdminHeader() {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  // ESC 키로 메뉴 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showUserMenu) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showUserMenu]);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex-shrink-0 z-20">
      <div className="h-full flex items-center justify-between px-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="사용자, 서비스, 주문 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-6">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FaBell className="text-gray-600 text-xl" />
          </button>

          {/* Quick Actions */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FaPlus className="text-gray-600 text-xl" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center text-white font-semibold">
                {user?.email?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-sm font-semibold text-gray-700">
                  {user?.email || "관리자"}
                </div>
                <div className="text-xs text-gray-500">관리자</div>
              </div>
              <FaChevronDown className="text-gray-400 text-sm" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <button
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setShowUserMenu(false)}
                  aria-label="메뉴 닫기"
                  type="button"
                ></button>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <Link
                    href="/mypage/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <FaUser className="w-5 inline-block mr-2" /> 프로필
                  </Link>
                  <Link
                    href="/admin/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <FaCog className="w-5 inline-block mr-2" /> 설정
                  </Link>
                  <hr className="my-2" />
                  <button
                    onClick={async () => {
                      await signOut();
                      router.push("/");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FaSignOutAlt className="w-5 inline-block mr-2" /> 로그아웃
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
