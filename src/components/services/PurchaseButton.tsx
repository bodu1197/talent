'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PurchaseButtonProps {
  sellerId: string
  serviceId: string
  currentUserId: string
  sellerUserId: string
}

export default function PurchaseButton({ sellerId, serviceId, currentUserId, sellerUserId }: PurchaseButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handlePurchase = async () => {
    // 자신의 서비스인 경우
    if (currentUserId === sellerUserId) {
      alert('자신의 서비스는 구매할 수 없습니다')
      return
    }

    setIsLoading(true)

    try {
      // 1. 기존 채팅방 확인
      const checkResponse = await fetch(`/api/chat/rooms?seller_id=${sellerId}&service_id=${serviceId}`)

      if (checkResponse.ok) {
        const { room } = await checkResponse.json()

        if (room) {
          // 기존 채팅방이 있으면 해당 채팅방으로 이동
          router.push(`/chat/${room.id}`)
          return
        }
      }

      // 2. 새 채팅방 생성
      const createResponse = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id: sellerId,
          service_id: serviceId
        })
      })

      if (!createResponse.ok) {
        const error = await createResponse.json()
        throw new Error(error.error || '채팅방 생성 실패')
      }

      const { room } = await createResponse.json()

      // 3. 생성된 채팅방으로 이동
      router.push(`/chat/${room.id}`)
    } catch (error) {
      console.error('Purchase error:', error)
      alert(error instanceof Error ? error.message : '구매 진행 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handlePurchase}
      disabled={isLoading}
      className="w-full py-3 bg-[#0f3460] text-white rounded-lg font-medium hover:bg-[#1a4d8f] transition-colors mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <i className="fas fa-spinner fa-spin mr-2"></i>
          처리 중...
        </>
      ) : (
        '구매하기'
      )}
    </button>
  )
}
