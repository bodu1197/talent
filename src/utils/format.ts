/**
 * 공통 포맷 유틸리티 함수
 */

// 한국 표준시 타임존
const KST_TIMEZONE = 'Asia/Seoul';
const KST_LOCALE = 'ko-KR';

/**
 * 숫자를 통화 형식으로 포맷
 * @example formatCurrency(10000) => "10,000원"
 */
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString()}원`;
}

/**
 * 숫자를 천 단위 구분 형식으로 포맷
 * @example formatNumber(1000000) => "1,000,000"
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷 (한국 표준시 기준)
 * @example formatDate(new Date()) => "2025-11-12"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d
    .toLocaleDateString(KST_LOCALE, {
      timeZone: KST_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\. /g, '-')
    .replace('.', '');
}

/**
 * 날짜를 YYYY년 MM월 DD일 형식으로 포맷 (한국 표준시 기준)
 * @example formatDateKorean(new Date()) => "2025년 11월 12일"
 */
export function formatDateKorean(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(KST_LOCALE, {
    timeZone: KST_TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * 날짜와 시간을 YYYY-MM-DD HH:mm 형식으로 포맷 (한국 표준시 기준)
 * @example formatDateTime(new Date()) => "2025-11-12 14:30"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d
    .toLocaleString(KST_LOCALE, {
      timeZone: KST_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    .replace(/\. /g, '-')
    .replace('.', ' ');
}

/**
 * 날짜와 시간을 YYYY년 MM월 DD일 HH:mm 형식으로 포맷 (한국 표준시 기준)
 * @example formatDateTimeKorean(new Date()) => "2025년 11월 12일 14:30"
 */
export function formatDateTimeKorean(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString(KST_LOCALE, {
    timeZone: KST_TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * 시간만 HH:mm 형식으로 포맷 (한국 표준시 기준)
 * @example formatTime(new Date()) => "14:30"
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString(KST_LOCALE, {
    timeZone: KST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * 시간을 오전/오후 형식으로 포맷 (한국 표준시 기준)
 * @example formatTimeKorean(new Date()) => "오후 2:30"
 */
export function formatTimeKorean(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString(KST_LOCALE, {
    timeZone: KST_TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * 날짜를 상대적 시간으로 포맷 (예: "3분 전", "2시간 전")
 * @example formatRelativeTime(new Date(Date.now() - 3600000)) => "1시간 전"
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = typeof date === 'string' ? new Date(date) : date;
  const diff = now.getTime() - target.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  if (days < 30) return `${Math.floor(days / 7)}주 전`;
  if (days < 365) return `${Math.floor(days / 30)}개월 전`;
  return `${Math.floor(days / 365)}년 전`;
}

/**
 * 현재 한국 표준시 Date 객체 반환
 * @example getKSTDate() => Date (KST 기준)
 */
export function getKSTDate(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: KST_TIMEZONE }));
}

/**
 * 특정 날짜를 한국 표준시 기준으로 변환된 Date 객체 반환
 * @example toKSTDate(new Date()) => Date (KST 기준)
 */
export function toKSTDate(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date(d.toLocaleString('en-US', { timeZone: KST_TIMEZONE }));
}

/**
 * 파일 크기를 읽기 쉬운 형식으로 포맷
 * @example formatFileSize(1024) => "1 KB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * 전화번호를 포맷 (010-1234-5678)
 * @example formatPhoneNumber("01012345678") => "010-1234-5678"
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replaceAll(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * 퍼센트를 포맷
 * @example formatPercent(0.1234) => "12.34%"
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}
