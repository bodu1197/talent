'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CategoryItem } from '@/lib/categories';
import {
  FaRobot,
  FaImage,
  FaBlog,
  FaVideo,
  FaStar,
  FaLightbulb,
  FaChartLine,
  FaMagic,
} from 'react-icons/fa';

interface AIPageContentProps {
  readonly aiCategories: CategoryItem[];
}

export default function AIPageContent({ aiCategories }: AIPageContentProps) {
  const [activeSection, setActiveSection] = useState('categories');

  // 섹션으로 스크롤
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 히어로 섹션 */}
      <section className="relative bg-brand-primary text-white py-20">
        <div className="container-1200">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-[40px] font-bold mb-6">
              AI로 새로운 가능성을 <br />
              <span className="text-blue-200">이어주는 돌파구 AI 서비스</span>
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              업무 자동화부터 콘텐츠 제작까지, AI 전문가와 함께 시작하세요
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="#categories"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('categories');
                }}
                className="px-8 py-4 bg-white text-brand-primary rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                AI 서비스 둘러보기
              </Link>
              <Link
                href="#experts"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('experts');
                }}
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-brand-primary transition-colors"
              >
                AI 전문가 만나기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 스티키 네비게이션 */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container-1200">
          <div className="flex gap-8 py-4">
            <button
              onClick={() => scrollToSection('categories')}
              className={`pb-2 font-medium transition-colors ${
                activeSection === 'categories'
                  ? 'text-brand-primary border-b-2 border-brand-primary'
                  : 'text-gray-600 hover:text-brand-primary'
              }`}
            >
              AI 카테고리
            </button>
            <button
              onClick={() => scrollToSection('cases')}
              className={`pb-2 font-medium transition-colors ${
                activeSection === 'cases'
                  ? 'text-brand-primary border-b-2 border-brand-primary'
                  : 'text-gray-600 hover:text-brand-primary'
              }`}
            >
              AI 활용 사례
            </button>
            <button
              onClick={() => scrollToSection('experts')}
              className={`pb-2 font-medium transition-colors ${
                activeSection === 'experts'
                  ? 'text-brand-primary border-b-2 border-brand-primary'
                  : 'text-gray-600 hover:text-brand-primary'
              }`}
            >
              인기 AI 전문가
            </button>
          </div>
        </div>
      </nav>

      {/* AI 카테고리 섹션 */}
      <section id="categories" className="py-16">
        <div className="container-1200">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">AI로 다양한 작업을, 더 빠르게!</h2>
            <p className="text-gray-600 text-lg">
              원하는 AI 서비스를 선택하고 전문가와 함께 시작하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiCategories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-brand-primary hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-brand-primary transition-colors">
                    <FaRobot className="text-brand-primary text-xl group-hover:text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-brand-primary">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {category.description || 'AI 기술로 빠르고 효율적으로'}
                    </p>
                    {category.children && category.children.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {category.children.slice(0, 3).map((subCat) => (
                          <span
                            key={subCat.id}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                          >
                            {subCat.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 통계 섹션 */}
      <section className="py-16 bg-brand-primary text-white">
        <div className="container-1200">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">많은 분들이 이용한 AI 서비스</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-[40px] font-bold mb-2">1,000+</div>
              <div className="text-blue-200 text-lg">AI 전문 서비스</div>
            </div>
            <div className="text-center">
              <div className="text-[40px] font-bold mb-2">10,000+</div>
              <div className="text-blue-200 text-lg">완료된 AI 프로젝트</div>
            </div>
            <div className="text-center">
              <div className="text-[40px] font-bold mb-2">98%</div>
              <div className="text-blue-200 text-lg">고객 만족도</div>
            </div>
          </div>
        </div>
      </section>

      {/* AI 활용 사례 섹션 */}
      <section id="cases" className="py-16 bg-gray-50">
        <div className="container-1200">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">AI 활용 사례</h2>
            <p className="text-gray-600 text-lg">
              실제 비즈니스에서 AI를 어떻게 활용했는지 확인하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
              <div className="h-48 bg-blue-500 flex items-center justify-center">
                <FaImage className="text-white text-[40px]" />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2">미용실 마케팅 자동화</h3>
                <p className="text-gray-600 mb-4">
                  AI 모델로 예약 사이트 이미지를 하루 만에 제작, 촬영 비용 90% 절감
                </p>
                <Link
                  href="/categories/ai-image-generation"
                  className="text-brand-primary font-semibold hover:underline"
                >
                  AI 이미지 생성 보기 →
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
              <div className="h-48 bg-purple-500 flex items-center justify-center">
                <FaBlog className="text-white text-[40px]" />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2">블로그 자동화로 정시 퇴근</h3>
                <p className="text-gray-600 mb-4">
                  AI 글쓰기로 블로그 상위 노출 달성, 업무 시간 70% 단축
                </p>
                <Link
                  href="/categories/ai-writing"
                  className="text-brand-primary font-semibold hover:underline"
                >
                  AI 글쓰기 보기 →
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
              <div className="h-48 bg-green-500 flex items-center justify-center">
                <FaVideo className="text-white text-[40px]" />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2">촬영 없이 영상 제작</h3>
                <p className="text-gray-600 mb-4">
                  AI 영상 생성으로 제품 소개 영상을 3일 만에 완성
                </p>
                <Link
                  href="/categories/ai-video-generation"
                  className="text-brand-primary font-semibold hover:underline"
                >
                  AI 영상 생성 보기 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 인기 AI 전문가 섹션 */}
      <section id="experts" className="py-16">
        <div className="container-1200">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">인기 AI 전문가</h2>
            <p className="text-gray-600 text-lg">검증된 AI 전문가와 함께 프로젝트를 시작하세요</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={`ai-expert-${i}`}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-brand-primary hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    AI
                  </div>
                  <div>
                    <div className="font-semibold">AI 전문가 {i}</div>
                    <div className="text-xs text-gray-500">AI 콘텐츠 전문</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-yellow-400">
                    {Array.from({ length: 5 }, (_, idx) => (
                      <FaStar key={`star-expert-${i}-${idx}`} className="text-xs" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold">4.9</span>
                  <span className="text-xs text-gray-500">(500+)</span>
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  AI를 활용한 콘텐츠 제작 및 자동화 전문가입니다.
                </div>
                <Link
                  href="/expert/ai-expert"
                  className="block w-full text-center py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors"
                >
                  프로필 보기
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI 가이드 섹션 */}
      <section className="py-16 bg-gray-50">
        <div className="container-1200">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">AI 활용 가이드</h2>
            <p className="text-gray-600 text-lg">
              AI를 비즈니스에 효과적으로 활용하는 방법을 알아보세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FaLightbulb className="text-brand-primary text-xl" />
              </div>
              <h3 className="font-bold text-lg mb-2">AI로 업무 자동화하기</h3>
              <p className="text-gray-600 text-sm mb-4">
                반복적인 업무를 AI로 자동화하여 생산성을 높이는 방법
              </p>
              <Link href="#" className="text-brand-primary text-sm font-semibold hover:underline">
                자세히 보기 →
              </Link>
            </div>

            <div className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FaChartLine className="text-brand-primary text-xl" />
              </div>
              <h3 className="font-bold text-lg mb-2">AI로 마케팅 효과 높이기</h3>
              <p className="text-gray-600 text-sm mb-4">
                AI 기반 콘텐츠로 마케팅 ROI를 극대화하는 전략
              </p>
              <Link href="#" className="text-brand-primary text-sm font-semibold hover:underline">
                자세히 보기 →
              </Link>
            </div>

            <div className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FaMagic className="text-brand-primary text-xl" />
              </div>
              <h3 className="font-bold text-lg mb-2">AI 도구 완벽 활용법</h3>
              <p className="text-gray-600 text-sm mb-4">
                ChatGPT, Midjourney 등 인기 AI 도구 사용 가이드
              </p>
              <Link href="#" className="text-brand-primary text-sm font-semibold hover:underline">
                자세히 보기 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 bg-brand-primary text-white">
        <div className="container-1200 text-center">
          <h2 className="text-4xl font-bold mb-6">지금 바로 AI 서비스를 시작하세요</h2>
          <p className="text-xl mb-8 text-blue-100">전문가와 함께라면 AI가 더 쉽고 빠릅니다</p>
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="어떤 AI 서비스가 필요하신가요?"
                className="flex-1 px-6 py-4 rounded-lg bg-white border-2 border-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-300"
              />
              <button className="px-8 py-4 bg-white text-brand-primary rounded-lg font-semibold hover:bg-blue-50 transition-colors border-2 border-white">
                검색
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
