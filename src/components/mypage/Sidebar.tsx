"use client";

import ProfileImage from "@/components/common/ProfileImage";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaChartLine,
  FaBox,
  FaShoppingBag,
  FaFolderOpen,
  FaStar,
  FaDollarSign,
  FaBullhorn,
  FaIdCard,
  FaChartBar,
  FaUserPlus,
  FaUserCircle,
  FaChartPie,
  FaShoppingCart,
  FaFileInvoice,
  FaHeart,
  FaUser,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";

// Icon mapping helper
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "fa-chart-line": FaChartLine,
  "fa-box": FaBox,
  "fa-shopping-bag": FaShoppingBag,
  "fa-folder-open": FaFolderOpen,
  "fa-star": FaStar,
  "fa-sack-dollar": FaDollarSign,
  "fa-bullhorn": FaBullhorn,
  "fa-id-card": FaIdCard,
  "fa-chart-bar": FaChartBar,
  "fa-user-plus": FaUserPlus,
  "fa-user-circle": FaUserCircle,
  "fa-chart-pie": FaChartPie,
  "fa-shopping-cart": FaShoppingCart,
  "fa-file-invoice": FaFileInvoice,
  "fa-heart": FaHeart,
  "fa-user": FaUser,
};

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  children?: NavItem[];
}

interface SidebarProps {
  mode: "seller" | "buyer";
  profileData?: {
    name: string;
    profile_image?: string | null;
  } | null;
}

const sellerNavItems: NavItem[] = [
  {
    label: "판매 대시보드",
    href: "/mypage/seller/dashboard",
    icon: "fa-chart-line",
  },
  {
    label: "주문 관리",
    href: "/mypage/seller/orders",
    icon: "fa-box",
    children: [
      {
        label: "신규 주문",
        href: "/mypage/seller/orders?status=paid",
        icon: "",
        badge: 0,
      },
      {
        label: "진행중",
        href: "/mypage/seller/orders?status=in_progress",
        icon: "",
      },
      {
        label: "수정 요청",
        href: "/mypage/seller/orders?status=revision",
        icon: "",
      },
      {
        label: "완료 대기",
        href: "/mypage/seller/orders?status=delivered",
        icon: "",
      },
      {
        label: "완료",
        href: "/mypage/seller/orders?status=completed",
        icon: "",
      },
      {
        label: "취소/환불",
        href: "/mypage/seller/orders?status=cancelled",
        icon: "",
      },
    ],
  },
  {
    label: "서비스 관리",
    href: "/mypage/seller/services",
    icon: "fa-shopping-bag",
    children: [
      { label: "내 서비스", href: "/mypage/seller/services", icon: "" },
      { label: "서비스 등록", href: "/mypage/seller/services/new", icon: "" },
    ],
  },
  {
    label: "포트폴리오",
    href: "/mypage/seller/portfolio",
    icon: "fa-folder-open",
  },
  {
    label: "리뷰 관리",
    href: "/mypage/seller/reviews",
    icon: "fa-star",
    badge: 0,
  },
  {
    label: "수익 관리",
    href: "/mypage/seller/earnings",
    icon: "fa-sack-dollar",
    children: [
      { label: "정산 내역", href: "/mypage/seller/earnings", icon: "" },
      { label: "출금 내역", href: "/mypage/seller/earnings/history", icon: "" },
    ],
  },
  {
    label: "광고 관리",
    href: "/mypage/seller/advertising",
    icon: "fa-bullhorn",
  },
  {
    label: "판매자 정보",
    href: "/mypage/seller/profile",
    icon: "fa-id-card",
  },
  {
    label: "통계/분석",
    href: "/mypage/seller/statistics",
    icon: "fa-chart-bar",
  },
  {
    label: "판매자 등록",
    href: "/mypage/seller/register",
    icon: "fa-user-plus",
  },
  {
    label: "기본정보",
    href: "/mypage/settings",
    icon: "fa-user-circle",
  },
];

const buyerNavItems: NavItem[] = [
  {
    label: "구매 대시보드",
    href: "/mypage/buyer/dashboard",
    icon: "fa-chart-pie",
  },
  {
    label: "주문 내역",
    href: "/mypage/buyer/orders",
    icon: "fa-shopping-cart",
    children: [
      { label: "전체", href: "/mypage/buyer/orders", icon: "" },
      {
        label: "결제완료",
        href: "/mypage/buyer/orders?status=paid",
        icon: "",
        badge: 0,
      },
      {
        label: "진행중",
        href: "/mypage/buyer/orders?status=in_progress",
        icon: "",
        badge: 0,
      },
      {
        label: "수정 요청",
        href: "/mypage/buyer/orders?status=revision",
        icon: "",
        badge: 0,
      },
      {
        label: "도착 확인 대기",
        href: "/mypage/buyer/orders?status=delivered",
        icon: "",
        badge: 0,
      },
      {
        label: "완료",
        href: "/mypage/buyer/orders?status=completed",
        icon: "",
      },
      {
        label: "취소/환불",
        href: "/mypage/buyer/orders?status=cancelled",
        icon: "",
      },
    ],
  },
  {
    label: "견적 요청 내역",
    href: "/mypage/buyer/quotes",
    icon: "fa-file-invoice",
  },
  {
    label: "리뷰 관리",
    href: "/mypage/buyer/reviews",
    icon: "fa-star",
    children: [
      {
        label: "작성 가능",
        href: "/mypage/buyer/reviews?tab=pending",
        icon: "",
        badge: 0,
      },
      {
        label: "작성한 리뷰",
        href: "/mypage/buyer/reviews?tab=written",
        icon: "",
      },
    ],
  },
  {
    label: "찜 목록",
    href: "/mypage/buyer/favorites",
    icon: "fa-heart",
  },
  {
    label: "기본정보",
    href: "/mypage/settings",
    icon: "fa-user-circle",
  },
];

export default function Sidebar({ mode, profileData }: SidebarProps) {
  const pathname = usePathname();
  const navItems = mode === "seller" ? sellerNavItems : buyerNavItems;

  // Initialize with currently active parent items expanded
  const getInitialExpandedItems = () => {
    const expanded = new Set<string>();
    navItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => {
          if (child.href === pathname) return true;
          if (pathname.startsWith(child.href) && child.href !== "/mypage")
            return true;
          return false;
        });
        if (hasActiveChild) {
          expanded.add(item.href);
        }
      }
    });
    return expanded;
  };

  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    getInitialExpandedItems,
  );

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(href)) {
        newSet.delete(href);
      } else {
        newSet.add(href);
      }
      return newSet;
    });
  };

  const isActive = (href: string) => {
    if (href === pathname) return true;
    if (pathname.startsWith(href) && href !== "/mypage") return true;
    return false;
  };

  return (
    <aside className="hidden lg:flex w-64 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto flex-col">
      <div className="p-4 flex-1">
        {/* 프로필 정보 카드 */}
        <div className="mb-4">
          <Link
            href={
              mode === "seller" ? "/mypage/seller/profile" : "/mypage/settings"
            }
            className="flex items-center gap-3 w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 card-interactive"
          >
            <ProfileImage
              src={profileData?.profile_image}
              alt={profileData?.name || "회원"}
              size={48}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {profileData?.name || "회원"}
              </p>
              <p className="text-xs text-gray-500">
                {mode === "seller" ? "전문가 프로필" : "프로필 설정"}
              </p>
            </div>
            <FaChevronRight className="text-gray-400 text-sm" />
          </Link>
        </div>

        {/* 모드 전환 버튼 */}
        <div className="mb-6">
          <Link
            href={
              mode === "seller"
                ? "/mypage/buyer/dashboard"
                : "/mypage/seller/dashboard"
            }
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium click-pop btn-ripple"
          >
            {mode === "seller" ? <FaShoppingCart /> : <FaShoppingBag />}
            <span>
              {mode === "seller" ? "구매자 페이지로" : "판매자 페이지로"}
            </span>
            <FaChevronRight className="text-xs" />
          </Link>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav>
          {navItems.map((item) => (
            <div key={item.href} className="mb-1">
              {/* 메인 아이템 */}
              {item.children ? (
                // 하위 메뉴가 있는 경우: button로 렌더링하고 클릭 시 확장/축소만
                <button
                  type="button"
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg cursor-pointer transition-colors w-full ${
                    isActive(item.href)
                      ? "bg-brand-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => toggleExpand(item.href)}
                  aria-expanded={expandedItems.has(item.href)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {React.createElement(iconMap[item.icon] || FaUser, {
                      className: "text-base",
                    })}
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full badge-pulse">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <FaChevronDown
                    className={`text-xs transition-transform duration-200 ${
                      expandedItems.has(item.href) ? "rotate-180" : ""
                    }`}
                  />
                </button>
              ) : (
                // 하위 메뉴가 없는 경우: Link로 렌더링하여 정상 네비게이션
                <Link
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? "bg-brand-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {React.createElement(iconMap[item.icon] || FaUser, {
                      className: "text-base",
                    })}
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full badge-pulse">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              )}

              {/* 하위 메뉴 */}
              {item.children && (
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedItems.has(item.href)
                      ? "max-h-[500px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="ml-4 mt-1 border-l-2 border-gray-200 pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center justify-between px-3 py-2 text-sm rounded transition-colors ${
                          isActive(child.href)
                            ? "text-brand-primary font-medium bg-blue-50"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        <span>{child.label}</span>
                        {child.badge !== undefined && child.badge > 0 && (
                          <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                            {child.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
