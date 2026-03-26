import type { StockRecommendation } from '@/lib/mock/mockGlobalNews';
import AiBadge from '@/components/common/AiBadge';
import TrafficLightSignal from '@/components/common/TrafficLightSignal';

interface Props { stock: StockRecommendation; }

export default function BenefitStockCard({ stock }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-gray-900 dark:text-zinc-100">{stock.name}</p>
          <p className="text-xs text-gray-500 dark:text-zinc-400">{stock.sector} · {stock.code}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">신뢰도 {stock.confidence}%</span>
        </div>
      </div>
      <div className="mb-2">
        <AiBadge />
      </div>
      <TrafficLightSignal signal={stock.signal} confidence={stock.confidence} reason={stock.reason} />
    </div>
  );
}
