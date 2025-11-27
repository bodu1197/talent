'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface MobileSubHeaderProps {
  readonly title?: string;
}

export default function MobileSubHeader({ title }: MobileSubHeaderProps) {
  const router = useRouter();

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 lg:hidden">
      <div className="h-16 flex items-center px-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center text-gray-700 hover:text-brand-primary transition-colors"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {title && (
          <h1 className="flex-1 text-center font-semibold text-gray-900 text-lg pr-10">{title}</h1>
        )}
      </div>
    </header>
  );
}
