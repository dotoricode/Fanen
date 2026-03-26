import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';
import SideNav from '@/components/common/SideNav';
import DevModeBanner from '@/components/common/DevModeBanner';
import { ToastProvider } from '@/components/ui/Toast';

/** Inter 폰트 로드 — 라틴 + 한국어 지원 */
const inter = Inter({ subsets: ['latin'] });

/** 페이지 메타데이터 */
export const metadata: Metadata = {
  title: '파낸 | AI 투자 인사이트',
  description: '반디와 함께하는 AI 기반 투자 인사이트 — 파낸(Fanen)',
  keywords: ['투자', '불로소득', '배당', 'AI', '파낸', 'Fanen', '반디'],
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
      <body className={`${inter.className} antialiased bg-background text-foreground`}>
        <ToastProvider>
          <DevModeBanner />

          {/* 모바일 상단 헤더 (md 이상에서는 숨김) */}
          <div className="md:hidden">
            <Header />
          </div>

          {/* 전체 레이아웃: 사이드바 + 메인 */}
          <div className="flex min-h-screen">
            {/* 데스크탑 사이드바 — SideNav 내부에서 hidden md:flex 처리 */}
            <SideNav />

            {/* 메인 콘텐츠: 모바일에서는 pb-16(하단바 높이), 데스크탑에서는 사이드바 너비만큼 margin */}
            <main className="flex-1 md-main-offset pb-16 md:pb-0">
              {children}
            </main>
          </div>

          {/* 모바일 하단 탭바 */}
          <BottomNav />
        </ToastProvider>
      </body>
    </html>
  );
}
