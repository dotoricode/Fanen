/**
 * 공통 헤더 컴포넌트 (서버 컴포넌트)
 * 세션을 서버에서 읽어 로그인 상태에 따라 분기 렌더링
 * - 비로그인: [로그인] [회원가입] 버튼
 * - 로그인: [알림] [UserMenu 드롭다운]
 * BINAH: 완전 무료화 — PlanBadge 제거
 */
import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { UserMenu } from './UserMenu';
import DarkModeToggle from './DarkModeToggle';
import { BinahLogo } from './BinahLogo';
import Link from 'next/link';

/** 내비게이션 메뉴 항목 */
const NAV_ITEMS = [
  { href: '/binah-map', label: '비나 맵' },
  { href: '/news', label: '뉴스 분석' },
  { href: '/sector', label: '섹터 맵' },
  { href: '/value-chain', label: 'Value Chain' },
  { href: '/portfolio', label: '포트폴리오' },
  { href: '/dividend', label: '배당 허브' },
  { href: '/mock-trading', label: '모의투자' },
  { href: '/coach', label: '반디 코치' },
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
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* 로고 */}
        <BinahLogo />

        {/* 데스크톱 내비게이션 */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 사용자 영역 */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* 다크모드 토글 */}
              <DarkModeToggle />

              {/* 알림 아이콘 + 미읽음 뱃지 */}
              <Link
                href="/notifications"
                className="relative rounded-lg p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="알림"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* 미읽음 알림 뱃지 */}
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  3
                </span>
              </Link>

              {/* 유저 메뉴 드롭다운 */}
              <UserMenu email={user.email ?? ''} />
            </>
          ) : (
            <div className="flex items-center gap-2">
              {/* 비로그인 상태에서도 다크모드 토글 */}
              <DarkModeToggle />
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
              >
                회원가입
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
