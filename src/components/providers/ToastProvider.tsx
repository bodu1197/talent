"use client";

import { Toaster } from "react-hot-toast";

/**
 * Toast Provider Component
 * react-hot-toast를 사용한 전역 토스트 알림 시스템
 */
export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // 기본 스타일
        duration: 4000,
        style: {
          background: "#fff",
          color: "#333",
          borderRadius: "8px",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          padding: "16px",
        },
        // 성공 메시지 스타일
        success: {
          duration: 3000,
          iconTheme: {
            primary: "#10B981",
            secondary: "#fff",
          },
        },
        // 에러 메시지 스타일
        error: {
          duration: 5000,
          iconTheme: {
            primary: "#EF4444",
            secondary: "#fff",
          },
        },
        // 로딩 메시지 스타일
        loading: {
          iconTheme: {
            primary: "#3B82F6",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}
