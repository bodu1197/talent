import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface ServicePageHeaderProps {
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
}

/**
 * 서비스 관련 페이지의 공통 헤더 컴포넌트
 * - 뒤로가기 링크
 * - 페이지 제목 및 설명
 */
export default function ServicePageHeader({
  title,
  description,
  backHref = '/mypage/seller/services',
  backLabel = '서비스 관리로',
}: ServicePageHeaderProps) {
  return (
    <>
      <div className="mb-4 lg:mb-6">
        <Link href={backHref} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm lg:text-base">{backLabel}</span>
        </Link>
      </div>

      <div className="mb-6 lg:mb-8">
        <h1 className="text-base lg:text-lg font-semibold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-1 text-sm">{description}</p>
      </div>
    </>
  );
}
