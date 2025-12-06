'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/providers/AuthProvider';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { logger } from '@/lib/logger';
import toast from 'react-hot-toast';
import * as PortOne from '@portone/browser-sdk/v2';
import {
  CreditCard,
  CheckCircle,
  Shield,
  Clock,
  ChevronRight,
  ChevronLeft,
  User,
  FileText,
  Camera,
  Upload,
  AlertTriangle,
  Phone,
  ExternalLink,
  X,
  Info,
  Ban,
  Fingerprint,
  ArrowLeft,
  Gift,
  MapPin,
} from 'lucide-react';

const BANK_LIST = [
  '국민은행',
  '신한은행',
  '하나은행',
  '우리은행',
  '농협은행',
  '기업은행',
  'SC제일은행',
  '카카오뱅크',
  '케이뱅크',
  '토스뱅크',
];

// 성별 변환 헬퍼 함수
function convertGenderFromApi(gender: string | null): string {
  if (gender === 'MALE') return 'male';
  if (gender === 'FEMALE') return 'female';
  return '';
}

// PortOne 본인인증 결과 처리
async function verifyIdentityWithServer(identityVerificationId: string) {
  const response = await fetch('/api/auth/verify-identity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identityVerificationId }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || '본인인증 검증 실패');
  }

  return {
    name: result.name || '',
    phone: result.phone || '',
    birthDate: result.birthDate || '',
    gender: convertGenderFromApi(result.gender),
  };
}

// 4단계로 변경: 본인인증 → 서류제출 → 계좌정보 → 약관동의
const STEPS = [
  { number: 1, title: '본인인증', icon: Fingerprint },
  { number: 2, title: '서류제출', icon: FileText },
  { number: 3, title: '계좌정보', icon: CreditCard },
  { number: 4, title: '약관동의', icon: CheckCircle },
];

interface FileUpload {
  file: File | null;
  preview: string | null;
  uploading: boolean;
}

// eslint-disable-next-line sonarjs/cognitive-complexity -- 다단계 등록 폼 페이지로 복잡도가 높음
export default function ErrandRiderRegisterPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // 파일 입력 refs
  const idCardRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);
  const criminalRecordRef = useRef<HTMLInputElement>(null);

  // 폼 데이터
  const [formData, setFormData] = useState({
    // Step 1: 본인인증 후 자동 입력
    name: '',
    birth_date: '',
    gender: '',
    phone_number: '',
    phone_verified: false,

    // 주소는 별도 입력
    address: '',
    detail_address: '',

    // Step 2: 서류 제출
    id_card: { file: null, preview: null, uploading: false } as FileUpload,
    selfie: { file: null, preview: null, uploading: false } as FileUpload,
    criminal_record: { file: null, preview: null, uploading: false } as FileUpload,

    // Step 3: 계좌 정보
    bank_name: '',
    bank_account: '',
    account_holder: '',
    bio: '',

    // Step 4: 약관 동의
    agree_terms: false,
    agree_privacy: false,
    agree_criminal_check: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: 'id_card' | 'selfie' | 'criminal_record'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('파일 크기는 10MB 이하만 가능합니다');
      return;
    }

    // 이미지 또는 PDF만 허용
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('이미지 또는 PDF 파일만 업로드 가능합니다');
      return;
    }

    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;

    setFormData((prev) => ({
      ...prev,
      [fieldName]: { file, preview, uploading: false },
    }));
  };

  const removeFile = (fieldName: 'id_card' | 'selfie' | 'criminal_record') => {
    if (formData[fieldName].preview) {
      URL.revokeObjectURL(formData[fieldName].preview!);
    }
    setFormData((prev) => ({
      ...prev,
      [fieldName]: { file: null, preview: null, uploading: false },
    }));
  };

  // 본인인증 상태
  const [isVerifying, setIsVerifying] = useState(false);

  // PortOne 본인인증 처리
  const handleIdentityVerification = async () => {
    setIsVerifying(true);

    try {
      // 고유한 인증 ID 생성
      const identityVerificationId = `helper_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
      localStorage.setItem('verifyReturnUrl', '/errands/register');

      // PortOne 본인인증 요청 (KCP 휴대폰 본인인증)
      const response = await PortOne.requestIdentityVerification({
        storeId: 'store-8855d73e-d61a-469b-a5ed-60e21cc45122',
        channelKey: 'channel-key-112bb8b1-8dcc-4045-9686-66b83f0f0026',
        identityVerificationId,
        redirectUrl: `${window.location.origin}/verify-identity/callback`,
        windowType: { pc: 'POPUP', mobile: 'REDIRECTION' },
      });

      // 사용자 취소 처리
      if (response?.code === 'FAILURE_TYPE_PG' && response.message?.includes('취소')) {
        toast('본인인증이 취소되었습니다');
        return;
      }

      if (response?.code) {
        throw new Error(response.message || '본인인증 중 오류가 발생했습니다');
      }

      // 서버에서 본인인증 결과 검증
      const verifiedData = await verifyIdentityWithServer(identityVerificationId);

      setFormData((prev) => ({
        ...prev,
        name: verifiedData.name,
        phone_number: verifiedData.phone,
        birth_date: verifiedData.birthDate,
        gender: verifiedData.gender,
        phone_verified: true,
      }));

      toast.success(`본인인증이 완료되었습니다. ${verifiedData.name}님`);
    } catch (error) {
      logger.error('Identity verification error:', error);
      toast.error(error instanceof Error ? error.message : '본인인증 중 오류가 발생했습니다');
    } finally {
      setIsVerifying(false);
    }
  };

  const validateStep1 = (): boolean => {
    if (!formData.phone_verified) {
      toast.error('본인인증을 완료해주세요');
      return false;
    }
    if (!formData.address) {
      toast.error('주소를 입력해주세요');
      return false;
    }
    const birthYear = parseInt(formData.birth_date.split('-')[0]);
    const currentYear = new Date().getFullYear();
    if (currentYear - birthYear < 19) {
      toast.error('만 19세 이상만 등록 가능합니다');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!formData.id_card.file) {
      toast.error('신분증을 업로드해주세요');
      return false;
    }
    if (!formData.selfie.file) {
      toast.error('본인 얼굴 사진을 업로드해주세요');
      return false;
    }
    if (!formData.criminal_record.file) {
      toast.error('범죄경력회보서를 업로드해주세요');
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    if (!formData.bank_name || !formData.bank_account || !formData.account_holder) {
      toast.error('계좌 정보를 모두 입력해주세요');
      return false;
    }
    return true;
  };

  const validateStep4 = (): boolean => {
    const allAgreed =
      formData.agree_terms && formData.agree_privacy && formData.agree_criminal_check;
    if (!allAgreed) {
      toast.error('모든 약관에 동의해주세요');
      return false;
    }
    return true;
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return validateStep1();
      case 2:
        return validateStep2();
      case 3:
        return validateStep3();
      case 4:
        return validateStep4();
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    try {
      setLoading(true);

      // FormData로 파일 업로드 포함
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('birth_date', formData.birth_date);
      submitData.append('gender', formData.gender);
      submitData.append('address', formData.address);
      submitData.append('detail_address', formData.detail_address);
      submitData.append('phone_number', formData.phone_number);
      submitData.append('bank_name', formData.bank_name);
      submitData.append('bank_account', formData.bank_account);
      submitData.append('account_holder', formData.account_holder);
      submitData.append('bio', formData.bio || '');

      if (formData.id_card.file) {
        submitData.append('id_card', formData.id_card.file);
      }
      if (formData.selfie.file) {
        submitData.append('selfie', formData.selfie.file);
      }
      if (formData.criminal_record.file) {
        submitData.append('criminal_record', formData.criminal_record.file);
      }

      const response = await fetch('/api/helper', {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '등록에 실패했습니다');
      }

      toast.success('라이더 등록 신청이 완료되었습니다! 심사 후 승인 결과를 안내드립니다.');
      router.push('/errands/mypage/helper');
    } catch (err) {
      logger.error('라이더 등록 실패:', err);
      toast.error(err instanceof Error ? err.message : '등록에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-8">
          <LoadingSpinner message="로딩 중..." />
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login?redirect=/errands/register');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="flex-1 text-center font-semibold text-gray-900">라이더 등록</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* 타이틀 */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600">안전한 서비스를 위해 신원 확인이 필요합니다</p>
        </div>

        {/* 생활물류서비스산업발전법 안내 배너 */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800 mb-1">
                생활물류서비스산업발전법 (제19조의 2, 3)
              </p>
              <p className="text-xs text-red-700 mb-2">
                2025년 1월 17일부터 시행된 법률에 따라 <strong>범죄경력회보서 제출</strong>이
                의무화되었습니다.
              </p>
              <ul className="text-xs text-red-700 space-y-1">
                <li>• 소화물 배송 대행 종사자 범죄경력 조회 의무</li>
                <li>• 살인·성범죄 20년, 절도 상습 18년, 마약류 2~10년 취업 제한</li>
                <li>• 미확인 시 사업자에게 최대 500만원 과태료 부과</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 혜택 안내 (첫 화면에서만 표시) */}
        {step === 1 && !formData.phone_verified && (
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border border-orange-200 p-4 mb-6">
            <h2 className="font-bold text-orange-700 mb-3 flex items-center gap-2 text-sm">
              <Gift className="w-4 h-4" />첫 달 무료 체험!
            </h2>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">30일 무료 체험</p>
                  <p className="text-xs text-gray-600">가입 후 30일간 무료로 이용해보세요</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">플랫폼 수수료 0%</p>
                  <p className="text-xs text-gray-600">수익금 전액을 가져가세요!</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">자유로운 활동</p>
                  <p className="text-xs text-gray-600">원할 때 원하는 심부름만 선택하세요</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 스텝 인디케이터 */}
        <div className="flex items-center justify-between mb-6 px-2">
          {STEPS.map((s, index) => (
            <div key={s.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    step >= s.number ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > s.number ? <CheckCircle className="w-4 h-4" /> : s.number}
                </div>
                <span
                  className={`text-[10px] mt-1 font-medium ${
                    step >= s.number ? 'text-orange-600' : 'text-gray-400'
                  }`}
                >
                  {s.title}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`w-6 sm:w-10 h-0.5 mx-1 ${
                    step > s.number ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: 본인인증 (이름, 생년월일, 성별, 휴대폰 자동 입력) */}
        {step === 1 && (
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
              <Fingerprint className="w-4 h-4 text-gray-600" />
              본인인증
            </h3>

            {!formData.phone_verified ? (
              <>
                <div className="bg-gray-50 rounded-lg p-4 mb-5">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        본인 명의 휴대폰으로 인증이 필요합니다
                      </p>
                      <p className="text-xs text-gray-600">
                        인증 완료 시 이름, 생년월일, 성별, 휴대폰 번호가 자동으로 입력됩니다.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleIdentityVerification}
                  disabled={isVerifying}
                  className="w-full py-3.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      인증 진행 중...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="w-5 h-5" />
                      본인인증 진행하기
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  KCP 휴대폰 본인인증으로 진행됩니다
                </p>
              </>
            ) : (
              <>
                {/* 본인인증 완료 - 정보 표시 */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-5">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">본인인증 완료</p>
                      <p className="text-xs text-green-700">
                        인증된 정보가 자동으로 입력되었습니다
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-white rounded-lg p-3 border border-green-100">
                      <p className="text-xs text-gray-500 mb-1">이름</p>
                      <p className="text-sm font-medium text-gray-900">{formData.name}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-100">
                      <p className="text-xs text-gray-500 mb-1">생년월일</p>
                      <p className="text-sm font-medium text-gray-900">{formData.birth_date}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-100">
                      <p className="text-xs text-gray-500 mb-1">성별</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formData.gender === 'male' ? '남성' : '여성'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-100">
                      <p className="text-xs text-gray-500 mb-1">휴대폰</p>
                      <p className="text-sm font-medium text-gray-900">{formData.phone_number}</p>
                    </div>
                  </div>
                </div>

                {/* 주소 입력 */}
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"
                    >
                      <MapPin className="w-4 h-4" />
                      활동 지역 주소 <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="address"
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="기본 주소 입력"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <input
                    id="detail_address"
                    type="text"
                    name="detail_address"
                    value={formData.detail_address}
                    onChange={handleChange}
                    placeholder="상세 주소 (선택)"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    주로 활동할 지역의 주소를 입력해주세요. 해당 지역의 심부름이 우선 노출됩니다.
                  </p>
                </div>

                <button
                  onClick={nextStep}
                  className="w-full mt-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  다음
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 2: 서류 제출 */}
        {step === 2 && (
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-gray-600" />
              서류 제출
            </h3>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 mb-1">서류 발급 안내</p>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>
                      • 범죄경력회보서(성범죄경력 포함)는{' '}
                      <a
                        href="https://www.gov.kr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-medium inline-flex items-center gap-0.5"
                      >
                        정부24
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      에서 무료 발급 가능합니다
                    </li>
                    <li>• 발급일로부터 3개월 이내의 서류만 유효합니다</li>
                    <li>• 모바일에서 카메라로 직접 촬영하거나 갤러리에서 선택할 수 있습니다</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {/* 신분증 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  신분증 사본 <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">주민등록증, 운전면허증, 여권 중 1개</p>
                {formData.id_card.file ? (
                  <div className="relative border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center gap-3">
                      {formData.id_card.preview ? (
                        <Image
                          src={formData.id_card.preview}
                          alt="신분증"
                          width={60}
                          height={40}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="w-[60px] h-[40px] bg-gray-200 rounded flex items-center justify-center">
                          <FileText className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {formData.id_card.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(formData.id_card.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => removeFile('id_card')}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => idCardRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-5 hover:border-orange-500 hover:bg-orange-50 transition-colors"
                  >
                    <div className="flex flex-col items-center">
                      <Camera className="w-7 h-7 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">촬영 또는 파일 선택</p>
                      <p className="text-xs text-gray-400 mt-1">모바일: 카메라 촬영 가능</p>
                    </div>
                  </button>
                )}
                <input
                  ref={idCardRef}
                  type="file"
                  accept="image/*,.pdf"
                  capture="environment"
                  onChange={(e) => handleFileChange(e, 'id_card')}
                  className="hidden"
                />
              </div>

              {/* 본인 얼굴 사진 (셀카) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  본인 얼굴 사진 <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  신분증과 동일인 확인용 (정면 얼굴이 잘 보이도록 촬영)
                </p>
                {formData.selfie.file ? (
                  <div className="relative border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center gap-3">
                      {formData.selfie.preview ? (
                        <Image
                          src={formData.selfie.preview}
                          alt="본인 사진"
                          width={60}
                          height={60}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-[60px] h-[60px] bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {formData.selfie.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(formData.selfie.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => removeFile('selfie')}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => selfieRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-5 hover:border-orange-500 hover:bg-orange-50 transition-colors"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                        <Camera className="w-7 h-7 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600">셀카 촬영 또는 파일 선택</p>
                      <p className="text-xs text-gray-400 mt-1">모바일: 전면 카메라로 촬영</p>
                    </div>
                  </button>
                )}
                <input
                  ref={selfieRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={(e) => handleFileChange(e, 'selfie')}
                  className="hidden"
                />
              </div>

              {/* 범죄경력회보서 (성범죄경력 포함) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  범죄경력회보서 (성범죄경력 포함) <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  정부24에서 발급 (본인용, 발급일 3개월 이내)
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                  <p className="text-xs text-blue-700">
                    <strong>발급 방법:</strong> 정부24 → &quot;범죄경력회보서&quot; 검색 →
                    &quot;본인용&quot; 선택 → 성범죄경력 조회 포함 체크
                  </p>
                </div>
                {formData.criminal_record.file ? (
                  <div className="relative border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center gap-3">
                      {formData.criminal_record.preview ? (
                        <Image
                          src={formData.criminal_record.preview}
                          alt="범죄경력회보서"
                          width={60}
                          height={40}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="w-[60px] h-[40px] bg-gray-200 rounded flex items-center justify-center">
                          <FileText className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {formData.criminal_record.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(formData.criminal_record.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => removeFile('criminal_record')}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => criminalRecordRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-5 hover:border-orange-500 hover:bg-orange-50 transition-colors"
                  >
                    <div className="flex flex-col items-center">
                      <Upload className="w-7 h-7 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">클릭하여 업로드</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF (최대 10MB)</p>
                    </div>
                  </button>
                )}
                <input
                  ref={criminalRecordRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'criminal_record')}
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={prevStep}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                이전
              </button>
              <button
                onClick={nextStep}
                className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2"
              >
                다음
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 계좌 정보 */}
        {step === 3 && (
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
              <CreditCard className="w-4 h-4 text-gray-600" />
              정산 계좌 정보
            </h3>
            <p className="text-sm text-gray-600 mb-5">
              심부름 대금을 받을 계좌를 입력해주세요. 본인 명의 계좌만 등록 가능합니다.
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700 mb-1">
                  은행 <span className="text-red-500">*</span>
                </label>
                <select
                  id="bank_name"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                >
                  <option value="">은행 선택</option>
                  {BANK_LIST.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="bank_account"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  계좌번호 <span className="text-red-500">*</span>
                </label>
                <input
                  id="bank_account"
                  type="text"
                  name="bank_account"
                  value={formData.bank_account}
                  onChange={handleChange}
                  placeholder="-없이 숫자만 입력"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="account_holder"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  예금주 <span className="text-red-500">*</span>
                </label>
                <input
                  id="account_holder"
                  type="text"
                  name="account_holder"
                  value={formData.account_holder}
                  onChange={handleChange}
                  placeholder="예금주명 (본인 명의)"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  본인인증된 이름({formData.name})과 동일해야 합니다
                </p>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  자기소개 (선택)
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  placeholder="라이더로서의 자기소개를 작성해주세요"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={prevStep}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                이전
              </button>
              <button
                onClick={nextStep}
                className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2"
              >
                다음
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: 약관 동의 */}
        {step === 4 && (
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-gray-600" />
              약관 동의 및 제출
            </h3>

            {/* 등록 불가 사유 안내 */}
            <div className="bg-gray-900 text-white rounded-lg p-4 mb-5">
              <div className="flex items-center gap-2 mb-2">
                <Ban className="w-4 h-4 text-red-400" />
                <span className="font-semibold text-sm">등록 불가 사유 안내</span>
              </div>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• 폭력, 절도, 사기 등 범죄 경력이 있는 경우</li>
                <li>• 성범죄 경력이 있는 경우</li>
                <li>• 마약류 관련 범죄 경력이 있는 경우</li>
                <li>• 허위 서류 제출 또는 신분증 위조의 경우</li>
              </ul>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  name="agree_terms"
                  checked={formData.agree_terms}
                  onChange={handleChange}
                  className="w-5 h-5 mt-0.5 text-orange-500 rounded focus:ring-orange-500"
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    라이더 이용약관 동의 <span className="text-red-500">*</span>
                  </p>
                  <p className="text-xs text-gray-600">
                    심부름 서비스 이용에 관한 약관에 동의합니다.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  name="agree_privacy"
                  checked={formData.agree_privacy}
                  onChange={handleChange}
                  className="w-5 h-5 mt-0.5 text-orange-500 rounded focus:ring-orange-500"
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    개인정보 수집 및 이용 동의 <span className="text-red-500">*</span>
                  </p>
                  <p className="text-xs text-gray-600">
                    신원 확인 및 정산 처리를 위한 개인정보 수집에 동의합니다.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 border border-orange-200 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100">
                <input
                  type="checkbox"
                  name="agree_criminal_check"
                  checked={formData.agree_criminal_check}
                  onChange={handleChange}
                  className="w-5 h-5 mt-0.5 text-orange-500 rounded focus:ring-orange-500"
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    범죄경력 및 성범죄경력 조회 동의 <span className="text-red-500">*</span>
                  </p>
                  <p className="text-xs text-gray-600">
                    제출된 범죄경력회보서 및 성범죄경력의 진위 확인에 동의합니다.
                  </p>
                </div>
              </label>
            </div>

            {/* 혜택 안내 */}
            <div className="mt-5 p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="font-semibold text-sm text-orange-800">승인 후 혜택</span>
              </div>
              <ul className="text-xs text-orange-700 space-y-1">
                <li>• 30일 무료 체험 (이후 월 30,000원)</li>
                <li>• 플랫폼 수수료 0%</li>
                <li>• 심사 기간: 영업일 기준 1-3일</li>
              </ul>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={prevStep}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                이전
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '제출 중...' : '등록 신청'}
              </button>
            </div>

            {/* 가이드 링크 */}
            <div className="mt-4 text-center">
              <Link
                href="/helper/guide"
                className="text-xs text-gray-500 hover:text-orange-500 inline-flex items-center gap-1"
              >
                <Info className="w-3 h-3" />
                등록 가이드 자세히 보기
              </Link>
            </div>
          </div>
        )}

        {/* 하단 안내 */}
        <p className="text-center text-sm text-gray-500 mt-6">
          이미 라이더이신가요?{' '}
          <Link
            href="/errands/mypage/helper"
            className="text-orange-600 hover:underline font-medium"
          >
            라이더 대시보드로 이동
          </Link>
        </p>
      </main>
    </div>
  );
}
