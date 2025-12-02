'use client';

import Link from 'next/link';

// 인라인 SVG 아이콘들
const ShieldLockIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
    />
  </svg>
);

const BadgeCheckIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
    />
  </svg>
);

const ChatBubbleIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
    />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
    />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  </svg>
);

// 4가지 약속 데이터
const promises = [
  {
    id: 'safe-payment',
    icon: ShieldLockIcon,
    title: '안전결제',
    description: '에스크로 시스템으로 결제 100% 보호',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100',
  },
  {
    id: 'verified-expert',
    icon: BadgeCheckIcon,
    title: '검증된 전문가',
    description: '신원 확인 및 자격 검증 완료',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-100',
  },
  {
    id: 'realtime-chat',
    icon: ChatBubbleIcon,
    title: '실시간 1:1 소통',
    description: '전문가와 직접 채팅 상담',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-100',
  },
  {
    id: 'satisfaction',
    icon: SparklesIcon,
    title: '만족 보장',
    description: '서비스 불만족시 100% 환불',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-100',
  },
];

// 온라인 카테고리 데이터
const categories = [
  { name: 'AI 서비스', href: '/search?category=ai', emoji: '🤖' },
  { name: 'IT/프로그래밍', href: '/search?category=it', emoji: '💻' },
  { name: '디자인', href: '/search?category=design', emoji: '🎨' },
  { name: '마케팅', href: '/search?category=marketing', emoji: '📊' },
  { name: '번역/통역', href: '/search?category=translation', emoji: '🌐' },
  { name: '문서/글쓰기', href: '/search?category=writing', emoji: '📝' },
  { name: '영상/사진', href: '/search?category=video', emoji: '🎬' },
  { name: '상담/코칭', href: '/search?category=consulting', emoji: '💬' },
  { name: '세무/법무', href: '/search?category=legal', emoji: '⚖️' },
  { name: '비즈니스', href: '/search?category=business', emoji: '💼' },
];

export default function FourthHeroBanner() {
  return (
    <section className="py-8 md:py-12 bg-gradient-to-b from-white via-blue-50/30 to-white">
      <div className="container-1200">
        {/* 헤더 */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-3">
            어떤 전문가가 필요하세요?
          </h2>
          <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto">
            안심하고 맡기세요, <span className="text-blue-600 font-medium">돌파구</span>가
            지켜드립니다
          </p>
        </div>

        {/* 4가지 약속 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10">
          {promises.map((promise) => {
            const IconComponent = promise.icon;
            return (
              <div
                key={promise.id}
                className={`group relative overflow-hidden rounded-2xl ${promise.bgColor} ${promise.borderColor} border p-4 md:p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
              >
                {/* 아이콘 */}
                <div
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white shadow-sm flex items-center justify-center ${promise.color} mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComponent />
                </div>

                {/* 텍스트 */}
                <h3 className={`font-bold text-base md:text-lg ${promise.color} mb-1`}>
                  {promise.title}
                </h3>
                <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                  {promise.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* 카테고리 섹션 */}
        <div className="mb-8">
          <p className="text-center text-gray-500 text-sm mb-4">이런 전문가를 찾아보세요</p>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
              >
                <span>{category.emoji}</span>
                <span>{category.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA 버튼 */}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-blue-600/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-600/30"
          >
            <SearchIcon />
            전문가 찾아보기
          </Link>
          <Link
            href="/expert/register"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-6 py-3.5 rounded-xl font-bold text-base transition-all duration-200"
          >
            전문가로 등록하기
          </Link>
        </div>
      </div>
    </section>
  );
}
