'use client';
/**
 * BinahLogo 컴포넌트
 * 틸 컬러 기하학적 허브 심볼 + "비나" 워드마크
 * framer-motion으로 pathLength, scale 애니메이션
 */
import { motion } from 'framer-motion';
import Link from 'next/link';

// 위성 점 좌표 (중앙 12,12 기준, 반지름 8)
const SATELLITES = [
  { cx: 12, cy: 4 },    // 위 (-90°)
  { cx: 19, cy: 16 },   // 우하 (30°)
  { cx: 5, cy: 16 },    // 좌하 (150°)
];

// 중앙 → 위성 연결선
const LINES = [
  'M 12 12 L 12 4',
  'M 12 12 L 19 16',
  'M 12 12 L 5 16',
];

export function BinahLogo() {
  return (
    <Link href="/">
      <motion.div
        className="flex items-center gap-2 cursor-pointer"
        whileHover="hover"
      >
        {/* 틸 허브 심볼 */}
        <motion.svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          variants={{ hover: { scale: 1.08 } }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{ transformOrigin: 'center' }}
        >
          {/* 외부 pulse 링 */}
          <motion.circle
            cx={12}
            cy={12}
            r={10.5}
            fill="none"
            stroke="#0D9488"
            strokeWidth={0.7}
            animate={{ opacity: [0.18, 0.38, 0.18], scale: [1, 1.07, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ originX: '12px', originY: '12px' }}
          />

          {/* 연결선 3개 — teal */}
          {LINES.map((d, i) => (
            <motion.path
              key={i}
              d={d}
              stroke="#0D9488"
              strokeWidth={1.6}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, delay: i * 0.15, ease: 'easeOut' }}
            />
          ))}

          {/* 중앙 점 — 진한 teal */}
          <motion.circle
            cx={12}
            cy={12}
            r={2.8}
            fill="#0D9488"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'backOut' }}
            style={{ originX: '12px', originY: '12px' }}
          />

          {/* 위성 점 3개 — 밝은 teal */}
          {SATELLITES.map((s, i) => (
            <motion.circle
              key={i}
              cx={s.cx}
              cy={s.cy}
              r={2}
              fill="#2DD4BF"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.5 + i * 0.1, ease: 'backOut' }}
              style={{ originX: `${s.cx}px`, originY: `${s.cy}px` }}
            />
          ))}
        </motion.svg>

        {/* 비나 워드마크 */}
        <motion.span
          className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100"
          variants={{ hover: { scale: 1.05 } }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          style={{ display: 'inline-block', transformOrigin: 'left center' }}
        >
          비나
        </motion.span>
      </motion.div>
    </Link>
  );
}
