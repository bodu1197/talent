"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  FaUser,
  FaTh,
  FaRobot,
  FaCode,
  FaPalette,
  FaBullhorn,
  FaUserPlus,
  FaQuestionCircle,
  FaEnvelope,
  FaInfoCircle,
  FaFileContract,
  FaShieldAlt,
  FaChevronRight,
} from "react-icons/fa";

export default function MenuPage() {
  const { user, signOut } = useAuth();

  const menuSections = [
    {
      title: "서비스",
      items: [
        { name: "전체 카테고리", href: "/categories", icon: FaTh },
        { name: "AI 서비스", href: "/categories/ai-services", icon: FaRobot },
        {
          name: "IT/프로그래밍",
          href: "/categories/it-programming",
          icon: FaCode,
        },
        { name: "디자인", href: "/categories/design", icon: FaPalette },
        { name: "마케팅", href: "/categories/marketing", icon: FaBullhorn },
      ],
    },
    {
      title: "전문가",
      items: [
        { name: "전문가 등록", href: "/expert/register", icon: FaUserPlus },
      ],
    },
    {
      title: "고객센터",
      items: [
        { name: "공지사항", href: "/help/notice", icon: FaBullhorn },
        { name: "자주 묻는 질문", href: "/help/faq", icon: FaQuestionCircle },
        { name: "문의하기", href: "/help/contact", icon: FaEnvelope },
      ],
    },
    {
      title: "정보",
      items: [
        { name: "서비스 소개", href: "/about", icon: FaInfoCircle },
        { name: "이용약관", href: "/terms", icon: FaFileContract },
        { name: "개인정보처리방침", href: "/privacy", icon: FaShieldAlt },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-1200 px-4">
        {/* 사용자 정보 */}
        {user ? (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <FaUser className="text-2xl text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{user.email}</p>
                  <Link
                    href="/mypage/buyer/dashboard"
                    className="text-sm text-brand-primary hover:underline"
                  >
                    마이페이지로 이동
                  </Link>
                </div>
              </div>
              <button
                onClick={signOut}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                로그아웃
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                로그인하고 더 많은 서비스를 이용하세요
              </p>
              <div className="flex gap-3 justify-center">
                <Link
                  href="/auth/login"
                  className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/auth/register"
                  className="px-6 py-2 border border-brand-primary text-brand-primary rounded-lg hover:bg-gray-50 transition-colors"
                >
                  회원가입
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 메뉴 섹션들 */}
        <div className="space-y-6">
          {menuSections.map((section) => (
            <div
              key={section.title}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">{section.title}</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {section.items.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="text-gray-600 w-5" />
                        <span className="text-gray-900">{item.name}</span>
                      </div>
                      <FaChevronRight className="text-gray-400 text-sm" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 앱 정보 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>AI Talent Hub v1.0.0</p>
          <p className="mt-1">© 2025 AI Talent Hub. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
