'use client';
/**
 * HubMenu 컴포넌트 — 반디 키워드 슬라이더 애니메이션
 *
 * 반딧불이(반디)가 가로 레일을 따라 날아다니며
 * 파낸의 핵심 기능 키워드 정류장을 소개하는 UI.
 * 짝수 인덱스 카드는 레일 위, 홀수 인덱스 카드는 레일 아래 배치.
 */
import { motion } from 'framer-motion';
import Link from 'next/link';

/** 정류장 목록 */
const STATIONS = [
  {
    emoji: '🌍',
    label: '세계 정세',
    sub: '글로벌 맵',
    href: '/binah-map',
  },
  {
    emoji: '📰',
    label: '뉴스 분석',
    sub: '글로벌 뉴스',
    href: '/global-news',
  },
  {
    emoji: '📊',
    label: '섹터 분석',
    sub: '섹터 지도',
    href: '/sector',
  },
  {
    emoji: '💰',
    label: '섹터 연결망',
    sub: '기업 수혜 관계망',
    href: '/sector-analysis',
  },
  {
    emoji: '💼',
    label: '내 포트폴리오',
    sub: '자산 관리',
    href: '/portfolio',
  },
  {
    emoji: '✨',
    label: '반디 코치',
    sub: 'AI 코치',
    href: '/coach',
  },
] as const;

/** 반디 SVG — 발광하는 반딧불이 */
function FireflyIcon() {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* 몸통 */}
      <ellipse cx={14} cy={16} rx={5} ry={3} fill="#2DD4BF" opacity={0.95} />
      {/* 머리 */}
      <circle cx={14} cy={11.5} r={2.5} fill="#14B8A6" />
      {/* 발광 꼬리 */}
      <ellipse cx={14} cy={19} rx={2.5} ry={1.5} fill="#5EEAD4" opacity={0.8} />
      {/* 더듬이 왼쪽 */}
      <line x1={12} y1={10} x2={9.5} y2={7.5} stroke="#14B8A6" strokeWidth={1} strokeLinecap="round" />
      {/* 더듬이 오른쪽 */}
      <line x1={16} y1={10} x2={18.5} y2={7.5} stroke="#14B8A6" strokeWidth={1} strokeLinecap="round" />
      {/* 날개 왼쪽 */}
      <ellipse cx={9} cy={15} rx={3} ry={1.5} fill="#99F6E4" opacity={0.4} transform="rotate(-20 9 15)" />
      {/* 날개 오른쪽 */}
      <ellipse cx={19} cy={15} rx={3} ry={1.5} fill="#99F6E4" opacity={0.4} transform="rotate(20 19 15)" />
    </svg>
  );
}

/** 정류장 카드 (위/아래 배치 교대) */
function StationCard({
  station,
  isAbove,
}: {
  station: (typeof STATIONS)[number];
  isAbove: boolean;
}) {
  return (
    <div className="relative flex flex-col items-center">
      {/* 위쪽 배치: 카드 → 연결선 → dot */}
      {isAbove && (
        <>
          <Link href={station.href}>
            <motion.div
              className="
                flex flex-col items-center gap-1 rounded-xl border
                border-zinc-200 dark:border-zinc-700
                bg-white dark:bg-zinc-900
                px-3 py-2 shadow-sm
                cursor-pointer
                transition-colors
                hover:border-teal-400 dark:hover:border-teal-500
              "
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <span className="text-xl leading-none">{station.emoji}</span>
              <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-100 whitespace-nowrap">
                {station.label}
              </span>
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                {station.sub}
              </span>
            </motion.div>
          </Link>
          {/* 연결선 */}
          <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-600" />
          {/* 레일 위 dot */}
          <div className="w-2.5 h-2.5 rounded-full border-2 border-zinc-400 dark:border-zinc-500 bg-white dark:bg-zinc-900 -mb-1.5 z-10" />
        </>
      )}

      {/* 아래쪽 배치: dot → 연결선 → 카드 */}
      {!isAbove && (
        <>
          {/* 레일 아래 dot */}
          <div className="w-2.5 h-2.5 rounded-full border-2 border-zinc-400 dark:border-zinc-500 bg-white dark:bg-zinc-900 -mt-1.5 z-10" />
          {/* 연결선 */}
          <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-600" />
          <Link href={station.href}>
            <motion.div
              className="
                flex flex-col items-center gap-1 rounded-xl border
                border-zinc-200 dark:border-zinc-700
                bg-white dark:bg-zinc-900
                px-3 py-2 shadow-sm
                cursor-pointer
                transition-colors
                hover:border-teal-400 dark:hover:border-teal-500
              "
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <span className="text-xl leading-none">{station.emoji}</span>
              <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-100 whitespace-nowrap">
                {station.label}
              </span>
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                {station.sub}
              </span>
            </motion.div>
          </Link>
        </>
      )}
    </div>
  );
}

export function HubMenu() {
  return (
    <div
      className="
        w-full
        bg-zinc-50 dark:bg-zinc-900/50
        rounded-2xl
        px-6 py-5
        overflow-hidden
      "
    >
      {/* 상단 타이틀 */}
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4 text-center">
        반디와 함께 탐색하기
      </p>

      {/* 레일 + 정류장 컨테이너 */}
      <div className="relative flex items-center" style={{ height: 168 }}>

        {/* 정류장 행 — 레일 위/아래 교대 배치 */}
        <div className="relative z-10 w-full flex items-center justify-between px-2">
          {STATIONS.map((station, i) => (
            <StationCard key={station.href} station={station} isAbove={i % 2 === 0} />
          ))}
        </div>

        {/* 가로 레일 — 절대 위치로 중앙에 배치 */}
        <div
          className="absolute left-0 right-0 border-t border-dashed border-zinc-300 dark:border-zinc-700 z-0 pointer-events-none"
          style={{ top: '50%' }}
        />

        {/* 반디(반딧불이) — 레일을 따라 무한 이동 */}
        <motion.div
          className="absolute z-20 pointer-events-none"
          style={{
            top: 'calc(50% - 14px)', /* 반디 높이 절반 오프셋 */
            filter: 'drop-shadow(0 0 6px rgba(45,212,191,0.7))',
          }}
          animate={{
            x: ['-10%', '110%'],
            y: [0, -6, 0, -4, 0, -7, 0],
          }}
          transition={{
            x: {
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            },
            y: {
              duration: 2.4,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        >
          <FireflyIcon />
        </motion.div>

      </div>

      {/* 하단 힌트 */}
      <p className="text-[9px] text-zinc-400 dark:text-zinc-600 text-center mt-2">
        카드를 클릭해 기능으로 이동하세요
      </p>
    </div>
  );
}
