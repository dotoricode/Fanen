/**
 * 공통 헤더 컴포넌트 (서버 컴포넌트)
 * 세션을 서버에서 읽어 로그인 상태 렌더링
 */
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { UserMenu } from './UserMenu';

/** 내비게이션 메뉴 항목 */
const NAV_ITEMS = [
  { href: '/news', label: '뉴스 분석' },
  { href: '/sector', label: '섹터 맵' },
  { href: '/portfolio', label: '포트폴리오' },
  { href: '/dividend', label: '배당 캘린더' },
  { href: '/mock-trading', label: '모의투자' },
  { href: '/coach', label: 'AI 코치' },
] as const;

export async function Header() {
  // 항상 동적 렌더링 — 쿠키(세션) 기반이므로 정적 생성 불가
  noStore();

  // 서버에서 세션 조회 — 쿠키 기반
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // 환경변수 미설정 등 — 비로그인 상태로 렌더링
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* 로고 */}
        <Link href="/" className="text-xl font-bold text-blue-600 hover:text-blue-700">
          파낸
        </Link>

        {/* 데스크톱 내비게이션 */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 사용자 영역 */}
        <div className="flex items-center gap-3">
          {user ? (
            <UserMenu email={user.email ?? ''} />
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
