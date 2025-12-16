/**
 * PortOne 결제 공통 유틸리티
 */

import * as PortOne from '@portone/browser-sdk/v2';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';
import type { PaymentMethod, EasyPayProvider } from '@/hooks/usePaymentState';

export interface PortOneConfig {
  merchantUid: string;
  orderName: string;
  amount: number;
  buyerName: string | null;
  buyerEmail: string | null;
  buyerPhone: string | null;
  paymentMethod: PaymentMethod;
  easyPayProvider: EasyPayProvider;
  isInternationalCard?: boolean;
}

export interface PortOneResult {
  success: boolean;
  paymentId?: string;
  error?: string;
}

/**
 * PortOne 결제 요청 실행
 * @param config 결제 설정
 * @returns 결제 결과
 */
export async function requestPortOnePayment(config: PortOneConfig): Promise<PortOneResult> {
  const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
  const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;

  if (!storeId || !channelKey) {
    return {
      success: false,
      error: '결제 설정이 올바르지 않습니다',
    };
  }

  try {
    const paymentConfig: Parameters<typeof PortOne.requestPayment>[0] = {
      storeId,
      paymentId: config.merchantUid,
      orderName: config.orderName,
      totalAmount: config.amount,
      currency: 'CURRENCY_KRW',
      channelKey,
      payMethod: config.paymentMethod,
      customer: {
        fullName: config.buyerName || undefined,
        email: config.buyerEmail || undefined,
        phoneNumber: config.buyerPhone || undefined,
      },
    };

    // 결제 수단별 추가 설정
    switch (config.paymentMethod) {
      case 'CARD':
        if (config.isInternationalCard) {
          // 국제카드는 별도 설정 필요 시 추가
        }
        break;
      case 'TRANSFER':
        paymentConfig.payMethod = 'TRANSFER';
        break;
      case 'VIRTUAL_ACCOUNT':
        paymentConfig.payMethod = 'VIRTUAL_ACCOUNT';
        break;
      case 'MOBILE':
        paymentConfig.payMethod = 'MOBILE';
        break;
      case 'EASY_PAY':
        paymentConfig.payMethod = 'EASY_PAY';
        if (config.easyPayProvider) {
          paymentConfig.easyPay = {
            easyPayProvider: config.easyPayProvider,
          };
        }
        break;
    }

    const response = await PortOne.requestPayment(paymentConfig);

    if (response?.code !== undefined) {
      // 결제 실패
      logger.error('PortOne payment error:', {
        code: response.code,
        message: response.message,
        merchantUid: config.merchantUid,
      });

      return {
        success: false,
        error: response.message || '결제에 실패했습니다',
      };
    }

    // 결제 성공
    logger.info('PortOne payment success:', {
      paymentId: response?.paymentId,
      merchantUid: config.merchantUid,
    });

    return {
      success: true,
      paymentId: response?.paymentId,
    };
  } catch (error) {
    logger.error('PortOne payment exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다',
    };
  }
}

/**
 * 결제 전 유효성 검사
 * @param agreedToTerms 이용약관 동의 여부
 * @param agreedToPrivacy 개인정보처리방침 동의 여부
 * @param phone 구매자 휴대폰 번호
 * @returns 유효성 검사 통과 여부
 */
export function validatePaymentPreconditions(
  agreedToTerms: boolean,
  agreedToPrivacy: boolean,
  phone: string | null
): boolean {
  if (!agreedToTerms || !agreedToPrivacy) {
    toast.error('필수 약관에 동의해주세요');
    return false;
  }

  if (!phone) {
    toast.error('결제를 위해 휴대폰 번호가 필요합니다');
    return false;
  }

  return true;
}
