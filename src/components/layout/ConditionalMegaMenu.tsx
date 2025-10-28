'use client'

import { usePathname } from 'next/navigation'
import MegaMenu from './MegaMenu'
import { useEffect, useState } from 'react'

export default function ConditionalMegaMenu() {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 전문가 등록 페이지에서는 MegaMenu를 표시하지 않음
  if (pathname?.startsWith('/expert')) {
    return null
  }

  // SSR 중에는 항상 렌더링, 클라이언트에서는 조건부 렌더링
  if (!isMounted) {
    return <MegaMenu />
  }

  // 클라이언트: PC에서만 표시
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    return null
  }

  return <MegaMenu />
}
