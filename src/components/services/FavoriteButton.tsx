'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'

interface FavoriteButtonProps {
  serviceId: string
  className?: string
}

export default function FavoriteButton({ serviceId, className = '' }: FavoriteButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(false)

  // 찜 상태 확인
  useEffect(() => {
    if (!user) return

    async function checkFavoriteStatus() {
      try {
        const response = await fetch('/api/user/service-favorites')
        if (response.ok) {
          const { data } = await response.json()
          const favorited = data?.some((fav: any) => fav.service_id === serviceId)
          setIsFavorited(favorited)
        }
      } catch (error) {
        console.error('Failed to check favorite status:', error)
      }
    }

    checkFavoriteStatus()
  }, [user, serviceId])

  const handleToggleFavorite = async () => {
    // 로그인 체크
    if (!user) {
      if (confirm('로그인이 필요한 서비스입니다. 로그인 페이지로 이동하시겠습니까?')) {
        router.push('/login')
      }
      return
    }

    setLoading(true)

    try {
      if (isFavorited) {
        // 찜 취소
        const response = await fetch(`/api/user/service-favorites?serviceId=${serviceId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          setIsFavorited(false)
        } else {
          alert('찜 취소에 실패했습니다.')
        }
      } else {
        // 찜하기
        const response = await fetch('/api/user/service-favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ serviceId })
        })

        if (response.ok) {
          setIsFavorited(true)
        } else {
          alert('찜하기에 실패했습니다.')
        }
      }
    } catch (error) {
      console.error('Favorite toggle error:', error)
      alert('오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={loading}
      className={`flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <i className={`${isFavorited ? 'fas' : 'far'} fa-heart ${isFavorited ? 'text-red-500' : ''}`}></i>
      {' '}
      {isFavorited ? '찜 취소' : '찜하기'}
    </button>
  )
}
