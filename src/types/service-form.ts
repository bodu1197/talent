/**
 * 서비스 등록/수정 폼 공통 타입
 */

import { PackageType, PackageFormData } from './package';

// 위치 정보 인터페이스
export interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
  region: string;
}

// 서비스 타입 (카테고리별)
export type ServiceType = 'online' | 'offline' | 'both';

// 서비스 제공 방식 (서비스별 - both 카테고리용)
export type DeliveryMethod = 'online' | 'offline' | 'both';

// 서비스 폼 데이터 인터페이스
export interface ServiceFormData {
  // Step 1: 기본정보
  title: string;
  category_ids: string[];

  // Step 1: 위치 정보 (오프라인/both 카테고리용)
  service_type?: ServiceType; // 선택된 카테고리의 서비스 타입
  delivery_method?: DeliveryMethod; // 서비스 제공 방식 (both 카테고리일 때 선택)
  location?: LocationData | null; // 위치 정보 (오프라인/both일 때)

  // Step 2: 가격설정
  price: string;
  delivery_days: string;
  revision_count: string;

  // Step 2: 패키지 설정
  use_packages: boolean;
  packages: Record<PackageType, PackageFormData>;

  // Step 3: 서비스 설명
  description: string;

  // Step 4: 이미지
  thumbnail_url: string;
  thumbnail_file: File | null;

  // Step 5: 요청사항
  requirements: { question: string; required: boolean }[];

  // 포트폴리오 (선택사항)
  create_portfolio: boolean;
  portfolio_data: {
    title: string;
    description: string;
    youtube_url: string;
    project_url: string;
    tags: string[];
    images: File[];
  };

  // 추가 기능 (선택사항)
  features?: {
    commercial_use?: boolean;
    source_files?: boolean;
    express_delivery?: boolean;
  };
}

// 서비스 폼 Props 인터페이스
export interface ServiceFormProps {
  readonly formData: ServiceFormData;
  readonly setFormData: (data: ServiceFormData) => void;
}
