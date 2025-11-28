/**
 * 서비스 패키지 시스템 타입 정의
 * STANDARD, DELUXE, PREMIUM 3가지 패키지 지원
 */

// 패키지 타입
export type PackageType = 'standard' | 'deluxe' | 'premium';

// 패키지 타입 라벨
export const PACKAGE_TYPE_LABELS: Record<PackageType, string> = {
  standard: 'STANDARD',
  deluxe: 'DELUXE',
  premium: 'PREMIUM',
};

// 패키지 타입 설명
export const PACKAGE_TYPE_DESCRIPTIONS: Record<PackageType, string> = {
  standard: '기본 서비스',
  deluxe: '추가 기능 포함',
  premium: '프리미엄 서비스',
};

// 패키지 타입 순서
export const PACKAGE_TYPE_ORDER: PackageType[] = ['standard', 'deluxe', 'premium'];

// 서비스 패키지 (DB 테이블 타입)
export interface ServicePackage {
  id: string;
  service_id: string;
  name: string;
  package_type: PackageType;
  price: number;
  delivery_days: number;
  revision_count: number;
  features: string[];
  description: string | null;
  is_active: boolean;
  display_order: number;
  is_express_available: boolean;
  express_days: number | null;
  express_price: number | null;
  created_at: string;
  updated_at: string;
}

// 패키지 폼 데이터 (서비스 등록/수정용)
export interface PackageFormData {
  price: string;
  delivery_days: string;
  revision_count: string;
  features: string[];
  description: string;
  is_enabled: boolean;
}

// 패키지 폼 초기값
export const DEFAULT_PACKAGE_FORM_DATA: PackageFormData = {
  price: '',
  delivery_days: '3',
  revision_count: '1',
  features: [],
  description: '',
  is_enabled: false,
};

// 기본 패키지 템플릿
export const DEFAULT_PACKAGE_TEMPLATES: Record<PackageType, Partial<PackageFormData>> = {
  standard: {
    description: '기본 서비스를 제공합니다.',
    features: ['기본 작업물 제공'],
    revision_count: '1',
  },
  deluxe: {
    description: '소스 파일과 추가 수정을 포함합니다.',
    features: ['기본 작업물 제공', '소스 파일 제공', '추가 수정 포함'],
    revision_count: '3',
  },
  premium: {
    description: '상업적 사용권과 우선 작업을 포함합니다.',
    features: ['기본 작업물 제공', '소스 파일 제공', '무제한 수정', '상업적 사용권', '우선 작업'],
    revision_count: '-1',
  },
};

// 패키지 입력 검증
export interface PackageValidation {
  isValid: boolean;
  errors: {
    standard?: string[];
    deluxe?: string[];
    premium?: string[];
  };
}

// 패키지 가격 검증 (최소 5,000원)
export const MIN_PACKAGE_PRICE = 5000;

// 패키지 검증 함수
export function validatePackage(data: PackageFormData, type: PackageType): string[] {
  const errors: string[] = [];

  if (!data.is_enabled) {
    return errors; // 비활성화된 패키지는 검증 스킵
  }

  const price = parseInt(data.price.replace(/,/g, ''), 10);
  if (isNaN(price) || price < MIN_PACKAGE_PRICE) {
    errors.push(
      `${PACKAGE_TYPE_LABELS[type]} 가격은 최소 ${MIN_PACKAGE_PRICE.toLocaleString()}원 이상이어야 합니다.`
    );
  }

  const deliveryDays = parseInt(data.delivery_days, 10);
  if (isNaN(deliveryDays) || deliveryDays < 1 || deliveryDays > 365) {
    errors.push(`${PACKAGE_TYPE_LABELS[type]} 작업 기간은 1~365일 사이여야 합니다.`);
  }

  if (!data.description.trim()) {
    errors.push(`${PACKAGE_TYPE_LABELS[type]} 설명을 입력해주세요.`);
  }

  if (data.features.length === 0) {
    errors.push(`${PACKAGE_TYPE_LABELS[type]} 포함 기능을 1개 이상 추가해주세요.`);
  }

  return errors;
}

// 패키지 전체 검증
export function validateAllPackages(
  packages: Record<PackageType, PackageFormData>
): PackageValidation {
  const errors: PackageValidation['errors'] = {};
  let hasEnabledPackage = false;

  for (const type of PACKAGE_TYPE_ORDER) {
    const packageData = packages[type];
    if (packageData.is_enabled) {
      hasEnabledPackage = true;
      const packageErrors = validatePackage(packageData, type);
      if (packageErrors.length > 0) {
        errors[type] = packageErrors;
      }
    }
  }

  // 최소 1개 패키지는 활성화되어야 함
  if (!hasEnabledPackage) {
    errors.standard = ['최소 1개의 패키지를 활성화해주세요.'];
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// 패키지를 DB 저장용으로 변환
export function packageFormToDbData(
  serviceId: string,
  type: PackageType,
  data: PackageFormData,
  displayOrder: number
): Omit<ServicePackage, 'id' | 'created_at' | 'updated_at'> {
  return {
    service_id: serviceId,
    name: PACKAGE_TYPE_LABELS[type],
    package_type: type,
    price: parseInt(data.price.replace(/,/g, ''), 10),
    delivery_days: parseInt(data.delivery_days, 10),
    revision_count: parseInt(data.revision_count, 10),
    features: data.features,
    description: data.description || null,
    is_active: data.is_enabled,
    display_order: displayOrder,
    is_express_available: false,
    express_days: null,
    express_price: null,
  };
}

// 서비스와 패키지 정보를 함께 가져오는 타입
export interface ServiceWithPackages {
  id: string;
  title: string;
  description: string;
  price: number;
  delivery_days: number;
  revision_count: number;
  has_packages: boolean;
  packages: ServicePackage[];
  // ... 기타 서비스 필드
}

// 패키지 선택 상태
export interface PackageSelection {
  selectedPackage: PackageType | null;
  package: ServicePackage | null;
}
