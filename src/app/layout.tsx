import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import DevModeBanner from '@/components/common/DevModeBanner';
import { ToastProvider } from '@/components/ui/Toast';

/** Inter 폰트 로드 — 라틴 + 한국어 지원 */
const inter = Inter({ subsets: ['latin'] });

/** 페이지 메타데이터 */
export const metadata: Metadata = {
  title: 'BINAH | 반디가 찾은 오늘의 기회',
  description: '반디가 찾은 오늘의 기회, 당신의 내일이 빛나도록',
  keywords: ['투자', '불로소득', '배당', 'AI', 'BINAH', '비나', '반디'],
};

/** 루트 레이아웃 — 전체 앱 래퍼 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 다크모드 플래시 방지 — 하이드레이션 전 localStorage 읽어 class 설정 */}
        <script dangerouslySetInnerHTML={{ __html: `
(function(){try{var s=localStorage.getItem('fanen-theme');var p=window.matchMedia('(prefers-color-scheme:dark)').matches;if(s==='dark'||(s===null&&p)){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();
        `}} />
      </head>
      <body className={`${inter.className} antialiased pb-16 md:pb-0 bg-background text-foreground`}>
        <ToastProvider>
          <DevModeBanner />
          <Header />
          <main>{children}</main>
          <BottomNav />
        </ToastProvider>
      </body>
    </html>
  );
}
