/* eslint-disable sonarjs/no-hardcoded-passwords -- Test file uses hardcoded passwords to validate password rules */
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePasswordValidation } from '@/hooks/usePasswordValidation';

describe('usePasswordValidation', () => {
  describe('minLength validation', () => {
    it('should fail when password is less than 8 characters', () => {
      const { result } = renderHook(() => usePasswordValidation('1234567'));

      expect(result.current.passwordValidation.minLength).toBe(false);
    });

    it('should pass when password is exactly 8 characters', () => {
      const { result } = renderHook(() => usePasswordValidation('12345678'));

      expect(result.current.passwordValidation.minLength).toBe(true);
    });

    it('should pass when password is more than 8 characters', () => {
      const { result } = renderHook(() => usePasswordValidation('123456789'));

      expect(result.current.passwordValidation.minLength).toBe(true);
    });
  });

  describe('hasLetter validation', () => {
    it('should fail when password has no letters', () => {
      const { result } = renderHook(() => usePasswordValidation('12345678!@'));

      expect(result.current.passwordValidation.hasLetter).toBe(false);
    });

    it('should pass when password has lowercase letters', () => {
      const { result } = renderHook(() => usePasswordValidation('abc12345'));

      expect(result.current.passwordValidation.hasLetter).toBe(true);
    });

    it('should pass when password has uppercase letters', () => {
      const { result } = renderHook(() => usePasswordValidation('ABC12345'));

      expect(result.current.passwordValidation.hasLetter).toBe(true);
    });

    it('should pass when password has mixed case letters', () => {
      const { result } = renderHook(() => usePasswordValidation('AbC12345'));

      expect(result.current.passwordValidation.hasLetter).toBe(true);
    });
  });

  describe('hasNumber validation', () => {
    it('should fail when password has no numbers', () => {
      const { result } = renderHook(() => usePasswordValidation('abcdefgh!@'));

      expect(result.current.passwordValidation.hasNumber).toBe(false);
    });

    it('should pass when password has numbers', () => {
      const { result } = renderHook(() => usePasswordValidation('abcd1234'));

      expect(result.current.passwordValidation.hasNumber).toBe(true);
    });
  });

  describe('hasSpecial validation', () => {
    it('should fail when password has no special characters', () => {
      const { result } = renderHook(() => usePasswordValidation('Abcd1234'));

      expect(result.current.passwordValidation.hasSpecial).toBe(false);
    });

    it('should pass with ! character', () => {
      const { result } = renderHook(() => usePasswordValidation('Abcd1234!'));

      expect(result.current.passwordValidation.hasSpecial).toBe(true);
    });

    it('should pass with @ character', () => {
      const { result } = renderHook(() => usePasswordValidation('Abcd1234@'));

      expect(result.current.passwordValidation.hasSpecial).toBe(true);
    });

    it('should pass with # character', () => {
      const { result } = renderHook(() => usePasswordValidation('Abcd1234#'));

      expect(result.current.passwordValidation.hasSpecial).toBe(true);
    });

    it('should pass with various special characters', () => {
      const specialChars = [
        '!',
        '@',
        '#',
        '$',
        '%',
        '^',
        '&',
        '*',
        '(',
        ')',
        ',',
        '.',
        '?',
        '"',
        ':',
        '{',
        '}',
        '|',
        '<',
        '>',
      ];

      for (const char of specialChars) {
        const { result } = renderHook(() => usePasswordValidation(`Abcd1234${char}`));
        expect(result.current.passwordValidation.hasSpecial).toBe(true);
      }
    });
  });

  describe('isPasswordValid', () => {
    it('should be false when empty password', () => {
      const { result } = renderHook(() => usePasswordValidation(''));

      expect(result.current.isPasswordValid).toBe(false);
    });

    it('should be false when only meeting some criteria', () => {
      const { result } = renderHook(() => usePasswordValidation('Abcd1234'));

      expect(result.current.isPasswordValid).toBe(false); // missing special char
    });

    it('should be true when all criteria are met', () => {
      const { result } = renderHook(() => usePasswordValidation('Abcd1234!'));

      expect(result.current.isPasswordValid).toBe(true);
    });

    it('should be true for complex valid password', () => {
      const { result } = renderHook(() => usePasswordValidation('MyP@ssw0rd!123'));

      expect(result.current.isPasswordValid).toBe(true);
    });
  });

  describe('reactivity', () => {
    it('should update when password changes', () => {
      const { result, rerender } = renderHook(({ password }) => usePasswordValidation(password), {
        initialProps: { password: 'short' },
      });

      expect(result.current.isPasswordValid).toBe(false);

      rerender({ password: 'ValidP@ss1' });

      expect(result.current.isPasswordValid).toBe(true);
    });
  });
});
