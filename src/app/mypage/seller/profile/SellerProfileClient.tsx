'use client';

import { useRouter } from 'next/navigation';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import { Pencil, CheckCircle, XCircle } from 'lucide-react';

interface SellerProfile {
  id: string;
  real_name: string | null;
  display_name: string;
  profile_image: string | null;
  bio: string;
  phone: string;
  show_phone: boolean;
  kakao_id: string | null;
  kakao_openchat: string | null;
  whatsapp: string | null;
  website: string | null;
  preferred_contact: string[];
  contact_hours: string | null;
  tax_invoice_available: boolean;
  account_number: string;
  account_holder: string;
  bank_name: string;
  business_number: string | null;
  is_business: boolean;
  status: string;
}

interface Props {
  readonly profile: SellerProfile;
}

export default function SellerProfileClient({ profile }: Props) {
  const router = useRouter();

  return (
    <MypageLayoutWrapper mode="seller">
      <div className="pt-2 pb-4 px-4 lg:py-8 lg:px-6">
        {/* 페이지 헤더 */}
        <div className="mb-4 lg:mb-6 flex items-center justify-between gap-2">
          <div>
            <h1 className="text-base lg:text-lg font-semibold text-gray-900">판매자 정보</h1>
            <p className="text-gray-600 mt-1 text-sm">판매자 프로필 및 정산 정보를 확인하세요</p>
          </div>
          <button
            onClick={() => router.push('/mypage/seller/profile/edit')}
            className="px-3 py-1.5 lg:px-4 lg:py-2 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors text-xs lg:text-sm font-medium"
          >
            <Pencil className="w-3 h-3 lg:w-4 lg:h-4 mr-1 inline" />
            수정
          </button>
        </div>

        <div className="max-w-4xl space-y-4 lg:space-y-6">
          {/* 프로필 정보 */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
            <h2 className="text-sm lg:text-base font-semibold text-gray-900 mb-4">프로필 정보</h2>

            <div className="space-y-4">
              <div>
                <div className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  프로필 사진
                </div>
                {profile.profile_image ? (
                  <img
                    src={profile.profile_image}
                    alt="프로필"
                    className="w-32 h-32 object-cover rounded-full border border-gray-300"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center">
                    <span className="text-4xl text-gray-400">
                      {profile.display_name?.[0] || '?'}
                    </span>
                  </div>
                )}
                <p className="mt-2 text-xs md:text-sm text-gray-500">
                  프로필 사진을 설정하려면 수정 버튼을 클릭하세요
                </p>
              </div>

              <div>
                <div className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  판매자명 (활동명)
                </div>
                <p className="text-sm md:text-base text-gray-900">{profile.display_name}</p>
              </div>

              <div>
                <div className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  자기소개
                </div>
                <p className="text-sm md:text-base text-gray-900 whitespace-pre-wrap">
                  {profile.bio}
                </p>
              </div>
            </div>
          </div>

          {/* 연락처 정보 */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
            <h2 className="text-sm lg:text-base font-semibold text-gray-900 mb-4">연락처 정보</h2>

            <div className="space-y-4">
              <div>
                <div className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  실명 (본인인증)
                </div>
                <p className="text-sm md:text-base text-gray-900">{profile.real_name || '-'}</p>
              </div>

              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">전화번호</div>
                <p className="text-sm md:text-base text-gray-900">
                  {profile.phone}
                  {profile.show_phone ? (
                    <span className="ml-2 text-xs md:text-sm text-green-600">(공개)</span>
                  ) : (
                    <span className="ml-2 text-xs md:text-sm text-gray-500">(비공개)</span>
                  )}
                </p>
              </div>

              {profile.kakao_id && (
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2">카카오톡 ID</div>
                  <p className="text-sm md:text-base text-gray-900">{profile.kakao_id}</p>
                </div>
              )}

              {profile.kakao_openchat && (
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2">
                    카카오톡 오픈채팅
                  </div>
                  <a
                    href={profile.kakao_openchat}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-primary hover:underline"
                  >
                    {profile.kakao_openchat}
                  </a>
                </div>
              )}

              {profile.whatsapp && (
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</div>
                  <p className="text-sm md:text-base text-gray-900">{profile.whatsapp}</p>
                </div>
              )}

              {profile.website && (
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2">웹사이트</div>
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-primary hover:underline"
                  >
                    {profile.website}
                  </a>
                </div>
              )}

              {profile.preferred_contact && profile.preferred_contact.length > 0 && (
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2">선호 연락 수단</div>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferred_contact.map((contact) => (
                      <span
                        key={contact}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs md:text-sm"
                      >
                        {contact}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.contact_hours && (
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2">연락 가능 시간</div>
                  <p className="text-sm md:text-base text-gray-900">{profile.contact_hours}</p>
                </div>
              )}
            </div>
          </div>

          {/* 정산 정보 */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-4">
            <h2 className="text-sm lg:text-base font-semibold text-gray-900 mb-4">정산 정보</h2>

            <div className="space-y-4">
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">은행명</div>
                <p className="text-sm md:text-base text-gray-900">{profile.bank_name}</p>
              </div>

              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">예금주명</div>
                <p className="text-sm md:text-base text-gray-900">{profile.account_holder}</p>
              </div>

              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">계좌번호</div>
                <p className="text-sm md:text-base text-gray-900">{profile.account_number}</p>
              </div>

              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">사업자 여부</div>
                <p className="text-sm md:text-base text-gray-900">
                  {profile.is_business ? '사업자' : '개인'}
                  {profile.is_business && profile.business_number && (
                    <span className="ml-2 text-xs md:text-sm text-gray-600">
                      ({profile.business_number})
                    </span>
                  )}
                </p>
              </div>

              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">세금계산서 발행</div>
                <p className="text-sm md:text-base text-gray-900">
                  {profile.tax_invoice_available ? (
                    <span className="text-sm md:text-base text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1 inline" />
                      발행 가능
                    </span>
                  ) : (
                    <span className="text-sm md:text-base text-gray-500">
                      <XCircle className="w-4 h-4 mr-1 inline" />
                      발행 불가
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
