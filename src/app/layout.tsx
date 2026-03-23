import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

/** Inter 폰트 로드 — 라틴 + 한국어 지원 */
const inter = Inter({ subsets: ['latin'] });

/** 페이지 메타데이터 */
export const metadata: Metadata = {
  title: '파낸 - AI 투자 인텔리전스',
  description: '세상이 움직이면, 파낸이 먼저 압니다',
};

/** 루트 레이아웃 — 전체 앱 래퍼 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
