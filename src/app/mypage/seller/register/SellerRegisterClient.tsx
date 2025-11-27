'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import Link from 'next/link';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle,
  Info,
  X,
  Camera,
  Check,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

type Step = 1 | 2 | 3 | 4;

interface SellerFormData {
  // 1단계: 신원 인증
  realName: string;
  phone: string;
  accountNumber: string;
  accountHolder: string;
  bankName: string;
  businessNumber: string;
  isBusiness: boolean;

  // 2단계: 판매자 프로필
  displayName: string;
  profileImage: File | null;
  bio: string;

  // 3단계: 연락처 정보
  publicPhone: string;
  showPhone: boolean;
  kakaoId: string;
  kakaoOpenChat: string;
  whatsapp: string;
  website: string;
  preferredContact: string[];

  // 4단계: 약관 동의
  termsAgree: boolean;
  commissionAgree: boolean;
  refundAgree: boolean;
}

interface Props {
  readonly userId: string;
  readonly initialProfile?: {
    name: string;
    profile_image?: string | null;
  } | null;
}

export default function SellerRegisterClient({ userId, initialProfile }: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(
    initialProfile?.profile_image || null
  );
  const [isVerified, setIsVerified] = useState(false);
  const popupCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup popup check interval on unmount
  useEffect(() => {
    return () => {
      if (popupCheckIntervalRef.current) {
        clearInterval(popupCheckIntervalRef.current);
      }
    };
  }, []);

  const [formData, setFormData] = useState<SellerFormData>({
    realName: '',
    phone: '',
    accountNumber: '',
    accountHolder: '',
    bankName: '',
    businessNumber: '',
    isBusiness: false,
    displayName: initialProfile?.name || '',
    profileImage: null,
    bio: '',
    publicPhone: '',
    showPhone: false,
    kakaoId: '',
    kakaoOpenChat: '',
    whatsapp: '',
    website: '',
    preferredContact: [],
    termsAgree: false,
    commissionAgree: false,
    refundAgree: false,
  });

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
      setFormData({ ...formData, profileImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreferredContactToggle = (contact: string) => {
    const current = formData.preferredContact;
    if (current.includes(contact)) {
      setFormData({
        ...formData,
        preferredContact: current.filter((c) => c !== contact),
      });
    } else {
      setFormData({
        ...formData,
        preferredContact: [...current, contact],
      });
    }
  };

  // NICE 본인인증 처리
  const handleNiceVerification = () => {
    // NICE 본인인증 팝업 열기
    const width = 500;
    const height = 600;
    const left = (globalThis.screen.width - width) / 2;
    const top = (globalThis.screen.height - height) / 2;

    // 실제 환경에서는 /api/nice/request 엔드포인트로 인증 요청
    // 여기서는 시뮬레이션
    const popup = globalThis.open(
      '/api/nice/verify',
      'niceVerification',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    );

    // 팝업에서 메시지 받기 (본인인증 완료 시)
    const handleMessage = (event: MessageEvent) => {
      // 보안을 위해 origin 체크 필요
      if (event.origin !== globalThis.location.origin) return;

      if (event.data.type === 'NICE_VERIFICATION_SUCCESS') {
        const { name, phone } = event.data.data;

        setFormData({
          ...formData,
          realName: name,
          phone: phone,
        });
        setIsVerified(true);

        toast.success('본인인증이 완료되었습니다.');
        globalThis.removeEventListener('message', handleMessage);
      } else if (event.data.type === 'NICE_VERIFICATION_FAILED') {
        toast.error('본인인증에 실패했습니다. 다시 시도해주세요.');
        globalThis.removeEventListener('message', handleMessage);
      }
    };

    globalThis.addEventListener('message', handleMessage);

    // 팝업이 닫혔는지 체크
    // Clear existing interval if any
    if (popupCheckIntervalRef.current) {
      clearInterval(popupCheckIntervalRef.current);
      popupCheckIntervalRef.current = null;
    }

    popupCheckIntervalRef.current = setInterval(() => {
      if (popup?.closed) {
        if (popupCheckIntervalRef.current) {
          clearInterval(popupCheckIntervalRef.current);
          popupCheckIntervalRef.current = null;
        }
        globalThis.removeEventListener('message', handleMessage);
      }
    }, 500);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const supabase = createClient();

      // 1. 프로필 이미지 업로드
      let profileImageUrl = initialProfile?.profile_image || '';

      // 이미지가 제거된 경우 (preview가 없음)
      if (!profilePreview) {
        profileImageUrl = '';
      }

      // 새 이미지가 업로드된 경우
      if (formData.profileImage) {
        const fileExt = formData.profileImage.name.split('.').pop();
        const fileName = `${userId}-profile.${fileExt}`;
        const filePath = `seller-profiles/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, formData.profileImage, { upsert: true });

        if (uploadError) {
          toast.error('프로필 이미지 업로드에 실패했습니다: ' + uploadError.message);
          setLoading(false);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('profiles').getPublicUrl(filePath);

        profileImageUrl = publicUrl;
      }

      // 2. profiles 테이블 업데이트 (display_name, profile_image, bio)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.displayName,
          profile_image: profileImageUrl || null,
          bio: formData.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (profileError) {
        toast.error(
          `프로필 업데이트에 실패했습니다.\n\n에러: ${profileError.message}\n코드: ${profileError.code}`
        );
        setLoading(false);
        return;
      }

      // 3. sellers 테이블에 판매자 정보 등록 (display_name, profile_image 제거됨)
      const insertData = {
        user_id: userId,
        real_name: formData.realName,
        bio: formData.bio,
        phone: formData.phone,
        show_phone: formData.showPhone,
        kakao_id: formData.kakaoId || null,
        kakao_openchat: formData.kakaoOpenChat || null,
        whatsapp: formData.whatsapp || null,
        website: formData.website || null,
        preferred_contact: formData.preferredContact,
        account_number: formData.accountNumber,
        account_holder: formData.accountHolder,
        bank_name: formData.bankName,
        business_number: formData.isBusiness ? formData.businessNumber : null,
        is_business: formData.isBusiness,
        certificates: null,
        experience: null,
        status: 'pending_review',
      };

      const { error: sellerError } = await supabase
        .from('sellers')
        .insert(insertData)
        .select()
        .single();

      if (sellerError) {
        toast.error(
          `판매자 등록에 실패했습니다.\n\n에러: ${sellerError.message}\n코드: ${sellerError.code}\n\n관리자에게 문의해주세요.`
        );
        setLoading(false);
        return;
      }

      toast.success('판매자로 등록되었습니다! 서비스를 등록하세요.');

      router.push('/mypage/seller/dashboard');
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
      toast.error(`판매자 등록 중 오류가 발생했습니다.\n\n${message}`);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          isVerified && !!formData.accountNumber && !!formData.accountHolder && !!formData.bankName
        );
      case 2: {
        // 프로필 이미지: 필수가 아님 (제거 가능)
        return !!formData.displayName && formData.bio.length >= 50;
      }
      case 3:
        return true; // 연락처는 선택사항
      case 4:
        return formData.termsAgree && formData.commissionAgree && formData.refundAgree;
      default:
        return false;
    }
  };

  return (
    <MypageLayoutWrapper mode="buyer">
      <div className="py-8 px-4">
        {/* 상단 네비게이션 */}
        <div className="mb-6">
          <Link
            href="/mypage"
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>마이페이지로</span>
          </Link>
        </div>

        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">판매자 등록</h1>
          <p className="text-gray-600 mt-1 text-sm">
            재능을 판매하기 위해 판매자 정보를 입력해주세요
          </p>
        </div>

        {/* 진행 단계 표시 */}
        <div className="max-w-4xl mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                    currentStep >= step
                      ? 'bg-brand-primary text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step ? 'bg-brand-primary' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span
              className={currentStep === 1 ? 'text-brand-primary font-medium' : 'text-gray-500'}
            >
              신원인증
            </span>
            <span
              className={currentStep === 2 ? 'text-brand-primary font-medium' : 'text-gray-500'}
            >
              프로필
            </span>
            <span
              className={currentStep === 3 ? 'text-brand-primary font-medium' : 'text-gray-500'}
            >
              연락처
            </span>
            <span
              className={currentStep === 4 ? 'text-brand-primary font-medium' : 'text-gray-500'}
            >
              약관동의
            </span>
          </div>
        </div>

        <div className="max-w-4xl">
          {/* 1단계: 신원 인증 */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-base md:text-lg font-bold text-gray-900 mb-6">
                1단계: 신원 인증
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-blue-500 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">본인인증 안내</p>
                      <p className="text-sm text-blue-700 mt-1">
                        NICE 평가정보를 통한 휴대폰 본인인증이 필요합니다. 인증 완료 시 실명과
                        휴대폰 번호가 자동으로 입력됩니다.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2">본인인증 *</div>
                  <button
                    type="button"
                    onClick={handleNiceVerification}
                    disabled={isVerified}
                    aria-label="NICE 휴대폰 본인인증"
                    className={`w-full px-6 py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      isVerified
                        ? 'bg-green-100 text-green-800 cursor-not-allowed'
                        : 'bg-brand-primary text-white hover:bg-[#1a4d8f]'
                    }`}
                  >
                    {isVerified ? <CheckCircle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                    {isVerified ? '본인인증 완료' : 'NICE 휴대폰 본인인증'}
                  </button>
                  {!isVerified && (
                    <p className="text-sm text-gray-500 mt-2">
                      클릭하여 NICE 평가정보 본인인증을 진행해주세요
                    </p>
                  )}
                </div>

                {isVerified && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-900 mb-2">인증 완료</p>
                        <div className="space-y-1">
                          <p className="text-sm text-green-800">
                            <span className="font-medium">이름:</span> {formData.realName}
                          </p>
                          <p className="text-sm text-green-800">
                            <span className="font-medium">휴대폰:</span> {formData.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 mt-6">
                  <h3 className="font-medium text-gray-900 mb-4">정산 계좌 정보</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="bankName"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        은행명 *
                      </label>
                      <select
                        id="bankName"
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        required
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
                      <label
                        htmlFor="seller-account-holder"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        예금주명 *
                      </label>
                      <input
                        id="seller-account-holder"
                        type="text"
                        value={formData.accountHolder}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            accountHolder: e.target.value,
                          })
                        }
                        placeholder="홍길동"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label
                      htmlFor="seller-account-number"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      계좌번호 *
                    </label>
                    <input
                      id="seller-account-number"
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accountNumber: e.target.value,
                        })
                      }
                      placeholder="123-456-789012"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-6">
                  <label className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked={formData.isBusiness}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isBusiness: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">사업자입니다</span>
                  </label>

                  {formData.isBusiness && (
                    <div>
                      <label
                        htmlFor="seller-business-number"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        사업자 등록번호
                      </label>
                      <input
                        id="seller-business-number"
                        type="text"
                        value={formData.businessNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            businessNumber: e.target.value,
                          })
                        }
                        placeholder="123-45-67890"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2단계: 판매자 프로필 */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-base md:text-lg font-bold text-gray-900 mb-6">
                2단계: 판매자 프로필
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2">프로필 사진 *</div>
                  {initialProfile?.profile_image && !formData.profileImage && (
                    <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <Info className="w-3 h-3 mr-1 inline" />
                        현재 회원 프로필 사진이 사용됩니다. 변경하려면 새 사진을 업로드하세요.
                      </p>
                    </div>
                  )}
                  <div className="space-y-3">
                    {profilePreview ? (
                      <div className="flex items-center gap-4">
                        <div className="w-32 h-32 relative rounded-full border border-gray-300 overflow-hidden">
                          <Image
                            src={profilePreview}
                            alt="프로필 미리보기"
                            fill
                            className="object-cover"
                            sizes="128px"
                            unoptimized
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              // 새 이미지를 올렸다가 취소하는 경우 -> 초기 이미지로 복구
                              if (formData.profileImage && initialProfile?.profile_image) {
                                setFormData({ ...formData, profileImage: null });
                                setProfilePreview(initialProfile.profile_image);
                              }
                              // 기존 이미지를 삭제하거나, 새 이미지를 삭제하는 경우 -> 빈 상태로
                              else {
                                setFormData({ ...formData, profileImage: null });
                                setProfilePreview(null);
                              }
                            }}
                            aria-label="프로필 사진 변경 취소 또는 제거"
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                          >
                            <X className="w-3 h-3 mr-1 inline" />
                            {formData.profileImage && initialProfile?.profile_image
                              ? '변경 취소'
                              : '이미지 제거'}
                          </button>
                          {initialProfile?.profile_image && formData.profileImage && (
                            <p className="text-xs text-gray-500">기존 이미지로 되돌아갑니다</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="seller-profile-image"
                        className="inline-block px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        <input
                          id="seller-profile-image"
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                          className="hidden"
                        />
                        <Camera className="w-4 h-4 mr-2 inline" />
                        프로필 사진 선택
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="seller-display-name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    판매자명 (활동명) *
                  </label>
                  <input
                    id="seller-display-name"
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="예: 디자이너 홍길동"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">구매자에게 보여질 이름입니다</p>
                </div>

                <div>
                  <label
                    htmlFor="seller-bio"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    자기소개 * (최소 50자)
                  </label>
                  <textarea
                    id="seller-bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={6}
                    maxLength={300}
                    placeholder="자신의 전문 분야, 경력, 강점 등을 소개해주세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    required
                  ></textarea>
                  <p
                    className={`text-sm mt-1 ${formData.bio.length < 50 ? 'text-red-600' : 'text-gray-500'}`}
                  >
                    {formData.bio.length}/50자
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3단계: 연락처 정보 */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-base md:text-lg font-bold text-gray-900 mb-6">
                3단계: 연락처 정보 (선택)
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="seller-show-phone" className="flex items-center gap-2 mb-2">
                    <input
                      id="seller-show-phone"
                      type="checkbox"
                      checked={formData.showPhone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          showPhone: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">전화번호 공개</span>
                  </label>
                  {formData.showPhone && (
                    <input
                      id="seller-public-phone"
                      type="tel"
                      value={formData.publicPhone}
                      onChange={(e) => {
                        const value = e.target.value.replaceAll(/[^0-9-]/g, '');
                        setFormData({ ...formData, publicPhone: value });
                      }}
                      placeholder="010-1234-5678"
                      pattern="[0-9-]*"
                      aria-label="공개할 전화번호"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    />
                  )}
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
                    value={formData.kakaoId}
                    onChange={(e) => setFormData({ ...formData, kakaoId: e.target.value })}
                    placeholder="kakaotalk_id"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="seller-kakao-openchat"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    카카오톡 오픈채팅 링크
                  </label>
                  <input
                    id="seller-kakao-openchat"
                    type="url"
                    value={formData.kakaoOpenChat}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        kakaoOpenChat: e.target.value,
                      })
                    }
                    placeholder="https://open.kakao.com/..."
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
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => {
                      const value = e.target.value.replaceAll(/\D/g, '');
                      setFormData({ ...formData, whatsapp: value });
                    }}
                    placeholder="821012345678 (국가번호 포함, 하이픈 없이)"
                    pattern="[0-9]*"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    클릭 시 바로 WhatsApp 채팅 연결됩니다 (예: 821012345678)
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="seller-website"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    개인 웹사이트/블로그
                  </label>
                  <input
                    id="seller-website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2">
                    선호하는 연락 수단 (복수 선택 가능)
                  </div>
                  <div className="space-y-2">
                    {['플랫폼 메시지', '카카오톡', 'WhatsApp', '이메일', '전화'].map((contact) => (
                      <label
                        key={contact}
                        htmlFor={`seller-contact-${contact}`}
                        className="flex items-center gap-2"
                      >
                        <input
                          id={`seller-contact-${contact}`}
                          type="checkbox"
                          checked={formData.preferredContact.includes(contact)}
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
          )}

          {/* 4단계: 약관 동의 */}
          {currentStep === 4 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">4단계: 운영 정책 동의</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <label htmlFor="seller-terms-agree" className="flex items-start gap-3">
                    <input
                      id="seller-terms-agree"
                      type="checkbox"
                      checked={formData.termsAgree}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          termsAgree: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-brand-primary border-gray-300 rounded focus:ring-brand-primary mt-0.5"
                      aria-label="판매자 이용약관 동의"
                      required
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">판매자 이용약관 동의 (필수)</span>
                      <p className="text-sm text-gray-600 mt-1">
                        판매자로서 준수해야 할 규정과 책임사항에 동의합니다.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="border rounded-lg p-4">
                  <label htmlFor="seller-commission-agree" className="flex items-start gap-3">
                    <input
                      id="seller-commission-agree"
                      type="checkbox"
                      checked={formData.commissionAgree}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          commissionAgree: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-brand-primary border-gray-300 rounded focus:ring-brand-primary mt-0.5"
                      aria-label="수수료 정책 확인"
                      required
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">수수료 정책 확인 (필수)</span>
                      <p className="text-sm text-gray-600 mt-1">
                        거래 금액의 20% 플랫폼 수수료가 부과됩니다.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="border rounded-lg p-4">
                  <label htmlFor="seller-refund-agree" className="flex items-start gap-3">
                    <input
                      id="seller-refund-agree"
                      type="checkbox"
                      checked={formData.refundAgree}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          refundAgree: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-brand-primary border-gray-300 rounded focus:ring-brand-primary mt-0.5"
                      aria-label="환불 정책 확인"
                      required
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">환불 정책 동의 (필수)</span>
                      <p className="text-sm text-gray-600 mt-1">
                        작업 시작 전 취소 시 전액 환불, 진행 중 환불은 협의를 통해 결정됩니다.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 네비게이션 버튼 */}
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2 inline" />
                이전
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                다음
                <ArrowLeft className="w-4 h-4 ml-2 inline transform rotate-180" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed() || loading}
                className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-[#1a4d8f] transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                    등록 중...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2 inline" />
                    판매자 등록 완료
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
