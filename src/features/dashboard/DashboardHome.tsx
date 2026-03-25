'use client';
import { DisclaimerBanner } from '@/components/common';
import { cn } from '@/lib/utils';
import { MorningBriefCard } from './components/MorningBriefCard';
import { SectorTop3Card } from './components/SectorTop3Card';
import { HotZoneCard } from './components/HotZoneCard';
import { PortfolioCard } from './components/PortfolioCard';
import { NewsCard } from './components/NewsCard';
import Link from 'next/link';

const QUICK_MENU = [
  { label: '비나 맵', href: '/binah-map', icon: '🌍' },
  { label: '모의투자', href: '/mock-trading', icon: '📈' },
  { label: '반디 코치', href: '/coach', icon: '🤖' },
  { label: '배당 허브', href: '/dividend', icon: '💰' },
] as const;

export default function DashboardHome() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F1923]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. 반디 오전 브리핑 — full width */}
          <MorningBriefCard className="md:col-span-2 order-1" />

          {/* 2. 빠른 메뉴 — 모바일: 브리핑 바로 아래, 데스크탑: 맨 아래 */}
          <div className="grid grid-cols-4 gap-3 md:col-span-2 order-2 md:order-last">
            {QUICK_MENU.map((item) => (
              <Link key={item.href} href={item.href} className="group">
                <div className={cn(
                  'rounded-2xl border border-slate-100 dark:border-white/5',
                  'bg-white dark:bg-white/5 shadow-sm p-4 text-center',
                  'hover:border-primary/30 dark:hover:border-primary/20',
                  'hover:shadow-md transition-all duration-200 cursor-pointer'
                )}>
                  <div className="text-2xl group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </div>
                  <p className="mt-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">
                    {item.label}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* 3. Hot Zone 지도 — 데스크탑: 좌측 2행 span */}
          <HotZoneCard className="order-3 md:row-span-2" />

          {/* 4. 섹터 Top3 */}
          <SectorTop3Card className="order-4" />

          {/* 5. 포트폴리오 */}
          <PortfolioCard className="order-5" />

          {/* 6. 뉴스 — full width */}
          <NewsCard className="order-6 md:col-span-2" />

          {/* 면책 고지 */}
          <div className="md:col-span-2 order-last">
            <DisclaimerBanner variant="default" />
          </div>
        </div>
      </div>
    </div>
  );
}
