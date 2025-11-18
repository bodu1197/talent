"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import { getSecureRedirectUrl, RATE_LIMIT_CONFIG } from "@/lib/auth/config";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetAttempts, setResetAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate Limiting 체크
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingSeconds = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setError(
        `너무 많은 시도가 있었습니다. ${remainingSeconds}초 후 다시 시도해주세요.`,
      );
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // OAuth 리다이렉트 URL 검증 (CRITICAL 보안)
      const redirectUrl = getSecureRedirectUrl(
        globalThis.location.origin,
        "/auth/reset-password",
      );

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      // 성공 시 시도 횟수 초기화
      setResetAttempts(0);
      setLockoutUntil(null);
      setSuccess(true);
    } catch (error: unknown) {
      logger.error("비밀번호 재설정 요청 실패:", error);

      const newAttempts = resetAttempts + 1;
      setResetAttempts(newAttempts);

      // Rate Limiting 적용
      if (newAttempts >= RATE_LIMIT_CONFIG.FORGOT_PASSWORD.MAX_ATTEMPTS) {
        setLockoutUntil(
          Date.now() + RATE_LIMIT_CONFIG.FORGOT_PASSWORD.LOCKOUT_DURATION,
        );
        setError("너무 많은 시도가 있었습니다. 10분 후 다시 시도해주세요.");
      } else {
        const message =
          error instanceof Error
            ? error.message
            : "비밀번호 재설정 요청 중 오류가 발생했습니다.";
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-brand-primary">비밀번호 찾기</span>
            </h1>
            <p className="text-gray-600">가입하신 이메일 주소를 입력해주세요</p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <FaCheckCircle className="text-green-600 text-4xl mb-3 mx-auto" />
                <p className="text-green-800 font-medium mb-2">
                  이메일 전송 완료
                </p>
                <p className="text-sm text-green-700">
                  입력하신 이메일로 비밀번호 재설정 링크를 보내드렸습니다.
                  이메일을 확인해주세요.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="inline-block w-full py-3 px-4 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors"
              >
                로그인으로 돌아가기
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  이메일
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="email@example.com"
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-brand-primary text-white rounded-lg hover:bg-brand-light transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <FaSpinner className="animate-spin mr-2" />
                    전송 중...
                  </span>
                ) : (
                  "비밀번호 재설정 링크 받기"
                )}
              </button>

              <div className="text-center pt-4">
                <Link
                  href="/auth/login"
                  className="text-sm text-brand-primary hover:underline"
                >
                  로그인으로 돌아가기
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* 하단 링크 */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            계정이 없으신가요?{" "}
            <Link
              href="/auth/register"
              className="text-brand-primary hover:underline font-medium"
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
