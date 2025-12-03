/**
 * 오프라인/대면 서비스 카테고리 (위치 기반 기능 활성화)
 * "내 주변의 프리미엄 전문가" 섹션에 표시되는 1차 카테고리 slugs
 *
 * 이 카테고리들과 그 하위 카테고리에서만:
 * - LocationSortToggle (내 주변 검색) 버튼 표시
 * - 서비스 등록 시 위치 입력 UI 표시
 * - 거리순 정렬 기능 활성화
 */
export const OFFLINE_CATEGORY_SLUGS = [
  'errands', // 심부름
  'life-service', // 생활 서비스
  'event', // 이벤트
  'beauty-fashion', // 뷰티/패션
  'custom-order', // 주문제작
  'counseling-coaching', // 상담/코칭
  'hobby-handmade', // 취미/핸드메이드
] as const;

export type OfflineCategorySlug = (typeof OFFLINE_CATEGORY_SLUGS)[number];

/**
 * 주어진 카테고리 slug가 오프라인 카테고리인지 확인
 */
export function isOfflineCategory(slug: string): boolean {
  return OFFLINE_CATEGORY_SLUGS.includes(slug as OfflineCategorySlug);
}
