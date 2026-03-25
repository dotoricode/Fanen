'use client';
/**
 * HubMenu 컴포넌트
 * 340×340 SVG — 중앙 허브 + 4개 카드 위성 + Animated Beam
 * 십자형 배치, 틸 Bézier 연결선, 빛 입자 흐름 애니메이션
 */
import { motion, useAnimationFrame } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';

const SIZE = 340;
const CENTER = { x: 170, y: 170 };

// 4개 위성 카드 — 십자 배치 (위/오른쪽/아래/왼쪽)
const SATELLITES = [
  {
    label: '비나 맵',
    sub: '세계 정세',
    href: '/binah-map',
    cx: 170,
    cy: 58,
    icon: (
      <>
        <circle cx={12} cy={10} r={4} />
        <path d="M12 20s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10z" strokeLinejoin="round" />
      </>
    ),
  },
  {
    label: '모의투자',
    sub: '투자 시뮬레이션',
    href: '/mock-trading',
    cx: 282,
    cy: 170,
    icon: (
      <path d="M3 17l4-8 4 5 3-3 5 6M3 21h18" strokeLinejoin="round" />
    ),
  },
  {
    label: '반디 코치',
    sub: 'AI 투자 코치',
    href: '/coach',
    cx: 170,
    cy: 282,
    icon: (
      <>
        <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z" />
        <path d="M8 12h.01M12 12h.01M16 12h.01" strokeLinecap="round" strokeWidth={2.5} />
      </>
    ),
  },
  {
    label: '배당 허브',
    sub: '배당·ETF',
    href: '/dividend',
    cx: 58,
    cy: 170,
    icon: (
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinejoin="round" />
    ),
  },
];

// S-커브 Bézier 연결선 (중앙 → 각 위성)
const CURVES = [
  `M ${CENTER.x} ${CENTER.y} C ${CENTER.x - 16} 132, ${CENTER.x + 16} 88, ${CENTER.x} 58`,  // 위
  `M ${CENTER.x} ${CENTER.y} C 202 ${CENTER.y - 16}, 252 ${CENTER.y + 16}, 282 ${CENTER.y}`,  // 오른쪽
  `M ${CENTER.x} ${CENTER.y} C ${CENTER.x + 16} 208, ${CENTER.x - 16} 252, ${CENTER.x} 282`, // 아래
  `M ${CENTER.x} ${CENTER.y} C 138 ${CENTER.y + 16}, 88 ${CENTER.y - 16}, 58 ${CENTER.y}`,   // 왼쪽
];

/** 경로를 따라 흐르는 빔 입자 컴포넌트 */
function AnimatedBeam({ pathD, delay }: { pathD: string; delay: number }) {
  const pathRef = useRef<SVGPathElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);

  useAnimationFrame((time) => {
    const raw = (time / 1000 - delay) % 3.2;
    const progress = raw < 0 ? 0 : Math.min(1, raw / 3.2);

    if (circleRef.current && pathRef.current) {
      try {
        const len = pathRef.current.getTotalLength();
        const pt = pathRef.current.getPointAtLength(progress * len);
        circleRef.current.setAttribute('cx', String(pt.x));
        circleRef.current.setAttribute('cy', String(pt.y));
        circleRef.current.setAttribute('opacity', String(Math.sin(progress * Math.PI) * 0.9));
      } catch {
        // 렌더링 전 오류 무시
      }
    }
  });

  return (
    <g>
      {/* getTotalLength 계산용 참조 path (보이지 않음) */}
      <path ref={pathRef} d={pathD} fill="none" stroke="none" />
      {/* 보이는 연결선 */}
      <motion.path
        d={pathD}
        fill="none"
        stroke="#0D9488"
        strokeWidth={1}
        strokeOpacity={0.25}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, delay: delay * 0.3, ease: 'easeOut' }}
      />
      {/* 빔 입자 */}
      <circle
        ref={circleRef}
        r={2.5}
        fill="#2DD4BF"
      />
    </g>
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
      {/* 연결선 + 빔 입자 */}
      {CURVES.map((d, i) => (
        <AnimatedBeam key={i} pathD={d} delay={i * 0.9} />
      ))}

      {/* 중앙 허브 노드 */}
      <motion.g
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'backOut' }}
        style={{ originX: `${CENTER.x}px`, originY: `${CENTER.y}px` }}
      >
        {/* 외부 pulse 링 */}
        <motion.circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={38}
          fill="none"
          stroke="#0D9488"
          strokeWidth={0.8}
          strokeOpacity={0.4}
          style={{ originX: `${CENTER.x}px`, originY: `${CENTER.y}px` }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.15, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* 내부 원 */}
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={34}
          fill="none"
          stroke="#0D9488"
          strokeWidth={1}
          strokeOpacity={0.3}
          className="fill-teal-50/40 dark:fill-teal-950/30"
        />
        {/* 중앙 채움 */}
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={28}
          className="fill-white dark:fill-zinc-900"
          strokeWidth={0}
        />
        {/* 텍스트 */}
        <text
          x={CENTER.x}
          y={CENTER.y - 4}
          textAnchor="middle"
          fontSize={10}
          fontWeight={800}
          fill="#0D9488"
        >
          오늘의
        </text>
        <text
          x={CENTER.x}
          y={CENTER.y + 9}
          textAnchor="middle"
          fontSize={10}
          fontWeight={800}
          fill="#0D9488"
        >
          기회
        </text>
      </motion.g>

      {/* 4개 위성 카드 */}
      {SATELLITES.map((sat, i) => (
        <motion.g
          key={sat.href}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ originX: `${sat.cx}px`, originY: `${sat.cy}px` }}
          transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.4 + i * 0.1 }}
        >
          <Link href={sat.href}>
            <motion.g
              whileHover="hover"
              style={{ originX: `${sat.cx}px`, originY: `${sat.cy}px` }}
              transition={{ type: 'spring', stiffness: 360, damping: 22 }}
            >
              {/* hover glow */}
              <motion.rect
                x={sat.cx - 40}
                y={sat.cy - 33}
                width={80}
                height={66}
                rx={13}
                fill="#0D9488"
                initial={{ opacity: 0 }}
                variants={{ hover: { opacity: 0.06 } }}
              />
              {/* 카드 배경 */}
              <motion.rect
                x={sat.cx - 40}
                y={sat.cy - 33}
                width={80}
                height={66}
                rx={13}
                className="fill-white dark:fill-zinc-900/90"
                stroke="#0D9488"
                strokeWidth={1}
                strokeOpacity={0.25}
                variants={{ hover: { strokeOpacity: 0.7 } }}
              />
              {/* 아이콘 */}
              <g transform={`translate(${sat.cx - 10}, ${sat.cy - 25})`}>
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0D9488"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                >
                  {sat.icon}
                </svg>
              </g>
              {/* 레이블 */}
              <text
                x={sat.cx}
                y={sat.cy + 8}
                textAnchor="middle"
                fontSize={11}
                fontWeight={700}
                className="fill-zinc-800 dark:fill-zinc-100"
              >
                {sat.label}
              </text>
              {/* 서브레이블 */}
              <text
                x={sat.cx}
                y={sat.cy + 22}
                textAnchor="middle"
                fontSize={8.5}
                className="fill-zinc-400 dark:fill-zinc-500"
              >
                {sat.sub}
              </text>
            </motion.g>
          </Link>
        </motion.g>
      ))}
    </svg>
  );
}
