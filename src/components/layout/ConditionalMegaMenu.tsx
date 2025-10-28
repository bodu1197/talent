'use client'

import { usePathname } from 'next/navigation'
import MegaMenu from './MegaMenu'

export default function ConditionalMegaMenu() {
  const pathname = usePathname()

  // 전문가 등록 페이지에서는 MegaMenu를 표시하지 않음
  if (pathname?.startsWith('/expert')) {
    return null
  }

  return <MegaMenu />
}
