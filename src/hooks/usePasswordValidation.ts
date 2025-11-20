import { useMemo } from 'react';

export interface PasswordValidation {
  minLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export interface UsePasswordValidationReturn {
  passwordValidation: PasswordValidation;
  isPasswordValid: boolean;
}

/**
 * 비밀번호 검증 훅
 * @param password - 검증할 비밀번호
 * @returns 비밀번호 검증 결과 및 전체 유효성
 */
export function usePasswordValidation(password: string): UsePasswordValidationReturn {
  const passwordValidation = useMemo<PasswordValidation>(() => ({
    minLength: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }), [password]);

  const isPasswordValid = useMemo(() => 
    passwordValidation.minLength &&
    passwordValidation.hasLetter &&
    passwordValidation.hasNumber &&
    passwordValidation.hasSpecial,
    [passwordValidation]
  );

  return {
    passwordValidation,
    isPasswordValid,
  };
}
