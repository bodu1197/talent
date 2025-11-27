'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  Star,
  FileText,
  Package,
  Wallet,
  BarChart3,
  Image,
  User,
  Settings,
  Bell,
  Megaphone,
} from 'lucide-react';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const buyerMenuItems: MenuItem[] = [
  { label: '주문내역', href: '/mypage/buyer/orders', icon: <ShoppingBag className="w-6 h-6" /> },
  { label: '찜한서비스', href: '/mypage/buyer/favorites', icon: <Heart className="w-6 h-6" /> },
  { label: '리뷰관리', href: '/mypage/buyer/reviews', icon: <Star className="w-6 h-6" /> },
  { label: '견적요청', href: '/mypage/buyer/quotes', icon: <FileText className="w-6 h-6" /> },
  { label: '알림', href: '/mypage/notifications', icon: <Bell className="w-6 h-6" /> },
  { label: '설정', href: '/mypage/settings', icon: <Settings className="w-6 h-6" /> },
];

const sellerMenuItems: MenuItem[] = [
  { label: '서비스관리', href: '/mypage/seller/services', icon: <Package className="w-6 h-6" /> },
  { label: '주문관리', href: '/mypage/seller/orders', icon: <ShoppingBag className="w-6 h-6" /> },
  { label: '정산관리', href: '/mypage/seller/earnings', icon: <Wallet className="w-6 h-6" /> },
  { label: '통계', href: '/mypage/seller/statistics', icon: <BarChart3 className="w-6 h-6" /> },
  { label: '포트폴리오', href: '/mypage/seller/portfolio', icon: <Image className="w-6 h-6" /> },
  { label: '리뷰관리', href: '/mypage/seller/reviews', icon: <Star className="w-6 h-6" /> },
  {
    label: '광고관리',
    href: '/mypage/seller/advertising',
    icon: <Megaphone className="w-6 h-6" />,
  },
  { label: '프로필', href: '/mypage/seller/profile', icon: <User className="w-6 h-6" /> },
  { label: '알림', href: '/mypage/notifications', icon: <Bell className="w-6 h-6" /> },
  { label: '설정', href: '/mypage/settings', icon: <Settings className="w-6 h-6" /> },
];

interface Props {
  readonly currentRole: 'buyer' | 'seller';
  readonly onRoleChange: (role: 'buyer' | 'seller') => void;
  readonly isSeller: boolean;
}

export default function MobileMyPageNav({ currentRole, onRoleChange, isSeller: _isSeller }: Props) {
  const pathname = usePathname();
  const menuItems = currentRole === 'seller' ? sellerMenuItems : buyerMenuItems;

  return (
    <div className="lg:hidden">
      {/* 판매자/구매자 토글 - 항상 표시 */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
        <button
          onClick={() => onRoleChange('seller')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-colors ${
            currentRole === 'seller' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500'
          }`}
        >
          판매자
        </button>
        <button
          onClick={() => onRoleChange('buyer')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-colors ${
            currentRole === 'buyer' ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500'
          }`}
        >
          구매자
        </button>
      </div>

      {/* 메뉴 그리드 */}
      <div className="grid grid-cols-4 gap-3">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center p-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1.5 font-medium text-center">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
