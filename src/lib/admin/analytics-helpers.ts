/**
 * 공통 Analytics 헬퍼 함수
 */

export type Period = 'hour' | 'day' | 'month' | 'year';

export interface DateRangeResult {
  startDate: Date;
  groupBy?: string;
}

/**
 * 기간에 따른 시작 날짜 계산
 */
export function getDateRange(period: Period): DateRangeResult {
  const now = new Date();

  switch (period) {
    case 'hour':
      // Last 7 days for hourly view
      return {
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        groupBy: 'hour',
      };
    case 'day':
      // Last 30 days for daily view
      return {
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        groupBy: 'day',
      };
    case 'month': {
      // Last 12 months for monthly view
      const monthlyStart = new Date(now);
      monthlyStart.setMonth(monthlyStart.getMonth() - 12);
      return {
        startDate: monthlyStart,
        groupBy: 'month',
      };
    }
    case 'year': {
      // Last 5 years for yearly view
      const yearlyStart = new Date(now);
      yearlyStart.setFullYear(yearlyStart.getFullYear() - 5);
      return {
        startDate: yearlyStart,
        groupBy: 'year',
      };
    }
  }
}

/**
 * 기간별 시작 날짜만 가져오기 (하위 호환성)
 */
export function getStartDate(period: Period): Date {
  return getDateRange(period).startDate;
}

/**
 * 한국 표준시(KST) 변환
 */
export function toKST(date: Date): Date {
  // UTC 시간에 9시간 추가
  return new Date(date.getTime() + 9 * 60 * 60 * 1000);
}

/**
 * KST 기준으로 날짜 문자열 생성
 */
export function formatKSTDate(date: Date): string {
  const kst = toKST(date);
  return kst.toISOString().split('T')[0];
}

/**
 * KST 기준으로 시간 문자열 생성
 */
export function formatKSTHour(date: Date): string {
  const kst = toKST(date);
  return kst.toISOString().substring(0, 13) + ':00:00';
}
