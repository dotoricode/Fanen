'use client';
import type { GlobalNewsItem } from '@/lib/mock/mockGlobalNews';
import SectorImpactHeatmap from './SectorImpactHeatmap';
import BenefitStockCard from './BenefitStockCard';
import AiBadge from '@/components/common/AiBadge';

interface Props { news: GlobalNewsItem; }

export default function GlobalNewsAnalysis({ news }: Props) {
  return (
    <div className="space-y-6 mt-6">
      {/* 섹터 영향도 */}
      <section className="rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">섹터별 영향도</h3>
          <AiBadge />
        </div>
        <SectorImpactHeatmap sectors={news.benefitSectors} />
      </section>

      {/* 수혜 종목 */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">수혜 종목 추천</h3>
          <AiBadge />
        </div>
        <div className="space-y-3">
          {news.benefitStocks.map((stock) => (
            <BenefitStockCard key={stock.code} stock={stock} />
          ))}
        </div>
      </section>
    </div>
  );
}
