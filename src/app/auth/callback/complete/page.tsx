'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CallbackCompletePage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const updateUserProfile = async () => {
      try {
        // localStorage에서 임시 저장된 닉네임과 프로필 이미지 가져오기
        const nickname = localStorage.getItem('temp_nickname')
        const profileImage = localStorage.getItem('temp_profile_image')

        // 현재 사용자 정보 가져오기
        const { data: { user } } = await supabase.auth.getUser()

        if (user && nickname) {
          // users 테이블 업데이트
          await supabase
            .from('users')
            .update({
              name: nickname,
              profile_image: profileImage
            })
            .eq('id', user.id)

          // localStorage 정리
          localStorage.removeItem('temp_nickname')
          localStorage.removeItem('temp_profile_image')
        }

        // 홈으로 리다이렉트
        router.push('/')
      } catch (error) {
        console.error('Profile update error:', error)
        // 에러가 있어도 홈으로 리다이렉트
        router.push('/')
      }
    }

    updateUserProfile()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="spinner mb-4"></div>
        <p className="text-gray-600">로그인 중...</p>
      </div>
    </div>
  )
}
