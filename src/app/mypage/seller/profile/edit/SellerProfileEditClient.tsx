'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import { logger } from '@/lib/logger';
import type { Seller } from '@/types/common';
import { Camera, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface SellerProfile extends Omit<Seller, 'created_at' | 'updated_at' | 'bio'> {
  display_name?: string;
  bio?: string | null;
  profile_image?: string | null;
}

interface Props {
  readonly profile: SellerProfile;
}

export default function SellerProfileEditClient({ profile: initialProfile }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(initialProfile);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(
    initialProfile.profile_image || null
  );

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('파일 크기는 5MB를 초과할 수 없습니다.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('이미지 파일만 업로드 가능합니다.');
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      const supabase = createClient();

      // 1. Upload profile image if changed
      let profileImageUrl = initialProfile.profile_image || '';
      if (profileImage) {
        const fileExt = profileImage.name.split('.').pop();
        const fileName = `${profile.user_id}_${Date.now()}.${fileExt}`;
        const filePath = `profiles/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, profileImage, { upsert: true });

        if (uploadError) {
          logger.error('Profile image upload error:', uploadError);
          toast.error('프로필 이미지 업로드에 실패했습니다: ' + uploadError.message);
          setSaving(false);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('profiles').getPublicUrl(filePath);

        profileImageUrl = publicUrl;
      }

      // 2. Update profiles table using API (RLS bypass)
      const profileResponse = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.display_name,
          bio: profile.bio,
          profile_image: profileImageUrl || null,
        }),
      });

      if (!profileResponse.ok) {
        const profileResult = await profileResponse.json();
        logger.error('Profile update error:', profileResult);
        throw new Error(profileResult.error || 'Profile update failed');
      }

      // 2. Update sellers table (remove display_name, bio, profile_image from update)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Destructuring to exclude fields from sellerData
      const { display_name, bio, profile_image, ...sellerData } = profile;
      const { error: sellerError } = await supabase
        .from('sellers')
        .update(sellerData)
        .eq('id', profile.id);

      if (sellerError) throw sellerError;

      toast.success('프로필이 저장되었습니다');
      router.push('/mypage/seller/profile');
      router.refresh();
    } catch (error) {
      logger.error('Failed to save profile:', error);
      toast.error('프로필 저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MypageLayoutWrapper mode="seller">
      <div className="py-8 px-4">
        <div className="mb-6 lg:mb-8 pt-12 lg:pt-0">
          <h1 className="text-base md:text-lg font-semibold text-gray-900">판매자 정보 수정</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            판매자 프로필 및 정산 정보를 수정하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-6">프로필 정보</h2>

            <div className="space-y-4">
              {/* 프로필 이미지 업로드 */}
              <div>
                <span className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  프로필 사진
                </span>
                <div className="flex items-center gap-4">
                  {/* 현재 프로필 이미지 또는 기본 아바타 */}
                  {profilePreview ? (
                    <div className="relative w-32 h-32 rounded-full border border-gray-300 overflow-hidden">
                      <Image
                        src={profilePreview}
                        alt="프로필 미리보기"
                        fill
                        className="object-cover"
                        sizes="128px"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setProfileImage(null);
                          setProfilePreview(initialProfile.profile_image || null);
                        }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        title="이미지 제거"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center">
                      <span className="text-4xl text-gray-400">
                        {profile.display_name?.[0] || '?'}
                      </span>
                    </div>
                  )}

                  {/* 파일 업로드 버튼 */}
                  <div>
                    <label
                      htmlFor="profile-image-upload"
                      className="inline-flex items-center px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors cursor-pointer"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      사진 업로드
                    </label>
                    <input
                      id="profile-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                    />
                    <p className="mt-2 text-xs md:text-sm text-gray-500">JPG, PNG 형식, 최대 5MB</p>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="seller-display-name"
                  className="block text-sm md:text-base font-medium text-gray-700 mb-2"
                >
                  판매자명 (활동명) *
                </label>
                <input
                  id="seller-display-name"
                  type="text"
                  value={profile.display_name || ''}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="seller-bio"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  자기소개 *
                </label>
                <textarea
                  id="seller-bio"
                  rows={6}
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="자신의 전문성과 경력을 소개해주세요"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-6">연락처 정보</h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="seller-phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  전화번호 *
                </label>
                <input
                  id="seller-phone"
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
                <div className="mt-2">
                  <label htmlFor="seller-show-phone" className="flex items-center">
                    <input
                      id="seller-show-phone"
                      type="checkbox"
                      checked={profile.show_phone || false}
                      onChange={(e) => setProfile({ ...profile, show_phone: e.target.checked })}
                      className="w-4 h-4 text-brand-primary rounded"
                    />
                    <span className="ml-2 text-sm md:text-base text-gray-700">
                      프로필에 전화번호 공개
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label
                  htmlFor="seller-kakao-id"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  카카오톡 ID
                </label>
                <input
                  id="seller-kakao-id"
                  type="text"
                  value={profile.kakao_id || ''}
                  onChange={(e) => setProfile({ ...profile, kakao_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="seller-whatsapp"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  WhatsApp
                </label>
                <input
                  id="seller-whatsapp"
                  type="text"
                  value={profile.whatsapp || ''}
                  onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="seller-website"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  웹사이트
                </label>
                <input
                  id="seller-website"
                  type="url"
                  value={profile.website || ''}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-2">
                  연락 가능 시간
                </legend>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-start-time"
                      className="block text-xs md:text-sm text-gray-600 mb-1"
                    >
                      시작 시간
                    </label>
                    <select
                      id="contact-start-time"
                      value={profile.contact_hours?.split('-')[0] || '09:00'}
                      onChange={(e) => {
                        const endTime = profile.contact_hours?.split('-')[1] || '18:00';
                        setProfile({
                          ...profile,
                          contact_hours: `${e.target.value}-${endTime}`,
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    >
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return [
                          <option key={`${hour}:00`} value={`${hour}:00`}>{`${hour}:00`}</option>,
                          <option key={`${hour}:30`} value={`${hour}:30`}>{`${hour}:30`}</option>,
                        ];
                      })}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="contact-end-time" className="block text-xs text-gray-600 mb-1">
                      종료 시간
                    </label>
                    <select
                      id="contact-end-time"
                      value={profile.contact_hours?.split('-')[1] || '18:00'}
                      onChange={(e) => {
                        const startTime = profile.contact_hours?.split('-')[0] || '09:00';
                        setProfile({
                          ...profile,
                          contact_hours: `${startTime}-${e.target.value}`,
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    >
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return [
                          <option key={`${hour}:00`} value={`${hour}:00`}>{`${hour}:00`}</option>,
                          <option key={`${hour}:30`} value={`${hour}:30`}>{`${hour}:30`}</option>,
                        ];
                      })}
                    </select>
                  </div>
                </div>
                <p className="mt-1 text-xs md:text-sm text-gray-500">
                  구매자가 연락 가능한 시간대를 선택해주세요
                </p>
              </fieldset>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-6">정산 정보</h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="seller-bank-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  은행명 *
                </label>
                <input
                  id="seller-bank-name"
                  type="text"
                  value={profile.bank_name || ''}
                  onChange={(e) => setProfile({ ...profile, bank_name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="seller-account-holder"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  예금주명 *
                </label>
                <input
                  id="seller-account-holder"
                  type="text"
                  value={profile.account_holder || ''}
                  onChange={(e) => setProfile({ ...profile, account_holder: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="seller-account-number"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  계좌번호 *
                </label>
                <input
                  id="seller-account-number"
                  type="text"
                  value={profile.account_number || ''}
                  onChange={(e) => setProfile({ ...profile, account_number: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="seller-is-business" className="flex items-center">
                  <input
                    id="seller-is-business"
                    type="checkbox"
                    checked={profile.is_business || false}
                    onChange={(e) => setProfile({ ...profile, is_business: e.target.checked })}
                    className="w-4 h-4 text-brand-primary rounded"
                  />
                  <span className="ml-2 text-sm md:text-base text-gray-700">사업자입니다</span>
                </label>
              </div>

              {profile.is_business && (
                <div>
                  <label
                    htmlFor="seller-business-number"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    사업자 번호
                  </label>
                  <input
                    id="seller-business-number"
                    type="text"
                    value={profile.business_number || ''}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        business_number: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label htmlFor="seller-tax-invoice" className="flex items-center">
                  <input
                    id="seller-tax-invoice"
                    type="checkbox"
                    checked={profile.tax_invoice_available || false}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        tax_invoice_available: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-brand-primary rounded"
                  />
                  <span className="ml-2 text-sm md:text-base text-gray-700">
                    세금계산서 발행 가능
                  </span>
                </label>
                <p className="mt-1 ml-6 text-xs md:text-sm text-gray-500">
                  사업자인 경우 체크하시면 구매자에게 세금계산서 발행 가능 여부가 표시됩니다
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={saving}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium disabled:opacity-50"
            >
              {saving ? '저장중...' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </MypageLayoutWrapper>
  );
}
