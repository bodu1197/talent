'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface Props {
  readonly avgResponseTime: string;
}

export default function ExpertResponseBanner({ avgResponseTime }: Props) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="mb-4 bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center justify-between">
      <span className="text-sm text-green-700">
        ⚡ 첫 문의 응답이 평균 {avgResponseTime}로 빠릅니다.
      </span>
      <button onClick={() => setIsVisible(false)} className="text-green-700 hover:text-green-800">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
