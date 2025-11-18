"use client";

import { useEffect } from "react";

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 전역 unhandled promise rejection 핸들러
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;

      // Supabase LockManager 오류는 무시 (정상적인 동작)
      if (
        error?.message?.includes("LockManager") ||
        error?.message?.includes("lock:sb-") ||
        error?.isAcquireTimeout === true
      ) {
        event.preventDefault(); // 기본 에러 표시 방지
        return;
      }
    };

    // 전역 error 핸들러
    const handleError = (event: ErrorEvent) => {
      const error = event.error;

      // Supabase LockManager 오류는 무시
      if (
        error?.message?.includes("LockManager") ||
        error?.message?.includes("lock:sb-") ||
        error?.isAcquireTimeout === true
      ) {
        event.preventDefault(); // 기본 에러 표시 방지
        return;
      }
    };

    globalThis.addEventListener("unhandledrejection", handleUnhandledRejection);
    globalThis.addEventListener("error", handleError);

    return () => {
      globalThis.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
      globalThis.removeEventListener("error", handleError);
    };
  }, []);

  return <>{children}</>;
}
