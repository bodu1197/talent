import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Search,
  CircleHelp,
  Megaphone,
  MessageSquare,
  Phone,
  ShoppingBag,
  Store,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: '고객센터 | 돌파구',
  description: '돌파구 고객센터입니다. FAQ, 공지사항, 1:1 문의 등을 통해 도움을 받으세요.',
  keywords: ['고객센터', '도움말', 'FAQ', '문의', '돌파구'],
  openGraph: {
    title: '고객센터 | 돌파구',
    description: '돌파구 고객센터입니다. FAQ, 공지사항, 1:1 문의 등을 통해 도움을 받으세요.',
    type: 'website',
    url: 'https://dolpagu.com/help',
    siteName: '돌파구',
  },
  alternates: {
    canonical: 'https://dolpagu.com/help',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HelpPage() {
  const mainMenus = [
    {
      icon: CircleHelp,
      title: '자주 묻는 질문',
      description: 'FAQ를 확인해보세요',
      href: '/help/faq',
    },
    {
      icon: Megaphone,
      title: '공지사항',
      description: '최신 소식을 확인하세요',
      href: '/help/notice',
    },
    {
      icon: MessageSquare,
      title: '1:1 문의',
      description: '직접 문의하기',
      href: '/help/contact',
    },
  ];

  const buyerGuides = [
    { title: '서비스 구매 방법', href: '/buyer/how-to-order' },
    { title: '결제 안내', href: '/buyer/payment' },
    { title: '환불 정책', href: '/buyer/refund' },
  ];

  const sellerGuides = [
    { title: '전문가 가이드', href: '/seller/guide' },
    { title: '수수료 안내', href: '/seller/commission' },
    { title: '정산 안내', href: '/mypage/seller/earnings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-primary to-brand-dark text-white py-10 md:py-12">
        <div className="container-1200 px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">고객센터</h1>
          <p className="text-base md:text-lg text-blue-100">무엇을 도와드릴까요?</p>
        </div>
      </section>

      {/* Search */}
      <section className="py-8 bg-white border-b">
        <div className="container-1200 px-4">
          <div className="max-w-lg mx-auto relative">
            <input
              id="help-search"
              name="help-search"
              type="text"
              placeholder="궁금하신 내용을 검색해보세요"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
              autoComplete="off"
            />
            <button
              aria-label="검색"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-primary"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Main Menus */}
      <section className="py-10 md:py-12">
        <div className="container-1200 px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {mainMenus.map((menu) => (
              <Link
                key={menu.title}
                href={menu.href}
                className="bg-white rounded-lg border border-gray-200 p-5 text-center hover:border-brand-primary hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-brand-primary/20 transition-colors">
                  <menu.icon className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="text-sm font-semibold mb-1">{menu.title}</h3>
                <p className="text-xs text-gray-500">{menu.description}</p>
              </Link>
            ))}
          </div>

          {/* Phone */}
          <div className="max-w-3xl mx-auto mt-4">
            <div className="bg-white rounded-lg border border-gray-200 p-5 text-center">
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-brand-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">전화 상담</p>
                  <p className="text-xs text-gray-500">070-8019-6077 (평일 10:00 - 19:00)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Guides */}
      <section className="py-10 md:py-12 bg-white">
        <div className="container-1200 px-4">
          <h2 className="text-lg md:text-xl font-bold text-center mb-6">카테고리별 도움말</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* Buyer Guide */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-brand-primary" />
                구매자 가이드
              </h3>
              <ul className="space-y-2">
                {buyerGuides.map((guide) => (
                  <li key={guide.href}>
                    <Link
                      href={guide.href}
                      className="flex items-center justify-between text-xs text-gray-600 hover:text-brand-primary transition-colors py-1"
                    >
                      <span>{guide.title}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Seller Guide */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Store className="w-4 h-4 text-brand-primary" />
                전문가 가이드
              </h3>
              <ul className="space-y-2">
                {sellerGuides.map((guide) => (
                  <li key={guide.href}>
                    <Link
                      href={guide.href}
                      className="flex items-center justify-between text-xs text-gray-600 hover:text-brand-primary transition-colors py-1"
                    >
                      <span>{guide.title}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
