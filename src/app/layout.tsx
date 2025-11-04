import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import "@fontsource/noto-sans-kr/300.css";
import "@fontsource/noto-sans-kr/400.css";
import "@fontsource/noto-sans-kr/500.css";
import "@fontsource/noto-sans-kr/600.css";
import "@fontsource/noto-sans-kr/700.css";
import "@fontsource/noto-sans-kr/800.css";
import "@fontsource/noto-sans-kr/900.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ErrorBoundary } from "@/components/providers/ErrorBoundary";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import ConditionalMegaMenuWrapper from "@/components/layout/ConditionalMegaMenuWrapper";

export const metadata: Metadata = {
  title: "AI Talent Hub - 국내 최대 AI 재능 거래 플랫폼",
  description: "AI 기술을 활용한 디자인, 영상, 콘텐츠 제작 등 다양한 AI 재능을 거래하는 전문 마켓플레이스",
  keywords: "AI, 인공지능, 재능거래, Midjourney, ChatGPT, Stable Diffusion, AI디자인, AI영상",
  openGraph: {
    title: "AI Talent Hub",
    description: "국내 최대 AI 재능 거래 플랫폼",
    type: "website",
    locale: "ko_KR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="min-h-screen bg-gray-50 overflow-x-hidden">
        <ErrorBoundary>
          <AuthProvider>
            <ConditionalLayout megaMenu={<ConditionalMegaMenuWrapper />}>
              {children}
            </ConditionalLayout>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}