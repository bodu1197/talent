/**
 * 회원가입 폼 데이터 타입
 */
export interface RegisterFormData {
  email: string;
  password: string;
  passwordConfirm: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketing: boolean;
}

/**
 * 이메일 유효성 검사
 * @param email - 검사할 이메일 주소
 * @returns 유효한 이메일 형식이면 true
 */
export function isValidEmail(email: string): boolean {
  return email.length > 0 && email.includes('@');
}

/**
 * 비밀번호 일치 검사
 * @param password - 비밀번호
 * @param passwordConfirm - 비밀번호 확인
 * @returns 일치하면 true
 */
export function doPasswordsMatch(password: string, passwordConfirm: string): boolean {
  return password === passwordConfirm;
}

/**
 * 회원가입 폼 유효성 검사
 * @param formData - 폼 데이터
 * @param isPasswordValid - 비밀번호 유효성 (usePasswordValidation에서 제공)
 * @param emailCheckStatus - 이메일 중복 체크 상태
 * @param lockoutUntil - 잠금 시간 (Rate limiting)
 * @returns 유효하지 않으면 에러 메시지, 유효하면 null
 */
export function validateRegistration(
  formData: RegisterFormData,
  isPasswordValid: boolean,
  emailCheckStatus: 'idle' | 'checking' | 'available' | 'taken',
  lockoutUntil: number | null
): string | null {
  // Rate limiting check
  if (lockoutUntil && Date.now() < lockoutUntil) {
    const remainingSeconds = Math.ceil((lockoutUntil - Date.now()) / 1000);
    return `너무 많은 시도가 있었습니다. ${remainingSeconds}초 후 다시 시도해주세요.`;
  }

  // Email availability check
  if (emailCheckStatus === 'taken') {
    return '이미 사용 중인 이메일입니다. 다른 이메일을 사용해주세요.';
  }

  if (emailCheckStatus === 'checking') {
    return '이메일 확인 중입니다. 잠시만 기다려주세요.';
  }

  // Password validation
  if (!isPasswordValid) {
    return '비밀번호 조건을 모두 충족해주세요.';
  }

  // Password match check
  if (!doPasswordsMatch(formData.password, formData.passwordConfirm)) {
    return '비밀번호가 일치하지 않습니다.';
  }

  // Terms agreement check
  if (!formData.agreeTerms || !formData.agreePrivacy) {
    return '필수 약관에 동의해주세요.';
  }

  return null;
}

/**
 * Rate limiting 잠금 시간 계산
 * @param attempts - 시도 횟수
 * @param maxAttempts - 최대 허용 시도
 * @param lockoutDuration - 잠금 시간 (밀리초)
 * @returns 잠금 만료 시간 (timestamp) 또는 null
 */
export function calculateLockoutTime(
  attempts: number,
  maxAttempts: number,
  lockoutDuration: number
): number | null {
  if (attempts >= maxAttempts) {
    return Date.now() + lockoutDuration;
  }
  return null;
}
