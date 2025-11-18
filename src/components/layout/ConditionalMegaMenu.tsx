'use client'

import { usePathname } from 'next/navigation'
import MegaMenu from './MegaMenu'
import { CategoryItem } from '@/lib/categories'

interface ConditionalMegaMenuProps {
  categories: CategoryItem[]
}

export default function ConditionalMegaMenu({ categories }: ConditionalMegaMenuProps) {
  const pathname = usePathname()

  // 전문가 등록 페이지에서는 MegaMenu를 표시하지 않음
  if (pathname?.startsWith('/expert')) {
    return null
  }

  return <MegaMenu categories={categories} />
}
