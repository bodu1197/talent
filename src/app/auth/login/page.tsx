"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import { getSecureRedirectUrl, RATE_LIMIT_CONFIG } from "@/lib/auth/config";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate Limiting 체크
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingSeconds = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setError(
        `너무 많은 로그인 시도가 있었습니다. ${remainingSeconds}초 후 다시 시도해주세요.`,
      );
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // 로그인 성공 - 시도 횟수 초기화
      setLoginAttempts(0);
      setLockoutUntil(null);

      // 쿠키 설정을 위해 잠시 대기 후 새로고침
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 서버 컴포넌트 새로고침하여 쿠키 동기화
      router.refresh();

      // 메인 페이지로 이동
      router.push("/");
    } catch (error: unknown) {
      logger.error("로그인 실패:", error);

      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      // Rate Limiting 적용
      if (newAttempts >= RATE_LIMIT_CONFIG.LOGIN.MAX_ATTEMPTS) {
        setLockoutUntil(Date.now() + RATE_LIMIT_CONFIG.LOGIN.LOCKOUT_DURATION);
        setError(
          `너무 많은 로그인 시도가 있었습니다. 5분 후 다시 시도해주세요.`,
        );
      } else {
        const message =
          error instanceof Error
            ? error.message
            : "로그인 중 오류가 발생했습니다.";
        setError(message);
      }

      setIsLoading(false);
    }
  };

  // SNS 로그인 핸들러
  const handleSocialLogin = async (provider: "kakao" | "google" | "apple") => {
    try {
      setIsLoading(true);
      setError(null);

      // OAuth 리다이렉트 URL 검증 (CRITICAL 보안)
      const redirectUrl = getSecureRedirectUrl(
        globalThis.location.origin,
        "/auth/callback",
      );

      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      logger.error("SNS 로그인 실패:", error);
      const message =
        error instanceof Error
          ? error.message
          : "SNS 로그인 중 오류가 발생했습니다.";
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E1E3E7]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold mb-2">
              <span className="gradient-text">AI Talent Hub</span>
            </h1>
            <p className="text-gray-600">AI 재능 거래의 시작</p>
          </div>

          {/* SNS 간편 로그인 */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={() => handleSocialLogin("kakao")}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-[#FEE500] hover:bg-[#F5DC00] text-[#000000] font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.48 3 2 6.58 2 11c0 2.78 1.83 5.23 4.58 6.76-.2.74-.77 2.84-.89 3.29-.14.52.19.51.4.37.16-.11 2.56-1.76 2.97-2.04.62.08 1.27.12 1.94.12 5.52 0 10-3.58 10-8S17.52 3 12 3z" />
              </svg>
              카카오로 로그인
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin("google")}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg border border-gray-300 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              구글로 로그인
            </button>

            {/* <button
              type="button"
              onClick={() => handleSocialLogin("apple")}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-black hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Apple로 로그인
            </button> */}
          </div>

          {/* 구분선 */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                또는 이메일로 로그인
              </span>
            </div>
          </div>

          {/* 로그인 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
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
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input bg-gray-50 border border-gray-300 focus:bg-white"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input bg-gray-50 border border-gray-300 focus:bg-white"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-sm text-gray-600">로그인 상태 유지</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                비밀번호 찾기
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-ai py-3 text-center font-semibold disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="spinner mr-2" />
                  {' '}로그인 중...
                </span>
              ) : (
                "로그인"
              )}
            </button>
          </form>

          {/* 회원가입 링크 */}
          <div className="mt-6 text-center">
            <span className="text-gray-600">아직 계정이 없으신가요?</span>
            <Link
              href="/auth/register"
              className="ml-2 text-primary-600 hover:text-primary-700 font-semibold"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
