import Link from 'next/link';
import { ArrowRight, LucideIcon } from 'lucide-react';

interface Section {
  title: string;
  content: string | null;
  list?: string[];
}

interface TermsLayoutProps {
  readonly title: string;
  readonly effectiveDate: string;
  readonly icon: LucideIcon;
  readonly bgGradient: string;
  readonly textColor: string;
  readonly sections: Section[];
}

export default function TermsLayout({
  title,
  effectiveDate,
  icon: Icon,
  bgGradient,
  textColor,
  sections,
}: TermsLayoutProps) {
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
              {sections.map((section) => (
                <div
                  key={section.title}
                  className="border-b border-gray-100 pb-5 last:border-0 last:pb-0"
                >
                  <h2 className="text-sm font-semibold text-gray-900 mb-2">{section.title}</h2>
                  {section.content && (
                    <p className="text-xs text-gray-600 leading-relaxed">{section.content}</p>
                  )}
                  {section.list && (
                    <ol className="space-y-1.5 mt-2">
                      {section.list.map((item, idx) => (
                        <li
                          key={`${section.title}-${idx}`}
                          className="text-xs text-gray-600 leading-relaxed flex gap-2"
                        >
                          <span className="text-gray-400 flex-shrink-0">{idx + 1}.</span>
                          {item}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              ))}

              {/* 부칙 */}
              <div className="pt-4 border-t border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900 mb-2">부칙</h2>
                <p className="text-xs text-gray-600">본 약관은 {effectiveDate}부터 시행됩니다.</p>
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
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                href="/terms"
                className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200 hover:border-green-500 transition-colors"
              >
                <span className="text-sm font-medium">이용약관</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                href="/privacy"
                className="flex items-center justify-between bg-white rounded-lg p-4 border border-gray-200 hover:border-green-500 transition-colors"
              >
                <span className="text-sm font-medium">개인정보처리방침</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
