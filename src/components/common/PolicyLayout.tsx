'use client';

import Link from 'next/link';
import { ArrowRight, LucideIcon } from 'lucide-react';

export interface RelatedLink {
  href: string;
  label: string;
}

interface PolicyLayoutProps {
  readonly title: string;
  readonly effectiveDate: string;
  readonly icon: LucideIcon;
  readonly bgGradient: string;
  readonly textColor: string;
  readonly relatedLinks?: RelatedLink[];
  readonly children: React.ReactNode;
}

export default function PolicyLayout({
  title,
  effectiveDate,
  icon: Icon,
  bgGradient,
  textColor,
  relatedLinks,
  children,
}: PolicyLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className={`${bgGradient} text-white py-10 md:py-12`}>
        <div className="container-1200 px-4">
          <div className="flex items-center gap-3 mb-3">
            <Icon className="w-6 h-6" />
            <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
          </div>
          <p className={`text-sm ${textColor}`}>시행일: {effectiveDate}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 md:py-12">
        <div className="container-1200 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              {children}

              {/* 부칙 */}
              <div className="pt-4 border-t border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900 mb-2">부칙</h2>
                <p className="text-xs text-gray-600">
                  본 방침/약관은 {effectiveDate}부터 시행됩니다.
                </p>
              </div>

              {/* 회사 정보 */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 leading-relaxed">
                  <strong className="text-gray-700">(주)플랫폼몬스터</strong>
                  <br />
                  사업자등록번호: 363-06-01936 | 대표: 배미미
                  <br />
                  주소: 서울시 마포구 월드컵로 81 3층
                  <br />
                  고객센터: 070-8019-6077 | dolpagu@dolpagu.com
                </p>
              </div>
            </div>

            {/* Related Links */}
            {relatedLinks && relatedLinks.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-3">
                {relatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200 hover:border-green-500 transition-colors"
                  >
                    <span className="text-sm font-medium">{link.label}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
