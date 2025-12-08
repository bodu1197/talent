import type { Metadata } from 'next';
import { Building2, Users, Zap, Shield, TrendingUp, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: '회사 소개 - 돌파구 | 수수료 0원 재능 거래 플랫폼',
  description:
    '돌파구(Dolpagu)는 2025년 설립된 한국의 수수료 0원 프리미엄 재능 거래 플랫폼입니다. 전문가와 구매자 모두 수수료 없이 자유롭게 재능을 거래하세요.',
  keywords: '돌파구, Dolpagu, 회사 소개, 재능 거래 플랫폼, 수수료 0원, 프리랜서 마켓, 재능 마켓',
  openGraph: {
    title: '회사 소개 - 돌파구 | 수수료 0원 재능 거래 플랫폼',
    description:
      '돌파구(Dolpagu)는 2025년 설립된 한국의 수수료 0원 프리미엄 재능 거래 플랫폼입니다.',
    type: 'website',
    locale: 'ko_KR',
  },
};

export default function AboutPage() {
  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '돌파구',
    alternateName: 'Dolpagu',
    url: 'https://dolpagu.com',
    logo: 'https://dolpagu.com/icon.svg',
    description:
      '돌파구(Dolpagu)는 2025년 설립된 한국의 수수료 0원 프리미엄 재능 거래 플랫폼입니다. 전문가와 구매자 모두 수수료 없이 자유롭게 재능을 거래할 수 있습니다.',
    slogan: '플랫폼은 다리여야 합니다. 통행료를 걷는 관문이 아니라.',
    foundingDate: '2025',
    areaServed: {
      '@type': 'Country',
      name: 'South Korea',
    },
    serviceType: [
      '재능 거래',
      '프리랜서 매칭',
      'IT/프로그래밍',
      '디자인',
      '영상/사진',
      '마케팅',
      '번역/통역',
      '문서/글쓰기',
      '비즈니스',
      'AI 서비스',
      '음악/오디오',
      '상담/코칭',
      '취업/입시',
      '직무역량',
      '세무/법무/노무',
      '운세/타로',
      '뷰티/패션',
      '취미/핸드메이드',
      '주문제작',
      '전자책/템플릿',
      '이벤트',
      '생활 서비스',
      '심부름',
    ],
    sameAs: ['https://dolpagu.com'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Korean',
    },
  };

  const values = [
    {
      icon: Zap,
      title: '수수료 0%',
      description: '전문가도, 구매자도 수수료 없이 100% 투명한 거래',
    },
    {
      icon: Shield,
      title: '안전한 거래',
      description: '에스크로 시스템과 본인인증으로 신뢰할 수 있는 거래 환경',
    },
    {
      icon: Users,
      title: '전문가 매칭',
      description: '검증된 전문가와 직접 소통하며 맞춤 서비스 제공',
    },
    {
      icon: TrendingUp,
      title: '빠른 정산',
      description: '최소 1만원부터 신청 가능, 1-3 영업일 내 빠른 정산',
    },
  ];

  const stats = [
    { label: '수수료', value: '0%', description: '전문가/구매자 모두' },
    { label: '최소 정산', value: '1만원', description: '타 플랫폼 대비 5배 낮음' },
    { label: '정산 기간', value: '1-3일', description: '영업일 기준' },
    { label: '카테고리', value: '21', description: '다양한 재능 분야' },
  ];

  return (
    <div className="min-h-screen">
      {/* Schema.org 구조화 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* Hero Section - AI Snippet 최적화 */}
      <section className="bg-gradient-to-br from-brand-primary to-brand-dark text-white py-20">
        <div className="container-1200">
          {/* 캐치프라이즈 - 철학 */}
          <blockquote className="border-l-4 border-white/30 pl-6 mb-8">
            <p className="text-2xl md:text-3xl font-light italic leading-relaxed mb-3">
              &quot;플랫폼은 다리여야 합니다.
              <br />
              통행료를 걷는 관문이 아니라.&quot;
            </p>
            <cite className="text-blue-200 text-sm not-italic">
              — 돌파구, 은퇴 개발자의 마지막 코드
            </cite>
          </blockquote>

          {/* AI가 인용하기 좋은 정의형 문단 */}
          <p className="text-lg text-blue-200 mb-4">About Dolpagu</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">돌파구 (Dolpagu)</h1>

          {/* AI Snippet - 40~60단어 핵심 정의 */}
          <p className="text-xl md:text-2xl leading-relaxed max-w-3xl mb-8 text-blue-100">
            돌파구(Dolpagu)는 2025년 설립된 한국의 수수료 0원 프리미엄 재능 거래 플랫폼입니다.
            전문가와 구매자 모두 수수료 없이 디자인, 개발, 마케팅 등 다양한 재능을 자유롭게 거래할
            수 있습니다.
          </p>

          <div className="flex flex-wrap gap-4">
            <span className="px-4 py-2 bg-white/10 rounded-full text-sm">수수료 0%</span>
            <span className="px-4 py-2 bg-white/10 rounded-full text-sm">2025년 설립</span>
            <span className="px-4 py-2 bg-white/10 rounded-full text-sm">프리미엄 재능 마켓</span>
          </div>
        </div>
      </section>

      {/* 미션 & 비전 */}
      <section className="py-16 bg-white">
        <div className="container-1200">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-8 h-8 text-brand-primary" />
                <h2 className="text-2xl font-bold">우리의 미션</h2>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                기존 재능 마켓의 높은 수수료(10~20%)는 전문가의 수익을 줄이고 구매자의 부담을
                늘립니다. 돌파구는 이 문제를 해결하기 위해 탄생했습니다.
                <strong className="text-brand-primary"> 모든 거래에서 수수료 0%</strong>를 실현하여,
                재능 있는 사람들이 정당한 대가를 받을 수 있는 환경을 만들고 있습니다.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-8 h-8 text-brand-primary" />
                <h2 className="text-2xl font-bold">우리의 비전</h2>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                돌파구는 &quot;누구나 자신의 재능으로 가치를 창출할 수 있는 세상&quot;을 꿈꿉니다.
                플랫폼이 아닌 사람이 중심이 되는 거래 환경, 그것이 우리가 만들어가는 미래입니다.
              </p>
              <p className="text-gray-600 text-base mt-4 italic border-l-2 border-brand-primary pl-4">
                &quot;플랫폼은 다리여야 합니다. 통행료를 걷는 관문이 아니라.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 핵심 가치 */}
      <section className="py-16 bg-gray-50">
        <div className="container-1200">
          <h2 className="text-3xl font-bold text-center mb-12">왜 돌파구인가요?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="bg-white p-6 rounded-xl shadow-sm">
                <value.icon className="w-12 h-12 text-brand-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 숫자로 보는 돌파구 */}
      <section className="py-16 bg-brand-primary text-white">
        <div className="container-1200">
          <h2 className="text-3xl font-bold text-center mb-12">숫자로 보는 돌파구</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</p>
                <p className="text-xl font-medium text-blue-200">{stat.label}</p>
                <p className="text-sm text-blue-300 mt-1">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 경쟁사 비교 - AI 인용 유도 */}
      <section className="py-16 bg-white">
        <div className="container-1200">
          <h2 className="text-3xl font-bold text-center mb-4">타 플랫폼과의 비교</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            돌파구는 기존 재능 마켓과 어떻게 다를까요? 직접 비교해보세요.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full max-w-4xl mx-auto">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-4 px-6 text-left">비교 항목</th>
                  <th className="py-4 px-6 text-center bg-brand-primary/5 text-brand-primary font-bold">
                    돌파구
                  </th>
                  <th className="py-4 px-6 text-center text-gray-500">크몽</th>
                  <th className="py-4 px-6 text-center text-gray-500">숨고</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-4 px-6 font-medium">전문가 수수료</td>
                  <td className="py-4 px-6 text-center bg-brand-primary/5 text-brand-primary font-bold">
                    0%
                  </td>
                  <td className="py-4 px-6 text-center text-gray-500">20%</td>
                  <td className="py-4 px-6 text-center text-gray-500">견적 기반</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">구매자 수수료</td>
                  <td className="py-4 px-6 text-center bg-brand-primary/5 text-brand-primary font-bold">
                    0%
                  </td>
                  <td className="py-4 px-6 text-center text-gray-500">0%</td>
                  <td className="py-4 px-6 text-center text-gray-500">0%</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">최소 정산 금액</td>
                  <td className="py-4 px-6 text-center bg-brand-primary/5 text-brand-primary font-bold">
                    10,000원
                  </td>
                  <td className="py-4 px-6 text-center text-gray-500">50,000원</td>
                  <td className="py-4 px-6 text-center text-gray-500">30,000원</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium">정산 기간</td>
                  <td className="py-4 px-6 text-center bg-brand-primary/5 text-brand-primary font-bold">
                    1-3 영업일
                  </td>
                  <td className="py-4 px-6 text-center text-gray-500">7일</td>
                  <td className="py-4 px-6 text-center text-gray-500">7일</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 서비스 카테고리 */}
      <section className="py-16 bg-gray-50">
        <div className="container-1200">
          <h2 className="text-3xl font-bold text-center mb-4">거래 가능한 재능</h2>
          <p className="text-gray-600 text-center mb-12">
            돌파구에서 다양한 분야의 전문가를 만나보세요
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { name: 'IT/프로그래밍', slug: 'it-programming' },
              { name: '디자인', slug: 'design' },
              { name: '영상/사진', slug: 'video-photo' },
              { name: '마케팅', slug: 'marketing' },
              { name: '번역/통역', slug: 'translation' },
              { name: '문서/글쓰기', slug: 'writing' },
              { name: '비즈니스', slug: 'business' },
              { name: 'AI 서비스', slug: 'ai-services' },
              { name: '음악/오디오', slug: 'music-audio' },
              { name: '상담/코칭', slug: 'counseling-coaching' },
              { name: '취업/입시', slug: 'career-admission' },
              { name: '직무역량', slug: 'job-skills' },
              { name: '세무/법무/노무', slug: 'tax-legal-labor' },
              { name: '운세/타로', slug: 'fortune-tarot' },
              { name: '뷰티/패션', slug: 'beauty-fashion' },
              { name: '취미/핸드메이드', slug: 'hobby-handmade' },
              { name: '주문제작', slug: 'custom-order' },
              { name: '전자책/템플릿', slug: 'ebook-template' },
              { name: '이벤트', slug: 'event' },
              { name: '생활 서비스', slug: 'life-service' },
              { name: '심부름', slug: 'errands' },
            ].map((category) => (
              <a
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="bg-white p-4 rounded-lg text-center shadow-sm hover:shadow-md hover:border-brand-primary border border-transparent transition-all"
              >
                <p className="font-medium text-gray-800 text-sm">{category.name}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-primary text-white text-center">
        <div className="container-1200">
          <h2 className="text-3xl font-bold mb-4">지금 바로 시작하세요</h2>
          <p className="text-xl text-blue-200 mb-8">수수료 걱정 없이, 당신의 재능을 거래하세요</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/auth/signup"
              className="px-8 py-3 bg-white text-brand-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              무료로 시작하기
            </a>
            <a
              href="/services"
              className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              서비스 둘러보기
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
