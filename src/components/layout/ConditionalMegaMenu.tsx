'use client';

import { usePathname } from 'next/navigation';
import MegaMenu from './MegaMenu';
import { CategoryItem } from '@/lib/categories';

interface ConditionalMegaMenuProps {
  readonly categories: CategoryItem[];
}

export default function ConditionalMegaMenu({ categories }: ConditionalMegaMenuProps) {
  const pathname = usePathname();

  // 특정 페이지에서는 MegaMenu를 표시하지 않음
  // - 메인 페이지, 전문가 등록 페이지, 심부름 페이지
  if (pathname === '/' || pathname?.startsWith('/expert') || pathname?.startsWith('/errands')) {
    return null;
  }

  return <MegaMenu categories={categories} />;
}
