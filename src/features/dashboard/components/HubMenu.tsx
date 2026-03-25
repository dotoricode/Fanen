'use client';
/**
 * HubMenu 컴포넌트
 * 340×340 SVG — 중앙 노드 + 3개 위성 노드 + Animated Beam (framer-motion)
 * 무채색(zinc) 테마, Bézier 연결선, 빛 입자 흐름 애니메이션
 */
import { motion, useAnimationFrame, useMotionValue } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';

const SIZE = 340;
const CENTER = { x: 170, y: 170 };
const RADIUS = 110;

// 위성 노드 정의 (각도: 위=-90°, 우하=30°, 좌하=150°)
const SATELLITES = [
  {
    label: '비나 맵',
    sub: 'Binah Map',
    href: '/binah-map',
    cx: 170,
    cy: 60,   // -90°
    icon: (
      <path
        d="M10 20s-7-6.5-7-11.5a7 7 0 0 1 14 0c0 5-7 11.5-7 11.5zm0-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
        fill="currentColor"
      />
    ),
  },
  {
    label: 'Value Chain',
    sub: '가치 사슬',
    href: '/value-chain',
    cx: 265,
    cy: 225,  // 30°
    icon: (
      <path
        d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zm20 0h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    label: '배당 허브',
    sub: 'Dividend Hub',
    href: '/dividend',
    cx: 75,
    cy: 225,  // 150°
    icon: (
      <path
        d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

// Bézier 연결선 (중앙 → 위성)
const CURVES = [
  `M ${CENTER.x} ${CENTER.y} C ${CENTER.x} 130, ${CENTER.x} 100, 170 60`,
  `M ${CENTER.x} ${CENTER.y} C 210 190, 240 210, 265 225`,
  `M ${CENTER.x} ${CENTER.y} C 130 190, 100 210, 75 225`,
];

// 각 beam의 cx, cy를 path를 따라 보간하는 컴포넌트
function BeamParticle({ pathD, delay }: { pathD: string; delay: number }) {
  const ref = useRef<SVGCircleElement>(null);
  const t = useMotionValue(0);

  useAnimationFrame((time) => {
    // 0~1 사이를 주기적으로 순환 (3초 주기, delay 적용)
    const cycle = ((time / 1000 - delay) % 3) / 3;
    const progress = Math.max(0, Math.min(1, cycle < 0 ? 0 : cycle));
    t.set(progress);

    // SVG path를 따라 cx, cy 계산
    if (ref.current) {
      try {
        const svgEl = ref.current.closest('svg') as SVGSVGElement | null;
        if (!svgEl) return;
        const pathEl = svgEl.querySelector(`[data-beam-path="${pathD.slice(0, 10)}"]`) as SVGPathElement | null;
        if (!pathEl) return;
        const len = pathEl.getTotalLength();
        const pt = pathEl.getPointAtLength(progress * len);
        ref.current.setAttribute('cx', String(pt.x));
        ref.current.setAttribute('cy', String(pt.y));
      } catch {
        // 렌더링 전 오류 무시
      }
    }
  });

  return (
    <circle
      ref={ref}
      r={3}
      className="fill-zinc-400 dark:fill-zinc-300"
      opacity={0.8}
    />
  );
}

export function HubMenu() {
  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="overflow-visible"
    >
      {/* 연결선 (숨겨진 참조용 path + 보이는 path) */}
      {CURVES.map((d, i) => (
        <g key={i}>
          {/* 참조용 path (빔 위치 계산에 사용) */}
          <path
            d={d}
            data-beam-path={d.slice(0, 10)}
            fill="none"
            stroke="none"
          />
          {/* 보이는 연결선 */}
          <motion.path
            d={d}
            fill="none"
            className="stroke-zinc-200 dark:stroke-zinc-700"
            strokeWidth={1.5}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 + i * 0.15, ease: 'easeOut' }}
          />
          {/* 빔 입자 */}
          <BeamParticle pathD={d} delay={i * 1} />
        </g>
      ))}

      {/* 중앙 노드 */}
      <motion.g
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'backOut' }}
        style={{ originX: `${CENTER.x}px`, originY: `${CENTER.y}px` }}
      >
        {/* 외부 pulse 링 — scale 로 애니메이션 (r 직접 조작 시 NaN 발생) */}
        <motion.circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={36}
          fill="none"
          className="stroke-zinc-300 dark:stroke-zinc-600"
          strokeWidth={1}
          style={{ originX: `${CENTER.x}px`, originY: `${CENTER.y}px` }}
          animate={{ scale: [1, 1.11, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* 내부 원 */}
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={34}
          className="fill-zinc-900/5 dark:fill-zinc-100/5 stroke-zinc-300 dark:stroke-zinc-600"
          strokeWidth={1.5}
        />
        {/* 텍스트 */}
        <text
          x={CENTER.x}
          y={CENTER.y - 5}
          textAnchor="middle"
          className="fill-zinc-800 dark:fill-zinc-100"
          fontSize={11}
          fontWeight={700}
        >
          오늘의 기회
        </text>
        <text
          x={CENTER.x}
          y={CENTER.y + 10}
          textAnchor="middle"
          className="fill-zinc-400 dark:fill-zinc-500"
          fontSize={9}
        >
          반디
        </text>
      </motion.g>

      {/* 위성 노드 */}
      {SATELLITES.map((sat, i) => (
        <motion.g
          key={sat.href}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ originX: `${sat.cx}px`, originY: `${sat.cy}px` }}
          whileHover={{ scale: 1.15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22, delay: 0.5 + i * 0.15 }}
        >
          <Link href={sat.href}>
            {/* 배경 원 */}
            <circle
              cx={sat.cx}
              cy={sat.cy}
              r={28}
              className="fill-zinc-900/5 dark:fill-zinc-100/5 stroke-zinc-300 dark:stroke-zinc-600 cursor-pointer"
              strokeWidth={1.5}
            />
            {/* 아이콘 (20×20 뷰박스를 위성 중심으로 이동) */}
            <g
              transform={`translate(${sat.cx - 10}, ${sat.cy - 14})`}
              className="text-zinc-600 dark:text-zinc-300"
            >
              <svg width={20} height={20} viewBox="0 0 24 24">
                {sat.icon}
              </svg>
            </g>
            {/* 레이블 */}
            <text
              x={sat.cx}
              y={sat.cy + 16}
              textAnchor="middle"
              className="fill-zinc-700 dark:fill-zinc-300 cursor-pointer"
              fontSize={10}
              fontWeight={600}
            >
              {sat.label}
            </text>
          </Link>
        </motion.g>
      ))}
    </svg>
  );
}
