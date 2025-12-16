/**
 * 서비스 관련 헬퍼 함수들
 */

import type { Service } from '@/types/common';

/**
 * 배열 랜덤 셔플 (Fisher-Yates) - crypto 기반 보안 강화
 */
export function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const j = Math.floor((arr[0] / 0xffffffff) * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * 리뷰 통계 맵 생성
 */
interface ReviewStat {
  service_id: string;
  rating: number;
}

export function buildRatingMap(
  reviewStats: ReviewStat[] | null
): Map<string, { sum: number; count: number }> {
  const ratingMap = new Map<string, { sum: number; count: number }>();
  if (!reviewStats) return ratingMap;

  for (const review of reviewStats) {
    const current = ratingMap.get(review.service_id) || { sum: 0, count: 0 };
    ratingMap.set(review.service_id, {
      sum: current.sum + review.rating,
      count: current.count + 1,
    });
  }
  return ratingMap;
}

/**
 * 서비스 최종 포맷 변환 (rating 추가)
 */
export function formatServicesWithRating(
  services: Array<{ id: string; orders_count?: number; [key: string]: unknown }>,
  ratingMap: Map<string, { sum: number; count: number }>
): Service[] {
  return services.map((service) => {
    const stats = ratingMap.get(service.id);
    const rating = stats && stats.count > 0 ? stats.sum / stats.count : 0;
    return {
      ...service,
      rating,
      review_count: stats?.count || 0,
    } as unknown as Service;
  });
}

/**
 * 광고 서비스와 일반 서비스를 섞어서 반환 (광고 우선)
 */
export function formatServicesWithAdvertising(
  services: Array<{ id: string; [key: string]: unknown }>,
  ratingMap: Map<string, { sum: number; count: number }>,
  advertisedServiceIds: Set<string>,
  limit = 15
): Service[] {
  // 광고 서비스와 일반 서비스 분리
  const advertisedServices = services.filter((s) => advertisedServiceIds.has(s.id));
  const regularServices = services.filter((s) => !advertisedServiceIds.has(s.id));

  shuffleArray(advertisedServices);
  shuffleArray(regularServices);

  // 광고 서비스 우선 + 일반 서비스
  const combinedServices = [...advertisedServices, ...regularServices].slice(0, limit);

  return combinedServices.map((service) => {
    const stats = ratingMap.get(service.id);
    return {
      ...service,
      rating: stats && stats.count > 0 ? stats.sum / stats.count : 0,
      review_count: stats?.count || 0,
    } as unknown as Service;
  });
}
