'use client';

/**
 * MorningLightCard — 반디의 모닝 라이트 카드
 * NewsCard를 대체하는 모닝 브리핑 카드 (shimmer 효과 + stagger 애니메이션)
 */
import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const MOCK_MORNING_LIGHT = {
  greeting: '오늘은 이런 일이 있었어요!',
  date: '2026.03.25',
  items: [
    {
      id: '1',
      emoji: '🌍',
      title: '글로벌 긴장 완화 — 원/달러 소폭 하락',
      summary: '미국 연준의 금리 동결 시사로 신흥국 통화 강세 전환. 국내 수출주 수혜 기대.',
      tag: '거시경제',
    },
    {
      id: '2',
      emoji: '🛡️',
      title: '방산 섹터 강세 — 폴란드 추가 계약 임박',
      summary: '한국항공우주·현대로템, 폴란드와 2차 계약 협상 막바지. Tier 2 수혜주 주목.',
      tag: 'Value Chain',
    },
    {
      id: '3',
      emoji: '💰',
      title: '배당 투자 시즌 — 3월 배당락 주의',
      summary: '3월 결산법인 배당락일 주의. 배당 재투자 전략 재점검 시점.',
      tag: '불로소득',
    },
  ],
};

/* stagger 컨테이너 — 자식 카드를 순서대로 등장 */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/* 각 카드 slide-up fade */
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

export function MorningLightCard({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn(
        'rounded-2xl border border-white/10 dark:border-white/5',
        'bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm shadow-sm p-6',
        className
      )}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* 헤더: 반디 썸네일 + 인사말 + 전체 보기 링크 */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {/* 반디 썸네일 — grayscale */}
          <div className="relative w-10 h-10 rounded-full overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-700">
            <Image
              src="/Bandi.png"
              alt="반디"
              fill
              className="object-cover grayscale"
            />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              반디의 모닝 라이트
            </p>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
              {MOCK_MORNING_LIGHT.greeting}
            </p>
          </div>
        </div>
        <Link
          href="/news"
          className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          전체 보기 →
        </Link>
      </div>

      {/* 뉴스 마이크로 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {MOCK_MORNING_LIGHT.items.map((item) => (
          <MorningLightItem key={item.id} item={item} />
        ))}
      </div>
    </motion.div>
  );
}

/* 개별 아이템 카드 — shimmer glare 효과 */
function MorningLightItem({ item }: { item: (typeof MOCK_MORNING_LIGHT.items)[0] }) {
  return (
    <motion.div
      variants={cardVariants}
      className={cn(
        'relative overflow-hidden rounded-xl p-4 cursor-pointer',
        'border border-zinc-100 dark:border-zinc-800',
        'bg-white dark:bg-zinc-900/80',
        'hover:border-zinc-300 dark:hover:border-zinc-600',
        'transition-colors duration-200',
        'group'
      )}
    >
      {/* Shimmer glare — hover 시 빛이 훑고 지나가는 효과 */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </div>

      {/* 상단: 이모지 + 태그 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg">{item.emoji}</span>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
          {item.tag}
        </span>
      </div>

      {/* 제목 */}
      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 leading-snug mb-1">
        {item.title}
      </p>

      {/* 요약 */}
      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
        {item.summary}
      </p>
    </motion.div>
  );
}
