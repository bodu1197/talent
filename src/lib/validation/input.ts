/**
 * 입력값 검증 및 포맷팅 유틸리티
 */

/**
 * 문자열에서 숫자만 추출
 * @param value 입력 문자열
 * @returns 숫자만 포함된 문자열
 */
export function extractNumbers(value: string): string {
  return value.replaceAll(/\D/g, '');
}

/**
 * 휴대폰 번호 유효성 검사
 * @param phone 휴대폰 번호 (하이픈 포함 가능)
 * @returns 유효 여부
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = extractNumbers(phone);
  return cleaned.length >= 10 && cleaned.length <= 11;
}

/**
 * 사업자등록번호 유효성 검사
 * @param businessNumber 사업자등록번호 (하이픈 포함 가능)
 * @returns 유효 여부
 */
export function isValidBusinessNumber(businessNumber: string): boolean {
  const cleaned = extractNumbers(businessNumber);
  return cleaned.length === 10;
}

/**
 * 이메일 유효성 검사
 * @param email 이메일 주소
 * @returns 유효 여부
 */
export function isValidEmail(email: string): boolean {
  // 간단한 이메일 형식 검사 (ReDoS 방지)
  const atIndex = email.indexOf('@');
  if (atIndex === -1) return false;
  const dotIndex = email.lastIndexOf('.');
  return atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < email.length - 1;
}

/**
 * 은행 계좌번호 포맷팅 (공백/하이픈 제거)
 * @param accountNumber 계좌번호
 * @returns 정제된 계좌번호
 */
export function cleanAccountNumber(accountNumber: string): string {
  return accountNumber.replaceAll(/[\s-]/g, '');
}

/**
 * 이름 유효성 검사 (공백 제거 후 비교)
 * @param name1 첫 번째 이름
 * @param name2 두 번째 이름
 * @returns 이름 일치 여부
 */
export function compareNames(name1: string, name2: string): boolean {
  const cleaned1 = name1.replaceAll(/\s/g, '');
  const cleaned2 = name2.replaceAll(/\s/g, '');
  return cleaned1 === cleaned2;
}
