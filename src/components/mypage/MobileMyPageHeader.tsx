'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface Props {
  readonly title: string;
  readonly backHref?: string;
}

export default function MobileMyPageHeader({ title, backHref }: Props) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className="lg:hidden flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
      <button
        onClick={handleBack}
        className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="뒤로가기"
      >
        <ArrowLeft className="w-5 h-5 text-gray-700" />
      </button>
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
    </div>
  );
}
