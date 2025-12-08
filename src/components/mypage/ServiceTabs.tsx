'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Bike, Store, ClipboardList } from 'lucide-react';

const LAST_SERVICE_KEY = 'dolpagu_last_mypage_service';

interface ServiceTabsProps {
  isRegisteredSeller?: boolean;
  isRegisteredHelper?: boolean;
}

type ServiceType = 'market-buyer' | 'market-seller' | 'errands-requester' | 'errands-helper';

export default function ServiceTabs({
  isRegisteredSeller = false,
  isRegisteredHelper = false,
}: ServiceTabsProps) {
  const pathname = usePathname();

  // 현재 활성 서비스 판단
  const getCurrentService = (): ServiceType => {
    if (pathname.startsWith('/mypage/seller')) return 'market-seller';
    if (pathname.startsWith('/mypage/buyer')) return 'market-buyer';
    if (pathname.startsWith('/mypage/helper')) return 'errands-helper';
    if (pathname.startsWith('/errands/mypage/helper')) return 'errands-helper';
    if (pathname.startsWith('/errands/mypage')) return 'errands-requester';
    return 'market-buyer';
  };

  const currentService = getCurrentService();

  const handleServiceClick = (service: 'market' | 'errands') => {
    localStorage.setItem(LAST_SERVICE_KEY, service);
  };

  const tabs = [
    {
      id: 'market-buyer' as ServiceType,
      label: '구매',
      href: '/mypage/buyer/dashboard',
      icon: ShoppingBag,
      service: 'market' as const,
      color: 'blue',
    },
    {
      id: 'market-seller' as ServiceType,
      label: '판매',
      href: isRegisteredSeller ? '/mypage/seller/dashboard' : '/mypage/seller/register',
      icon: Store,
      service: 'market' as const,
      color: 'blue',
      badge: !isRegisteredSeller ? '등록' : undefined,
    },
    {
      id: 'errands-requester' as ServiceType,
      label: '요청',
      href: '/errands/mypage',
      icon: ClipboardList,
      service: 'errands' as const,
      color: 'orange',
    },
    {
      id: 'errands-helper' as ServiceType,
      label: '라이더',
      href: isRegisteredHelper ? '/mypage/helper/dashboard' : '/errands/register',
      icon: Bike,
      service: 'errands' as const,
      color: 'orange',
      badge: !isRegisteredHelper ? '등록' : undefined,
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-[60px] lg:top-20 z-40">
      <div className="max-w-4xl mx-auto">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentService === tab.id;

            // 색상 클래스 결정
            const getColorClass = () => {
              if (tab.color === 'blue') {
                return isActive
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 hover:text-blue-600 border-transparent';
              }
              return isActive
                ? 'text-orange-600 border-orange-600'
                : 'text-gray-500 hover:text-orange-600 border-transparent';
            };
            const colorClass = getColorClass();

            return (
              <Link
                key={tab.id}
                href={tab.href}
                onClick={() => handleServiceClick(tab.service)}
                className={`flex-1 flex items-center justify-center gap-1 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${colorClass}`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                      tab.color === 'blue'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-orange-100 text-orange-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
