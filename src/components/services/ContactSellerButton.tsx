'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  sellerId: string
  serviceId: string
}

export default function ContactSellerButton({ sellerId, serviceId }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleContact = async () => {
    try {
      setIsLoading(true)

      // 채팅방 생성 또는 기존 채팅방 가져오기
      const response = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          seller_id: sellerId,
          service_id: serviceId
        })
      })

      if (!response.ok) {
        const error = await response.json()
        if (response.status === 401) {
          // 로그인 필요
          router.push('/auth/login?redirect=/services/' + serviceId)
          return
        }
        throw new Error(error.error || '채팅방 생성 실패')
      }

      const { room_id } = await response.json()

      // 채팅 페이지로 이동
      router.push(`/mypage/messages?room=${room_id}`)
    } catch (error) {
      console.error('Contact seller error:', error)
      alert('문의 시작에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleContact}
      disabled={isLoading}
      className="w-full py-3 bg-white border-2 border-[#0f3460] text-[#0f3460] rounded-lg font-medium hover:bg-[#0f3460] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <span>
          <i className="fas fa-spinner fa-spin mr-2"></i>
          처리 중...
        </span>
      ) : (
        <span>
          <i className="fas fa-comment-dots mr-2"></i>
          전문가에게 문의하기
        </span>
      )}
    </button>
  )
}
