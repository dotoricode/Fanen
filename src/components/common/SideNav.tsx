'use client';

/**
 * SideNav — 데스크탑 좌측 고정 사이드바
 * - md+(768px+): flex-col 고정 사이드바, 너비 220px
 * - 모바일: hidden (BottomNav 사용)
 * - 활성 경로 하이라이트 + teal 포인트 아이콘
 */
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BinahLogo } from './BinahLogo';
import DarkModeToggle from './DarkModeToggle';
import UiModeSwitch from './UiModeSwitch';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

/** 사이드바 메뉴 항목 */
const NAV_ITEMS = [
  { href: '/',              label: '홈',           icon: HomeIcon },
  { href: '/binah-map',     label: '세계 정세',    icon: GlobeIcon },
  { href: '/news',          label: '뉴스 분석',    icon: NewsIcon },
  { href: '/sector',        label: '섹터 분석',    icon: ChartBarIcon },
  { href: '/value-chain',   label: '수혜 기업 연결망', icon: LinkIcon },
  { href: '/portfolio',     label: '내 포트폴리오', icon: BriefcaseIcon },
  { href: '/dividend',      label: '배당 계산기',  icon: CoinIcon },
  { href: '/mock-trading',  label: '모의투자',     icon: TrendingIcon },
  { href: '/coach',         label: '반디 코치',    icon: BotIcon },
] as const;

/** 사이드바 컴포넌트 */
export default function SideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [supabaseClient] = useState(() => createClient());

  /* 클라이언트에서 로그인 상태 조회 */
  useEffect(() => {
    if (!supabaseClient) return;

    supabaseClient.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    /* 인증 상태 변경 구독 */
    const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, [supabaseClient]);

  /* 로그아웃 처리 */
  const handleSignOut = async () => {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-[220px] z-40 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">

      {/* 로고 영역 */}
      <div className="px-4 py-5 border-b border-zinc-100 dark:border-zinc-800">
        <BinahLogo />
      </div>

      {/* 메뉴 내비게이션 */}
      <nav aria-label="사이드 메뉴" className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                }
              `}
            >
              {/* 활성 아이콘만 teal */}
              <span className={isActive ? 'text-teal-600 dark:text-teal-400' : 'text-zinc-400 dark:text-zinc-500'}>
                <Icon />
              </span>
              <span>{item.label}</span>

              {/* 활성 인디케이터 바 */}
              {isActive && (
                <motion.span
                  layoutId="sidenav-active"
                  className="ml-auto w-1 h-4 rounded-full bg-teal-600 dark:bg-teal-400"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* 하단: 다크모드 + 로그인 상태 */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 px-3 py-4 space-y-2">
        {/* 다크모드 토글 */}
        <div className="flex items-center gap-2 px-1">
          <DarkModeToggle />
          <span className="text-xs text-zinc-400 dark:text-zinc-500">테마</span>
        </div>

        {/* UI 모드 스위치 (Standard / Senior) */}
        <div className="flex items-center gap-2 px-1">
          <UiModeSwitch />
        </div>

        {/* 로그인 / 로그아웃 영역 */}
        {user ? (
          <div className="space-y-1">
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              <UserIcon />
              <span className="truncate">{user.email?.split('@')[0] ?? '내 정보'}</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-500 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              <LogoutIcon />
              <span>로그아웃</span>
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            <Link
              href="/login"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-center text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-center bg-teal-600 text-white hover:bg-teal-700 transition-colors"
            >
              회원가입
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}

/* ── 아이콘 컴포넌트 (24px SVG) ─────────────────────────────── */

function HomeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M3.6 9h16.8M3.6 15h16.8M12 3a15.3 15.3 0 010 18M12 3a15.3 15.3 0 000 18" />
    </svg>
  );
}

function NewsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
    </svg>
  );
}

function ChartBarIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function CoinIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 6v2m0 8v2M9.5 9.5c.5-1 1.3-1.5 2.5-1.5s2.5.7 2.5 2c0 2.5-5 2-5 4.5 0 1.4 1 2 2.5 2s2.2-.6 2.5-1.5" />
    </svg>
  );
}

function TrendingIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  );
}

function BotIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}
