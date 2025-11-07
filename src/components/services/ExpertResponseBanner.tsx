'use client'

import { useState } from 'react'

interface Props {
  avgResponseTime: string
}

export default function ExpertResponseBanner({ avgResponseTime }: Props) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="mb-4 bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center justify-between">
      <span className="text-sm text-green-700">
        ⚡ 첫 문의 응답이 평균 {avgResponseTime}로 빠릅니다.
      </span>
      <button
        onClick={() => setIsVisible(false)}
        className="text-green-700 hover:text-green-800"
      >
        <i className="fas fa-times text-sm"></i>
      </button>
    </div>
  )
}
