import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import ConditionalLayout from "@/components/layout/ConditionalLayout";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  );
}