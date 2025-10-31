'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import Sidebar from '@/components/mypage/Sidebar'
import MobileSidebar from '@/components/mypage/MobileSidebar'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface SellerProfile {
  id: string
  real_name: string | null
  display_name: string
  profile_image: string | null
  bio: string
  phone: string
  show_phone: boolean
  kakao_id: string | null
  kakao_openchat: string | null
  whatsapp: string | null
  website: string | null
  preferred_contact: string[]
  account_number: string
  account_holder: string
  bank_name: string
  business_number: string | null
  is_business: boolean
  status: string
}

export default function SellerProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<SellerProfile | null>(null)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null)

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const supabase = createClient()

      const { data: seller, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', user!.id)
        .single()

      if (error) throw error

      setProfile(seller)
      if (seller.profile_image) {
        setProfilePreview(seller.profile_image)
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
      alert('프로필을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB를 초과할 수 없습니다.')
        return
      }
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.')
        return
      }
      setNewProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePreferredContactToggle = (contact: string) => {
    if (!profile) return

    const current = profile.preferred_contact || []
    let updated: string[]

    if (current.includes(contact)) {
      updated = current.filter(c => c !== contact)
    } else {
      updated = [...current, contact]
    }

    setProfile({ ...profile, preferred_contact: updated })
  }

  const handleSave = async () => {
    if (!user || !profile) {
      alert('사용자 정보를 찾을 수 없습니다.')
      return
    }

    // 필수 필드 검증
    if (!profile.display_name || !profile.bio) {
      alert('판매자명과 자기소개는 필수 항목입니다.')
      return
    }

    if (!profile.bank_name || !profile.account_holder || !profile.account_number) {
      alert('정산 정보(은행명, 예금주명, 계좌번호)는 필수 항목입니다.')
      return
    }

    setSaving(true)

    try {
      const supabase = createClient()

      // 프로필 이미지 업로드 (새 이미지가 있는 경우)
      let profileImageUrl = profile.profile_image || ''
      if (newProfileImage) {
        const fileExt = newProfileImage.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `seller-profiles/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, newProfileImage, { upsert: true })

        if (uploadError) {
          console.error('Profile upload error:', uploadError)
          throw new Error('프로필 이미지 업로드에 실패했습니다: ' + uploadError.message)
        }

        const { data: { publicUrl } } = supabase.storage
          .from('profiles')
          .getPublicUrl(filePath)

        profileImageUrl = publicUrl
      }

      // 판매자 정보 업데이트
      const { error: updateError } = await supabase
        .from('sellers')
        .update({
          display_name: profile.display_name.trim(),
          profile_image: profileImageUrl,
          bio: profile.bio.trim(),
          phone: profile.phone,
          show_phone: profile.show_phone,
          kakao_id: profile.kakao_id?.trim() || null,
          kakao_openchat: profile.kakao_openchat?.trim() || null,
          whatsapp: profile.whatsapp?.trim() || null,
          website: profile.website?.trim() || null,
          preferred_contact: profile.preferred_contact || [],
          account_number: profile.account_number.trim(),
          account_holder: profile.account_holder.trim(),
          bank_name: profile.bank_name,
          business_number: profile.is_business ? profile.business_number?.trim() : null,
          is_business: profile.is_business,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (updateError) {
        console.error('Update error:', updateError)
        throw new Error('프로필 업데이트에 실패했습니다: ' + updateError.message)
      }

      alert('프로필이 성공적으로 업데이트되었습니다.')
      setNewProfileImage(null)
      await loadProfile()
    } catch (error: any) {
      console.error('Profile update error:', error)
      alert(error.message || '프로필 업데이트 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <MobileSidebar mode="seller" />
        <Sidebar mode="seller" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <LoadingSpinner message="프로필 불러오는 중..." />
        </main>
      </>
    )
  }

  if (!profile) {
    return (
      <>
        <MobileSidebar mode="seller" />
        <Sidebar mode="seller" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="text-center py-8">
            <p className="text-gray-500">판매자 정보를 찾을 수 없습니다.</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <MobileSidebar mode="seller" />
      <Sidebar mode="seller" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {/* 페이지 헤더 */}
        <div className="mb-6 lg:mb-8 pt-12 lg:pt-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">판매자 정보 수정</h1>
          <p className="text-sm sm:text-base text-gray-600">판매자 프로필 및 정산 정보를 관리하세요</p>
        </div>

        {/* 상태 배지 */}
        <div className="mb-6">
          <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
            profile.status === 'active' ? 'bg-green-100 text-green-800' :
            profile.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
            profile.status === 'suspended' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {profile.status === 'active' ? '✓ 활동중' :
             profile.status === 'pending_review' ? '⏳ 승인 대기' :
             profile.status === 'suspended' ? '⚠ 정지됨' :
             profile.status}
          </span>
        </div>

        <div className="max-w-4xl space-y-6">
          {/* 프로필 정보 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">프로필 정보</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  프로필 사진
                </label>
                <div className="space-y-3">
                  {profilePreview ? (
                    <div className="flex items-center gap-4">
                      <img
                        src={profilePreview}
                        alt="프로필"
                        className="w-32 h-32 object-cover rounded-full border border-gray-300"
                      />
                      <div className="space-x-2">
                        <label className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-sm">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageChange}
                            className="hidden"
                          />
                          <i className="fas fa-camera mr-1"></i>
                          변경
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setNewProfileImage(null)
                            setProfilePreview(profile.profile_image)
                          }}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                          <i className="fas fa-times mr-1"></i>
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="inline-block px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="hidden"
                      />
                      <i className="fas fa-camera mr-2"></i>
                      프로필 사진 선택
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  판매자명 (활동명) *
                </label>
                <input
                  type="text"
                  value={profile.display_name}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  자기소개 *
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                ></textarea>
                <p className="text-sm text-gray-500 mt-1">{profile.bio.length}/300자</p>
              </div>
            </div>
          </div>

          {/* 연락처 정보 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">연락처 정보</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  실명 (본인인증)
                </label>
                <input
                  type="text"
                  value={profile.real_name || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-sm text-gray-500 mt-1">본인인증된 실명은 변경할 수 없습니다</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  전화번호 (본인인증)
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-sm text-gray-500 mt-1">본인인증된 번호는 변경할 수 없습니다</p>
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={profile.show_phone}
                    onChange={(e) => setProfile({ ...profile, show_phone: e.target.checked })}
                    className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">전화번호 공개</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카카오톡 ID
                </label>
                <input
                  type="text"
                  value={profile.kakao_id || ''}
                  onChange={(e) => setProfile({ ...profile, kakao_id: e.target.value })}
                  placeholder="kakaotalk_id"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카카오톡 오픈채팅
                </label>
                <input
                  type="url"
                  value={profile.kakao_openchat || ''}
                  onChange={(e) => setProfile({ ...profile, kakao_openchat: e.target.value })}
                  placeholder="https://open.kakao.com/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={profile.whatsapp || ''}
                  onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                  placeholder="821012345678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  웹사이트
                </label>
                <input
                  type="url"
                  value={profile.website || ''}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  선호 연락 수단
                </label>
                <div className="space-y-2">
                  {['플랫폼 메시지', '카카오톡', 'WhatsApp', '이메일', '전화'].map((contact) => (
                    <label key={contact} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={profile.preferred_contact?.includes(contact) || false}
                        onChange={() => handlePreferredContactToggle(contact)}
                        className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                      />
                      <span className="text-sm text-gray-700">{contact}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 정산 정보 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">정산 정보</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    은행명 *
                  </label>
                  <select
                    value={profile.bank_name}
                    onChange={(e) => setProfile({ ...profile, bank_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  >
                    <option value="">선택하세요</option>
                    <option value="KB국민은행">KB국민은행</option>
                    <option value="신한은행">신한은행</option>
                    <option value="우리은행">우리은행</option>
                    <option value="하나은행">하나은행</option>
                    <option value="NH농협은행">NH농협은행</option>
                    <option value="IBK기업은행">IBK기업은행</option>
                    <option value="카카오뱅크">카카오뱅크</option>
                    <option value="토스뱅크">토스뱅크</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    예금주명 *
                  </label>
                  <input
                    type="text"
                    value={profile.account_holder}
                    onChange={(e) => setProfile({ ...profile, account_holder: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  계좌번호 *
                </label>
                <input
                  type="text"
                  value={profile.account_number}
                  onChange={(e) => setProfile({ ...profile, account_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={profile.is_business}
                    onChange={(e) => setProfile({ ...profile, is_business: e.target.checked })}
                    className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">사업자입니다</span>
                </label>
              </div>

              {profile.is_business && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    사업자 등록번호
                  </label>
                  <input
                    type="text"
                    value={profile.business_number || ''}
                    onChange={(e) => setProfile({ ...profile, business_number: e.target.value })}
                    placeholder="123-45-67890"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '저장 중...' : '변경사항 저장'}
            </button>
            <button
              onClick={() => router.push('/mypage/seller/dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              취소
            </button>
          </div>
        </div>
      </main>
    </>
  )
}
