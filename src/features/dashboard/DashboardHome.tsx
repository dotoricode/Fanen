'use client';
import { DisclaimerBanner } from '@/components/common';
import { MorningBriefCard } from './components/MorningBriefCard';
import { SectorTop3Card } from './components/SectorTop3Card';
import { HotZoneCard } from './components/HotZoneCard';
import { PortfolioCard } from './components/PortfolioCard';
import { MorningLightCard } from './components/MorningLightCard';
import { HubMenu } from './components/HubMenu';

export default function DashboardHome() {
  return (
    <div className="bg-slate-50 dark:bg-[#0F1923]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. 반디 오전 브리핑 — full width */}
          <MorningBriefCard className="md:col-span-2 order-1" />

          {/* 2. Hub 퀵메뉴 — 모바일: 브리핑 바로 아래, 데스크탑: 맨 아래 */}
          <div className="md:col-span-2 order-2 md:order-last flex justify-center py-4">
            <HubMenu />
          </div>

          {/* 3. Hot Zone 지도 — 데스크탑: 좌측 2행 span */}
          <HotZoneCard className="order-3 md:row-span-2" />

          {/* 4. 섹터 Top3 */}
          <SectorTop3Card className="order-4" />

          {/* 5. 포트폴리오 */}
          <PortfolioCard className="order-5" />

          {/* 6. 모닝 라이트 — full width */}
          <MorningLightCard className="order-6 md:col-span-2" />

          {/* 면책 고지 */}
          <div className="md:col-span-2 order-last">
            <DisclaimerBanner variant="default" />
          </div>
        </div>
      </div>
    </div>
  );
}
