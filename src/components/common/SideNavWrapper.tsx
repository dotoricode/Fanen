'use client';

import dynamic from 'next/dynamic';

/** SideNav를 SSR 없이 로드 — framer-motion layoutId SSR 호환성 이슈 방지 */
const SideNav = dynamic(() => import('./SideNav'), {
  ssr: false,
  loading: () => (
    <aside
      className="hidden md:flex flex-col fixed top-0 left-0 h-screen z-50 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
      style={{ width: 'var(--senior-sidebar-w, 220px)' }}
    />
  ),
});

export default function SideNavWrapper() {
  return <SideNav />;
}
