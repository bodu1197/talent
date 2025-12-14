'use client';

import { useRef } from 'react';
import Link from 'next/link';

// 광고 카피
const COPY_TEXT = '귀찮은 일 모두 돌파구에 맡겨 주세요';

export default function ErrandBannerStrip() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="relative">
      {/* 배경 */}
      <div className="bg-gray-900 border-y border-gray-800">
        {/* 도트 패턴 */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(#4B5563 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="container-1200 relative z-10">
          {/* 모바일: 세로 레이아웃 (오토바이 배경 위에 텍스트) */}
          <div className="flex flex-col items-center justify-center py-8 min-h-[120px] md:hidden relative z-40">
            {/* 글자 - 가로 한줄, 가독성 있는 큰 폰트 */}
            <div className="flex items-center justify-center flex-wrap mb-4">
              {COPY_TEXT.split('').map((char, index) => {
                const isSpace = char === ' ';
                const isHighlight = char === '돌' || char === '파' || char === '구';

                if (isSpace) {
                  return <span key={index} className="w-1.5" />;
                }

                return (
                  <span
                    key={index}
                    className="font-bold text-base"
                    style={{
                      textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                      color: isHighlight ? '#fb923c' : 'white',
                    }}
                  >
                    {char}
                  </span>
                );
              })}
            </div>

            {/* CTA 버튼 */}
            <Link
              href="/errands"
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-blue-900/50 transition transform active:scale-95 z-50"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              <span>심부름 요청</span>
            </Link>
          </div>

          {/* 데스크톱: 가로 레이아웃 */}
          <div className="hidden md:flex items-center py-10 min-h-[200px]" style={{ gap: '200px' }}>
            {/* 글자들 - 항상 보이는 상태, 마스크에 의해 가려짐 */}
            <div className="flex items-center justify-center h-24">
              <div className="flex items-center">
                {COPY_TEXT.split('').map((char, index) => {
                  const isSpace = char === ' ';
                  const isHighlight = char === '돌' || char === '파' || char === '구';

                  if (isSpace) {
                    return <span key={index} className="w-3 lg:w-4" />;
                  }

                  return (
                    <span
                      key={index}
                      className="font-bold text-3xl lg:text-4xl"
                      style={{
                        textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                        color: isHighlight ? '#fb923c' : 'white',
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* CTA 버튼 - 글자 뒤쪽에 배치 */}
            <Link
              href="/errands"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-blue-900/50 transition transform active:scale-95 flex-shrink-0 z-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              <span>지금 심부름 요청하기</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
