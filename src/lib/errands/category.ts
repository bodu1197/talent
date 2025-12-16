/**
 * 심부름 카테고리 관련 유틸리티 함수
 */

/**
 * 카테고리 코드를 한글 라벨로 변환
 */
export function getCategoryLabel(category: string): string {
  const categoryMap: Record<string, string> = {
    DELIVERY: '배달',
    SHOPPING: '구매대행',
    MOVING: '이사/운반',
    QUEUEING: '줄서기',
    PET_CARE: '반려동물',
    CLEANING: '청소',
    BUG_CATCHING: '벌레 잡기',
    DOCUMENT: '서류',
    OTHER: '기타',
  };
  return categoryMap[category] || category;
}
