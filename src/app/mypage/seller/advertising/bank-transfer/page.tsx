'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MypageLayoutWrapper from '@/components/mypage/MypageLayoutWrapper';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

type PackageType = 'basic' | 'standard' | 'premium';

interface Service {
  id: string;
  title: string;
  thumbnailUrl: string | null;
}

interface FormData {
  serviceId: string;
  packageType: PackageType;
  depositorName: string;
  phone: string;
  email: string;
  businessRegistrationNumber: string;
  taxInvoiceRequested: boolean;
  depositBank: string;
  depositDate: string;
  depositTime: string;
  depositAmount: number;
  receiptFile: File | null;
}

const PACKAGES = {
  basic: {
    name: '베이직',
    price: 100000,
    features: ['기본 노출', '월 1,000회 노출 보장', '기본 통계 제공'],
  },
  standard: {
    name: '스탠다드',
    price: 200000,
    features: ['우선 노출', '월 3,000회 노출 보장', '상세 통계 제공', '주간 리포트'],
  },
  premium: {
    name: '프리미엄',
    price: 300000,
    features: ['최우선 노출', '월 10,000회 노출 보장', '실시간 통계', '일간 리포트', '전담 매니저'],
  },
};

const BANK_ACCOUNT = {
  bank: '국민은행',
  account: '123-456-789012',
  holder: '(주)탤런트',
};

export default function BankTransferAdvertisingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    serviceId: '',
    packageType: 'basic',
    depositorName: '',
    phone: '',
    email: '',
    businessRegistrationNumber: '',
    taxInvoiceRequested: false,
    depositBank: '',
    depositDate: '',
    depositTime: '',
    depositAmount: 0,
    receiptFile: null,
  });

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      const response = await fetch('/api/seller/advertising/dashboard');
      if (!response.ok) throw new Error('Failed to load services');

      const data = await response.json();
      setServices(
        data.services?.filter((s: Service & { hasActiveAd?: boolean }) => !s.hasActiveAd) || []
      );
    } catch (error) {
      logger.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleNext() {
    setStep(step + 1);
  }

  function handleBack() {
    setStep(step - 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('serviceId', formData.serviceId);
      formDataToSend.append('packageType', formData.packageType);
      formDataToSend.append('depositorName', formData.depositorName);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('businessRegistrationNumber', formData.businessRegistrationNumber);
      formDataToSend.append('taxInvoiceRequested', formData.taxInvoiceRequested.toString());
      formDataToSend.append('depositBank', formData.depositBank);
      formDataToSend.append('depositDate', formData.depositDate);
      formDataToSend.append('depositTime', formData.depositTime);
      formDataToSend.append('amount', formData.depositAmount.toString());

      if (formData.receiptFile) {
        formDataToSend.append('receipt', formData.receiptFile);
      }

      const response = await fetch('/api/seller/advertising/bank-transfer', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) throw new Error('Failed to submit');

      setStep(6);
    } catch (error) {
      logger.error('Failed to submit:', error);
      toast.error('입금 확인 요청 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <MypageLayoutWrapper mode="seller">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#0f3460] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">로딩중...</p>
          </div>
        </div>
      </MypageLayoutWrapper>
    );
  }

  return (
    <MypageLayoutWrapper mode="seller">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step >= s ? 'bg-[#0f3460] text-white' : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {s}
                  </div>
                  {s < 6 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${step > s ? 'bg-[#0f3460]' : 'bg-gray-300'}`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className={step >= 1 ? 'text-[#0f3460] font-bold' : 'text-gray-500'}>
                재능 선택
              </span>
              <span className={step >= 2 ? 'text-[#0f3460] font-bold' : 'text-gray-500'}>
                광고 상품
              </span>
              <span className={step >= 3 ? 'text-[#0f3460] font-bold' : 'text-gray-500'}>
                정보 입력
              </span>
              <span className={step >= 4 ? 'text-[#0f3460] font-bold' : 'text-gray-500'}>
                입금 정보
              </span>
              <span className={step >= 5 ? 'text-[#0f3460] font-bold' : 'text-gray-500'}>
                입금 확인
              </span>
              <span className={step >= 6 ? 'text-[#0f3460] font-bold' : 'text-gray-500'}>완료</span>
            </div>
          </div>

          {/* Step 1: Service Selection */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">광고할 재능을 선택하세요</h2>

              {services.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">광고 가능한 서비스가 없습니다.</p>
                  <p className="text-sm text-gray-500">
                    모든 서비스에 이미 광고가 활성화되어 있습니다.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, serviceId: service.id });
                        handleNext();
                      }}
                      aria-label={`${service.title} 선택`}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all text-left ${
                        formData.serviceId === service.id
                          ? 'border-[#0f3460] bg-blue-50'
                          : 'border-gray-200 hover:border-[#0f3460]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {service.thumbnailUrl && (
                          <img
                            src={service.thumbnailUrl}
                            alt={service.title}
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <div>
                          <h3 className="font-bold text-lg">{service.title}</h3>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Package Selection */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">광고 상품을 선택하세요</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(PACKAGES).map(([key, pkg]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setFormData({
                        ...formData,
                        packageType: key as PackageType,
                        depositAmount: pkg.price,
                      });
                    }}
                    type="button"
                    aria-label={`${pkg.name} 상품 선택`}
                    className={`border-2 rounded-lg p-6 cursor-pointer transition-all text-left ${
                      formData.packageType === key
                        ? 'border-[#0f3460] bg-blue-50'
                        : 'border-gray-200 hover:border-[#0f3460]'
                    }`}
                  >
                    <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                    <p className="text-3xl font-bold text-[#0f3460] mb-4">
                      {pkg.price.toLocaleString()}원
                      <span className="text-sm text-gray-600">/월</span>
                    </p>
                    <ul className="space-y-2">
                      {pkg.features.map((feature, idx) => (
                        <li key={`${key}-feature-${idx}`} className="text-sm text-gray-700">
                          ✓ {feature}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  이전
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 bg-[#0f3460] text-white px-6 py-3 rounded-lg hover:bg-[#1a4d8f]"
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Information Input */}
          {step === 3 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">입금자 정보를 입력하세요</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="depositor-name" className="block text-sm font-bold mb-2">
                    입금자명 *
                  </label>
                  <input
                    id="depositor-name"
                    type="text"
                    value={formData.depositorName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        depositorName: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    placeholder="홍길동"
                  />
                </div>

                <div>
                  <label htmlFor="depositor-phone" className="block text-sm font-bold mb-2">
                    연락처 *
                  </label>
                  <input
                    id="depositor-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    placeholder="010-1234-5678"
                  />
                </div>

                <div>
                  <label htmlFor="depositor-email" className="block text-sm font-bold mb-2">
                    이메일 *
                  </label>
                  <input
                    id="depositor-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="business-registration" className="block text-sm font-bold mb-2">
                    사업자 등록번호 (선택)
                  </label>
                  <input
                    id="business-registration"
                    type="text"
                    value={formData.businessRegistrationNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessRegistrationNumber: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    placeholder="123-45-67890"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="taxInvoice"
                    checked={formData.taxInvoiceRequested}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        taxInvoiceRequested: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <label htmlFor="taxInvoice" className="text-sm">
                    세금계산서 발행 요청
                  </label>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    입력하신 정보는 입금 확인 및 세금계산서 발행 목적으로만 사용됩니다.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  이전
                </button>
                <button
                  onClick={handleNext}
                  disabled={!formData.depositorName || !formData.phone || !formData.email}
                  className="flex-1 bg-[#0f3460] text-white px-6 py-3 rounded-lg hover:bg-[#1a4d8f] disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Deposit Information */}
          {step === 4 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">입금 정보</h2>

              <div className="bg-blue-50 border-2 border-[#0f3460] rounded-lg p-6 mb-6">
                <h3 className="font-bold text-lg mb-4">계좌 정보</h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-bold">은행:</span> {BANK_ACCOUNT.bank}
                  </p>
                  <p>
                    <span className="font-bold">계좌번호:</span> {BANK_ACCOUNT.account}
                  </p>
                  <p>
                    <span className="font-bold">예금주:</span> {BANK_ACCOUNT.holder}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4">주문 요약</h3>
                <div className="space-y-2">
                  <p>
                    <span className="text-gray-600">상품:</span>{' '}
                    {PACKAGES[formData.packageType].name} 플랜
                  </p>
                  <p>
                    <span className="text-gray-600">금액:</span>{' '}
                    <span className="text-2xl font-bold text-[#0f3460]">
                      {formData.depositAmount.toLocaleString()}원
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">입금자:</span> {formData.depositorName}
                  </p>
                </div>
              </div>

              <div className="mt-6 bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  입금 후 다음 단계에서 입금 확인 정보를 입력해주세요.
                </p>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  이전
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 bg-[#0f3460] text-white px-6 py-3 rounded-lg hover:bg-[#1a4d8f]"
                >
                  입금 완료, 다음
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Deposit Confirmation */}
          {step === 5 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">입금 확인 정보를 입력하세요</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="deposit-bank" className="block text-sm font-bold mb-2">
                    입금 은행 *
                  </label>
                  <select
                    id="deposit-bank"
                    value={formData.depositBank}
                    onChange={(e) => setFormData({ ...formData, depositBank: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  >
                    <option value="">선택하세요</option>
                    <option value="KB국민">KB국민은행</option>
                    <option value="신한">신한은행</option>
                    <option value="우리">우리은행</option>
                    <option value="하나">하나은행</option>
                    <option value="NH농협">NH농협은행</option>
                    <option value="카카오뱅크">카카오뱅크</option>
                    <option value="토스뱅크">토스뱅크</option>
                    <option value="기타">기타</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="deposit-date" className="block text-sm font-bold mb-2">
                    입금 날짜 *
                  </label>
                  <input
                    id="deposit-date"
                    type="date"
                    value={formData.depositDate}
                    onChange={(e) => setFormData({ ...formData, depositDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label htmlFor="deposit-time" className="block text-sm font-bold mb-2">
                    입금 시간 *
                  </label>
                  <input
                    id="deposit-time"
                    type="time"
                    value={formData.depositTime}
                    onChange={(e) => setFormData({ ...formData, depositTime: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label htmlFor="deposit-amount" className="block text-sm font-bold mb-2">
                    입금 금액 확인 *
                  </label>
                  <input
                    id="deposit-amount"
                    type="number"
                    value={formData.depositAmount}
                    readOnly
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50"
                  />
                </div>

                <div>
                  <label htmlFor="receipt-upload" className="block text-sm font-bold mb-2">
                    입금증 첨부 (선택)
                  </label>
                  <input
                    id="receipt-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setFormData({ ...formData, receiptFile: file });
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG 파일만 업로드 가능합니다.</p>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  이전
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    !formData.depositBank ||
                    !formData.depositDate ||
                    !formData.depositTime ||
                    submitting
                  }
                  className="flex-1 bg-[#0f3460] text-white px-6 py-3 rounded-lg hover:bg-[#1a4d8f] disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submitting ? '처리중...' : '입금 확인 요청'}
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Completion */}
          {step === 6 && (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold mb-4">입금 확인 요청이 완료되었습니다</h2>

              <p className="text-gray-600 mb-6">
                관리자가 입금을 확인한 후 광고가 활성화됩니다.
                <br />
                일반적으로 1~2 영업일 내에 처리됩니다.
              </p>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-bold mb-2">다음 단계</h3>
                <ul className="text-sm text-gray-600 space-y-1 text-left max-w-md mx-auto">
                  <li>1. 관리자가 입금 확인</li>
                  <li>2. 광고 활성화</li>
                  <li>3. 이메일로 활성화 알림 발송</li>
                  <li>4. 광고 노출 시작</li>
                </ul>
              </div>

              <button
                onClick={() => router.push('/mypage/seller/advertising')}
                className="bg-[#0f3460] text-white px-8 py-3 rounded-lg hover:bg-[#1a4d8f]"
              >
                광고 관리로 이동
              </button>
            </div>
          )}
        </div>
      </div>
    </MypageLayoutWrapper>
  );
}
