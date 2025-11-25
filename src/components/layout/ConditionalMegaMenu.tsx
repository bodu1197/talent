'use client';

import { usePathname } from 'next/navigation';
import MegaMenu from './MegaMenu';
import { CategoryItem } from '@/lib/categories';

interface ConditionalMegaMenuProps {
  readonly categories: CategoryItem[];
}

export default function ConditionalMegaMenu({ categories }: ConditionalMegaMenuProps) {
  const pathname = usePathname();

  // 랜딩 페이지, 메인 페이지, 전문가 등록 페이지에서는 MegaMenu를 표시하지 않음
  if (pathname === '/' || pathname === '/landing' || pathname?.startsWith('/expert')) {
    return null;
  }

  return <MegaMenu categories={categories} />;
}
