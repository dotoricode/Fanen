# Design: value-chain-redesign v0.0.1

## 메타데이터
- Feature: value-chain-redesign
- 연결 Plan: value-chain-redesign.plan-v0.0.1.md
- 작성일: 2026-03-26
- 작성자: CTO Lead

---

## 1. 컴포넌트 구조

### 1.1 파일 변경 맵

```
[삭제]
src/app/sector/page.tsx
src/features/sector-map/                     ← 디렉토리 전체

[수정]
src/components/common/SideNav.tsx            ← /sector 항목 제거
src/app/sector-analysis/page.tsx             ← 글라스모피즘 헤더
src/app/sector-analysis/SectorAnalysisPageClient.tsx  ← 뷰 토글 + 전면 리팩토링
src/features/sector-analysis/components/SectorDetailPanel.tsx  ← 글라스모피즘

[신규]
src/features/sector-analysis/components/ValueChainDiagram.tsx  ← 핵심 컴포넌트
src/features/sector-analysis/components/AnimatedBeam.tsx       ← SVG 빔 애니메이션
src/features/sector-analysis/components/ViewToggle.tsx         ← 전체/상세 토글
src/features/sector-analysis/data/allSectorsData.ts            ← 전체 뷰 mock 데이터
```

---

## 2. ValueChainDiagram 컴포넌트 설계

### 2.1 Props 인터페이스
```typescript
interface ValueChainDiagramProps {
  // 상세 뷰: 단일 섹터 체인
  chain?: ValueChain;
  // 전체 뷰: 모든 섹터 요약 노드 배열
  allSectors?: SectorSummary[];
  // 뷰 모드
  viewMode: 'overview' | 'detail';
  // 콜백
  onNodeClick?: (node: ValueChainNode) => void;
  selectedTicker?: string | null;
}

interface SectorSummary {
  sectorKey: string;
  sectorLabel: string;
  tierOneSample: string[];   // Tier 1 대표 종목 3~5개
  eventTrigger: string;
}
```

### 2.2 레이아웃 알고리즘 (D3 forceSimulation)
```typescript
// 상세 뷰 레이아웃
const simulation = d3.forceSimulation(nodes)
  .force('link', d3.forceLink(links).id(d => d.id).distance(tierDistance))
  .force('charge', d3.forceManyBody().strength(-80))
  .force('collide', d3.forceCollide().radius(d => tierRadius[d.tier] + 8))
  .force('radial', d3.forceRadial(d => ORBIT_RADIUS[d.tier], cx, cy).strength(0.9))
  .force('center', d3.forceCenter(cx, cy).strength(0.05));

// 중앙 노드 고정
centerNode.fx = cx;
centerNode.fy = cy;
```

### 2.3 무채색 팔레트 (라이트/다크 대응)
```typescript
const PALETTE = {
  // 라이트 모드
  light: {
    bg: 'rgba(255,255,255,0)',           // 투명 (부모에서 배경 처리)
    nodeFill: 'rgba(255,255,255,0.7)',    // 유리 흰색
    nodeStroke: {
      center: 'rgba(0,0,0,0.8)',
      tier0: 'rgba(0,0,0,0.5)',
      tier1: 'rgba(0,0,0,0.3)',
      tier2: 'rgba(0,0,0,0.2)',
      tier3: 'rgba(0,0,0,0.12)',
    },
    edge: 'rgba(0,0,0,0.12)',
    edgeBeam: 'rgba(120,120,120,0.6)',
    label: 'rgba(0,0,0,0.55)',
    labelSelected: 'rgba(0,0,0,0.9)',
    hoverRing: 'rgba(0,0,0,0.4)',
  },
  // 다크 모드
  dark: {
    bg: 'rgba(0,0,0,0)',
    nodeFill: 'rgba(255,255,255,0.05)',  // 유리 검정
    nodeStroke: {
      center: 'rgba(255,255,255,0.9)',
      tier0: 'rgba(255,255,255,0.5)',
      tier1: 'rgba(255,255,255,0.25)',
      tier2: 'rgba(255,255,255,0.15)',
      tier3: 'rgba(255,255,255,0.08)',
    },
    edge: 'rgba(255,255,255,0.08)',
    edgeBeam: 'rgba(210,210,210,0.5)',
    label: 'rgba(255,255,255,0.45)',
    labelSelected: 'rgba(255,255,255,0.95)',
    hoverRing: 'rgba(255,255,255,0.3)',
  },
} as const;
```

### 2.4 Tier 치수
```typescript
const TIER_RADIUS = { '-1': 44, 0: 28, 1: 21, 2: 16, 3: 11 } as const;
const ORBIT_RADIUS = { 0: 130, 1: 230, 2: 330, 3: 420 } as const;
```

---

## 3. 애니메이션 설계

### 3.1 Stagger 등장 (framer-motion)
```tsx
// 노드 컨테이너
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.1 }
  }
};
// 개별 노드 (중앙에서 scale-up)
const nodeVariant = {
  hidden: { scale: 0, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } }
};
```
framer-motion의 `motion.g` (SVG foreignObject 래핑 없이 SVG 내부에서 직접 사용)

### 3.2 Animated Beam (SVG CSS Animation)
```svg
<!-- 엣지마다 defs에 gradient + animateMotion 파티클 -->
<defs>
  <linearGradient id="beam-{edgeId}" gradientUnits="userSpaceOnUse"
    x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">
    <stop offset="0%" stopColor="transparent"/>
    <stop offset="50%" stopColor="{beamColor}" stopOpacity="0.8"/>
    <stop offset="100%" stopColor="transparent"/>
  </linearGradient>
</defs>
<!-- 빔 파티클: 작은 원이 경로를 따라 이동 -->
<circle r="2" fill="{beamColor}" opacity="0.7">
  <animateMotion
    dur="{2 + tier * 0.5}s"
    repeatCount="indefinite"
    begin="{edgeIndex * 0.3}s"
  >
    <mpath href="#{pathId}"/>
  </animateMotion>
</circle>
```

### 3.3 Spring Hover (framer-motion useSpring)
```typescript
// 각 노드 그룹에 개별 spring 적용
const scale = useSpring(1, { stiffness: 400, damping: 25 });
const opacity = useSpring(1, { stiffness: 300, damping: 30 });

// hover 진입 시
onHoverStart={() => {
  scale.set(1.2);
  // 비연결 노드들 opacity 0.15로
  dimUnconnectedNodes(nodeId);
}}
onHoverEnd={() => {
  scale.set(1);
  restoreAllNodes();
}}
```

---

## 4. ViewToggle 컴포넌트 설계

```tsx
// 위치: SectorAnalysisPageClient 상단 우측
interface ViewToggleProps {
  value: 'overview' | 'detail';
  onChange: (v: 'overview' | 'detail') => void;
}

// UI: pill-shaped segmented control
// 글라스모피즘: backdrop-blur-sm bg-white/10 dark:bg-black/20 border border-white/20
```

---

## 5. 글라스모피즘 CSS 패턴

### 5.1 컨테이너 (다이어그램 래퍼)
```css
/* 라이트 */
.glass-container {
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border-radius: 16px;
}
/* 다크 */
.dark .glass-container {
  background: rgba(10, 10, 10, 0.5);
  backdrop-filter: blur(20px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
```
Tailwind 클래스:
```
bg-white/45 dark:bg-black/50
backdrop-blur-xl
border border-white/60 dark:border-white/8
shadow-lg dark:shadow-black/40
rounded-2xl
```

### 5.2 Detail Panel 글라스모피즘
```
bg-white/80 dark:bg-zinc-900/80
backdrop-blur-md
border border-zinc-200/80 dark:border-zinc-700/50
rounded-2xl shadow-xl
```

---

## 6. 전체 뷰 (Overview) 데이터 구조

```typescript
// src/features/sector-analysis/data/allSectorsData.ts
export const ALL_SECTORS_OVERVIEW: SectorSummary[] = [
  {
    sectorKey: 'defense',
    sectorLabel: '방산',
    tierOneSample: ['한화에어로', 'LIG넥스원', 'KAI'],
    eventTrigger: 'NATO 방위비 증액',
  },
  {
    sectorKey: 'semiconductor',
    sectorLabel: '반도체',
    tierOneSample: ['삼성전자', 'SK하이닉스', '리노공업'],
    eventTrigger: 'AI 서버 수요 급증',
  },
  // ...
];
```

전체 뷰 레이아웃: 각 섹터가 하나의 클러스터 노드로 표시,
클러스터 내부에 Tier 0 샘플 노드 3개를 위성처럼 배치.
클러스터 간 거리는 `forceManyBody` 로 자동 분산.

---

## 7. 라이트/다크 모드 CSS 변수 확인

기존 `globals.css`에서 다크모드는 `document.documentElement.classList.contains('dark')`로 감지.
다이어그램 내에서는 `isDark` state를 통해 팔레트 분기 처리.
추가 CSS 변수 수정 불필요 (기존 구조 유지).

---

## 8. 파일별 구현 상세

### 8.1 SideNav.tsx 변경점
```typescript
// 제거 (line 24)
{ href: '/sector', label: '섹터 분석', icon: ChartBarIcon },
// ChartBarIcon 함수도 제거 (사용처 없어짐)
```

### 8.2 SectorAnalysisPageClient.tsx 전면 리팩토링
```tsx
'use client';
// viewMode state 추가
const [viewMode, setViewMode] = useState<'overview' | 'detail'>('detail');
// ViewToggle 컴포넌트 삽입
// ValueChainDiagram으로 교체 (SectorMindmapView 대신)
```

### 8.3 page.tsx (sector-analysis) 스타일 업데이트
```tsx
// bg-[#111111] → 라이트/다크 반응형으로 교체
// 헤더에 accent 색상 → 무채색으로 교체 (기존 text-[#3B82F6] 제거)
<main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
```

---

## 9. 수용 기준 (Acceptance Criteria)

| ID | 기준 | 검증 방법 |
|----|------|---------|
| AC-01 | 사이드바 메뉴 8개 (섹터 분석 없음) | 화면 확인 |
| AC-02 | `/sector` 접근 시 404 | 브라우저 접근 |
| AC-03 | Node-Link: Tier 0~3 다방향 배치 | 시각 확인 |
| AC-04 | 전체 뷰 토글 시 다중 섹터 클러스터 표시 | 시각 확인 |
| AC-05 | 라이트/다크 전환 시 글라스모피즘 유지 | DarkModeToggle 클릭 |
| AC-06 | 노드 등장 시 stagger 효과 | 섹터 탭 전환 |
| AC-07 | 엣지 위 파티클 흐름 보임 | 시각 확인 |
| AC-08 | Hover 시 비연결 노드 dim + 연결 노드 강조 | 노드 hover |
| AC-09 | 모바일(375px)에서 줌/팬 가능 | 모바일 뷰포트 |
