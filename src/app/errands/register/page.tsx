'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { logger } from '@/lib/logger';
import toast from 'react-hot-toast';
import {
  Bike,
  CreditCard,
  CheckCircle,
  Gift,
  Shield,
  Clock,
  ChevronRight,
  ArrowLeft,
  Star,
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

export default function ErrandRiderRegisterPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    bank_name: '',
    bank_account: '',
    account_holder: '',
    bio: '',
    agree_terms: false,
    agree_privacy: false,
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

  const handleSubmit = async () => {
    if (!formData.bank_name || !formData.bank_account || !formData.account_holder) {
      toast.error('계좌 정보를 모두 입력해주세요');
      return;
    }

    if (!formData.agree_terms || !formData.agree_privacy) {
      toast.error('약관에 동의해주세요');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bank_name: formData.bank_name,
          bank_account: formData.bank_account,
          account_holder: formData.account_holder,
          bio: formData.bio || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '등록에 실패했습니다');
      }

      toast.success('라이더 등록이 완료되었습니다!');
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
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-primary rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-white fill-current" />
            </div>
            <span className="font-semibold text-gray-900">돌파구</span>
          </Link>
          <div className="w-9" /> {/* 균형 맞춤 */}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* 타이틀 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Bike className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">라이더 등록</h1>
          <p className="text-gray-600">심부름을 수행하고 수익을 올려보세요</p>
        </div>

        {/* 혜택 안내 */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6 mb-6">
          <h2 className="font-bold text-green-700 mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5" />첫 달 무료 체험!
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">30일 무료 체험</p>
                <p className="text-sm text-gray-600">
                  가입 후 30일간 무료로 라이더 서비스를 이용해보세요
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">플랫폼 수수료 0%</p>
                <p className="text-sm text-gray-600">
                  수익금 전액을 그대로 가져가세요. 수수료 없습니다!
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">자유로운 활동</p>
                <p className="text-sm text-gray-600">원할 때 원하는 심부름만 선택해서 수행하세요</p>
              </div>
            </div>
          </div>
        </div>

        {/* 스텝 인디케이터 */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div
            className={`flex items-center gap-2 ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}
          >
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200'
              }`}
            >
              1
            </span>
            <span className="font-medium hidden sm:inline">계좌 정보</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <div
            className={`flex items-center gap-2 ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}
          >
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200'
              }`}
            >
              2
            </span>
            <span className="font-medium hidden sm:inline">약관 동의</span>
          </div>
        </div>

        {/* 스텝 1: 계좌 정보 */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-600" />
              정산 계좌 정보
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              심부름 대금을 받을 계좌를 입력해주세요. 나중에 변경할 수 있습니다.
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  placeholder="예금주명"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (!formData.bank_name || !formData.bank_account || !formData.account_holder) {
                  toast.error('필수 항목을 모두 입력해주세요');
                  return;
                }
                setStep(2);
              }}
              className="w-full mt-6 py-3.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium text-lg"
            >
              다음
            </button>
          </div>
        )}

        {/* 스텝 2: 약관 동의 */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">약관 동의</h3>

            <div className="space-y-4">
              <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  name="agree_terms"
                  checked={formData.agree_terms}
                  onChange={handleChange}
                  className="w-5 h-5 mt-0.5 text-green-600 rounded focus:ring-green-500"
                />
                <div>
                  <p className="font-medium text-gray-900">
                    라이더 이용약관 동의 <span className="text-red-500">*</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    심부름 서비스 이용에 관한 약관에 동의합니다.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  name="agree_privacy"
                  checked={formData.agree_privacy}
                  onChange={handleChange}
                  className="w-5 h-5 mt-0.5 text-green-600 rounded focus:ring-green-500"
                />
                <div>
                  <p className="font-medium text-gray-900">
                    개인정보 수집 및 이용 동의 <span className="text-red-500">*</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    정산 처리를 위한 계좌정보 수집에 동의합니다.
                  </p>
                </div>
              </label>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-green-700">
                <strong>월 이용료:</strong> 30,000원 (부가세 별도)
                <br />
                <strong>결제일:</strong> 무료 체험 종료 후 매월 자동 결제
                <br />
                <strong>플랫폼 수수료:</strong> 0원 (없음)
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                이전
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? '등록 중...' : '등록 완료'}
              </button>
            </div>
          </div>
        )}

        {/* 하단 안내 */}
        <p className="text-center text-sm text-gray-500 mt-6">
          이미 라이더이신가요?{' '}
          <Link href="/errands/mypage/helper" className="text-green-600 hover:underline font-medium">
            라이더 대시보드로 이동
          </Link>
        </p>
      </main>
    </div>
  );
}
