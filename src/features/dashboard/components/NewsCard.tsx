'use client';

/**
 * NewsCard — 오늘의 주요 뉴스 카드
 * glass 효과 (backdrop-blur-sm)
 */
import Link from 'next/link';
import { cn } from '@/lib/utils';

const MOCK_NEWS = [
  { id: '1', title: '삼성전자, 2분기 영업이익 10조 돌파 전망', source: '한국경제' },
  { id: '2', title: '셀트리온, 글로벌 바이오시밀러 시장 점유율 확대', source: '매일경제' },
  { id: '3', title: '현대차, 전기차 신모델 출시로 점유율 반등 기대', source: '조선비즈' },
];

export function NewsCard({ className }: { className?: string }) {
  return (
    <div className={cn(
      'rounded-2xl border border-slate-100 dark:border-white/5',
      'bg-white/80 dark:bg-white/5 shadow-sm backdrop-blur-sm p-6',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
          오늘의 주요 뉴스
        </p>
        <Link href="/news" className="text-xs text-primary hover:underline transition-colors">
          전체 보기 →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {MOCK_NEWS.map((news) => (
          <div key={news.id} className="flex gap-2 items-start">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
            <div>
              <p className="text-sm font-medium leading-snug text-slate-800 dark:text-slate-200">
                {news.title}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{news.source}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
