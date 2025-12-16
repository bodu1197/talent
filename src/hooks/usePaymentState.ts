/**
 * 결제 상태 관리 공통 Hook
 * DirectPaymentClient, AdvertisingPaymentClient에서 사용하는 공통 상태를 관리
 */

import { useState } from 'react';

// 공통 타입 정의
export type PaymentMethod = 'CARD' | 'TRANSFER' | 'VIRTUAL_ACCOUNT' | 'MOBILE' | 'EASY_PAY';
export type EasyPayProvider = 'TOSSPAY' | 'NAVERPAY' | 'KAKAOPAY' | null;

export interface PaymentState {
  isProcessing: boolean;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  selectedPaymentMethod: PaymentMethod;
  easyPayProvider: EasyPayProvider;
  isInternationalCard: boolean;
  phoneInput: string;
}

export interface PaymentStateActions {
  setIsProcessing: (value: boolean) => void;
  setAgreedToTerms: (value: boolean) => void;
  setAgreedToPrivacy: (value: boolean) => void;
  setSelectedPaymentMethod: (value: PaymentMethod) => void;
  setEasyPayProvider: (value: EasyPayProvider) => void;
  setIsInternationalCard: (value: boolean) => void;
  setPhoneInput: (value: string) => void;
}

export interface UsePaymentStateReturn extends PaymentState, PaymentStateActions {}

/**
 * 결제 상태 관리 Hook
 * @returns 결제 관련 상태와 상태 변경 함수들
 */
export function usePaymentState(): UsePaymentStateReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('CARD');
  const [easyPayProvider, setEasyPayProvider] = useState<EasyPayProvider>(null);
  const [isInternationalCard, setIsInternationalCard] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');

  return {
    // State
    isProcessing,
    agreedToTerms,
    agreedToPrivacy,
    selectedPaymentMethod,
    easyPayProvider,
    isInternationalCard,
    phoneInput,
    // Actions
    setIsProcessing,
    setAgreedToTerms,
    setAgreedToPrivacy,
    setSelectedPaymentMethod,
    setEasyPayProvider,
    setIsInternationalCard,
    setPhoneInput,
  };
}
