'use client';

import Link from 'next/link';
import { ChevronLeft, Home } from 'lucide-react';

interface ErrandPageLayoutProps {
  readonly children: React.ReactNode;
  readonly title?: string;
  readonly showBackButton?: boolean;
  readonly backHref?: string;
}

export default function ErrandPageLayout({
  children,
  title,
  showBackButton = true,
  backHref = '/errands',
}: ErrandPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Link
                href={backHref}
                className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Link>
            )}
            {title && <h1 className="text-lg font-bold text-gray-900">{title}</h1>}
          </div>
          <Link href="/errands" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Home className="w-5 h-5 text-gray-600" />
          </Link>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-3xl mx-auto">{children}</main>
    </div>
  );
}
