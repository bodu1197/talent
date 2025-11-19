/**
 * 공통 검증 유틸리티 함수
 */

/**
 * 이메일 유효성 검사
 * @example isValidEmail("test@example.com") => true
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 전화번호 유효성 검사 (한국)
 * @example isValidPhone("010-1234-5678") => true
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^01\d-?\d{3,4}-?\d{4}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * URL 유효성 검사
 * @example isValidURL("https://example.com") => true
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 비밀번호 강도 검사 (최소 8자, 대소문자, 숫자 포함)
 * @example isStrongPassword("Password123") => true
 */
export function isStrongPassword(password: string): boolean {
  const hasMinLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)

  return hasMinLength && hasUpperCase && hasLowerCase && hasNumber
}

/**
 * 빈 문자열 또는 공백만 있는지 검사
 * @example isEmpty("  ") => true
 */
export function isEmpty(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0
}

/**
 * 숫자인지 검사
 * @example isNumeric("123") => true
 */
export function isNumeric(value: string): boolean {
  return !isNaN(parseFloat(value)) && isFinite(Number(value))
}

/**
 * 한글만 포함하는지 검사
 * @example isKorean("안녕하세요") => true
 */
export function isKorean(value: string): boolean {
  const koreanRegex = /^[가-힣\s]+$/
  return koreanRegex.test(value)
}

/**
 * 파일 확장자 검사
 * @example hasValidExtension("image.jpg", ["jpg", "png"]) => true
 */
export function hasValidExtension(filename: string, allowedExtensions: string[]): boolean {
  const extension = filename.split('.').pop()?.toLowerCase()
  return extension ? allowedExtensions.includes(extension) : false
}

/**
 * 파일 크기 검사 (bytes)
 * @example isValidFileSize(1024 * 1024, 5 * 1024 * 1024) => true (1MB < 5MB)
 */
export function isValidFileSize(fileSize: number, maxSize: number): boolean {
  return fileSize <= maxSize
}
