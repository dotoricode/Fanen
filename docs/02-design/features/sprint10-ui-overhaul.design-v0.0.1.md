# Sprint 10 UI 전면 개편 — PDCA Design Document

**문서 버전**: v0.0.1
**작성일**: 2026-03-26
**작성자**: Frontend Architect Agent
**단계**: Phase 3 (Mockup) + Phase 5 (Design System)
**대상 스프린트**: Sprint 10

---

## 1. Executive Summary

Sprint 10은 파낸(Fanen) 서비스의 UI를 전면 개편하는 스프린트로, 8개의 신규/리디자인 컴포넌트를 통해 다음 세 가지 핵심 목표를 달성한다.

| 목표 | 내용 |
|------|------|
| 브랜드 일관성 | zinc-50/950 배경 + teal-600 Primary + rose/amber/teal 의미색 3종 체계로 통일 |
| 접근성 강화 | 모바일-first 반응형 + `aria-*` 속성 + 고대비 다크모드 |
| 데이터 시각화 | SVG 마인드맵, D3.js 세계지도, Framer Motion 애니메이션으로 금융 정보의 직관적 전달 |

navy / blue / slate 계열 색상을 코드베이스 전체에서 제거하고, 모든 신호 의미색을 `rose(매도/위험)` / `amber(관망/주의)` / `teal(매수/안전)` 3종으로 통일한다.

---

## 2. 컴포넌트 아키텍처 다이어그램

```
src/
├── components/
│   └── common/
│       └── SideNav.tsx                    [레이아웃 셸, md+ 전용]
│           ├── BinahLogo (import)
│           ├── DarkModeToggle (import)
│           ├── UiModeSwitch (import)
│           └── Framer Motion layoutId="sidenav-active"
│
└── features/
    ├── dashboard/
    │   └── components/
    │       └── HubMenu.tsx                [반딧불이 레일 애니메이션]
    │           ├── FireflyIcon (SVG, 내부)
    │           └── StationCard × 6 (내부)
    │
    ├── value-chain/
    │   └── components/
    │       └── ValueChainView.tsx         [방사형 마인드맵]
    │           ├── SVGMindMap (내부, 데스크톱)
    │           │   ├── buildMindMapLayout() — 좌표 계산 순수 함수
    │           │   ├── motion.line — 엣지 애니메이션
    │           │   ├── motion.g — 노드 애니메이션
    │           │   └── NodeTooltip (내부, AnimatePresence)
    │           ├── TierList (내부, 모바일 fallback)
    │           └── CompanyCard (import, 선택 시 하단 상세)
    │               └── TierBadge (import)
    │
    ├── news-impact/
    │   └── components/
    │       ├── NewsImpactList.tsx         [필터 패널 + 카드 목록]
    │       │   └── NewsImpactCard (import)
    │       └── NewsImpactCard.tsx         [3패널 시그널 카드]
    │           ├── StockChartModal (내부, createPortal)
    │           │   └── StockChart (import from common)
    │           └── AiBadge (import from common)
    │
    ├── portfolio/
    │   └── components/
    │       └── PortfolioStyleFilter.tsx   [투자 스타일 탭]
    │           └── INVESTMENT_STYLE_CONFIG (import from lib/mock)
    │
    ├── dividend/
    │   └── components/
    │       └── PassiveIncomeCalculator.tsx [복리 시뮬레이터]
    │           ├── calcCompoundPath() — 순수 계산 함수 (내부)
    │           ├── usePassiveIncome (hook import)
    │           ├── PortfolioTypeFilter (import)
    │           └── AiBadge (import from common)
    │
    └── binah-map/
        └── components/
            └── BinahMapLite.tsx           [세계지도 FLAT/3D 토글]
                ├── D3.js geoNaturalEarth1 / geoOrthographic
                ├── topojson (world-110m.json)
                ├── riskColor / riskGlow — 순수 유틸
                ├── animateTo() — easeInOutCubic rAF 루프
                └── Framer Motion (motion.g, AnimatePresence)
```

### 레이아웃 셸 조합

```
RootLayout
├── SideNav (hidden → md:flex, w-[220px], fixed left-0)
└── <main> (md:ml-[220px])
    ├── Header (모바일 전용 헤더)
    ├── {page content}
    └── BottomNav (md:hidden, 모바일 전용)
```

---

## 3. 각 컴포넌트 Props 인터페이스

### 3.1 SideNav

```typescript
// Props 없음 — 내부에서 usePathname, Supabase auth 직접 구독
// 활성 경로: pathname 기반 exact match (/) 또는 startsWith(href + '/')
// auth state: Supabase onAuthStateChange 구독 → User | null
```

**NAV_ITEMS 구조** (9개 고정, as const 튜플):

| href | label | icon |
|------|-------|------|
| / | 홈 | HomeIcon |
| /binah-map | 세계 정세 | GlobeIcon |
| /news | 뉴스 분석 | NewsIcon |
| /sector | 섹터 분석 | ChartBarIcon |
| /value-chain | 수혜 기업 연결망 | LinkIcon |
| /portfolio | 내 포트폴리오 | BriefcaseIcon |
| /dividend | 배당 계산기 | CoinIcon |
| /mock-trading | 모의투자 | TrendingIcon |
| /coach | 반디 코치 | BotIcon |

---

### 3.2 HubMenu

```typescript
// Props 없음 — STATIONS 상수 기반 정적 컴포넌트

// 내부 StationCard Props:
interface StationCardProps {
  station: {
    emoji: string;
    label: string;
    sub: string;
    href: string;
  };
  isAbove: boolean;  // true → 카드가 레일 위, false → 레일 아래
}
```

**STATIONS** (6개 정류장):

| index | emoji | label | href | 배치 |
|-------|-------|-------|------|------|
| 0 | 🌍 | 세계 정세 | /binah-map | 레일 위 |
| 1 | 📰 | 뉴스 분석 | /global-news | 레일 아래 |
| 2 | 📊 | 섹터 분석 | /sector | 레일 위 |
| 3 | 💰 | 수혜 기업 | /value-chain | 레일 아래 |
| 4 | 💼 | 내 포트폴리오 | /portfolio | 레일 위 |
| 5 | ✨ | 반디 코치 | /coach | 레일 아래 |

---

### 3.3 ValueChainView

```typescript
interface ValueChainViewProps {
  chain: ValueChain;
}

// 의존 타입 (src/features/value-chain/types.ts)
type TierLevel = 0 | 1 | 2 | 3;
type SignalType = 'buy' | 'wait' | 'watch';

interface ValueChainNode {
  ticker: string;
  name: string;
  tier: TierLevel;
  relationship: string;
  dividendYield?: number;
  description: string;
  signal: SignalType;
  sourceUrl: string;
}

interface ValueChain {
  sector: string;
  sectorLabel: string;
  eventTrigger: string;
  nodes: ValueChainNode[];
  updatedAt: string;
}

// 내부 레이아웃 타입
interface MindMapNode {
  id: string;
  name: string;
  tier: TierLevel | -1;          // -1 = 중앙 이벤트 노드
  originalNode?: ValueChainNode;
  x: number;                     // 중앙 기준 상대 좌표
  y: number;
}

interface MindMapEdge {
  id: string;
  x1: number; y1: number;
  x2: number; y2: number;
  tier: TierLevel;               // 자식 노드 tier 기준 색상
}

interface TooltipState {
  node: ValueChainNode;
  x: number;  // containerRef 기준 픽셀 좌표
  y: number;
}
```

---

### 3.4 NewsImpactCard

```typescript
interface NewsImpactCardProps {
  item: NewsImpactCardData;
}

// 의존 타입 (src/features/news-impact/types.ts)
type Signal = 'buy' | 'hold' | 'sell';

interface NewsImpactCardData {
  id: string;
  headline: string;
  source: string | null;
  published_at: string | null;
  impact_score: number;          // 0~100
  signal: Signal;
  confidence: number;            // 0~100
  affected_sectors: string[];
  affected_stocks: string[];
  ai_summary_general: string;
  ai_summary_expert: string;
  source_url: string | null;
  stock_code?: string | null;    // KRX 차트 연동용
}

// 내부 모달 Props (createPortal)
interface StockChartModalProps {
  stockCode: string;
  stockName: string;
  onClose: () => void;
}
```

---

### 3.5 NewsImpactList

```typescript
// Props 없음 — 내부 상태 + useNewsImpacts() 훅으로 자급자족

type ImpactLevel = '전체' | '높음' | '중간' | '낮음';
// 높음: impact_score >= 67
// 중간: 34 <= impact_score < 67
// 낮음: impact_score < 34
```

---

### 3.6 PortfolioStyleFilter

```typescript
type InvestmentStyleType =
  | 'dividend'    // 배당형
  | 'value'       // 가치형
  | 'growth'      // 성장형
  | 'theme'       // 테마형
  | 'etf_stable'; // ETF안정형

type StyleFilterOption = InvestmentStyleType | 'all';

interface PortfolioStyleFilterProps {
  selected: StyleFilterOption;
  onSelect: (type: StyleFilterOption) => void;
  counts: Record<InvestmentStyleType | 'all', number>;
}
```

---

### 3.7 PassiveIncomeCalculator

```typescript
// Props 없음 — 내부 상태 관리 (useState × 3)

// 내부 상태:
// targetMonthly: number    (기본값 500_000원, 범위 100_000~5_000_000, step 100_000)
// yieldPercent: number     (기본값 4, 옵션: 3 | 4 | 5)
// portfolioType: PortfolioType

// 의존 훅 인터페이스:
interface UsePassiveIncomeParams {
  targetMonthlyIncome: number;
  annualYieldPercent: number;
  portfolioType: PortfolioType;
}

// calcCompoundPath 순수 함수:
function calcCompoundPath(
  targetInvestment: number,
  years: number,
  annualYieldPercent: number
): { savingsPerMonth: number; finalValue: number }
// FV = PMT × ((1+r)^n - 1) / r  (월 복리)
```

---

### 3.8 BinahMapLite

```typescript
interface BinahMapLiteProps {
  events: GeoEvent[];
  selectedId?: string | null;
  hoveredId?: string | null;
  onSelect?: (event: GeoEvent) => void;
  height?: number;              // 기본값 200px
}

// 의존 타입 (src/features/binah-map/types.ts)
interface GeoEvent {
  id: string;
  title: string;
  region: string;
  lat: number;
  lon: number;
  riskScore: number;            // 0~100
  affectedSectors: string[];
  eventType: 'trade' | 'conflict' | 'policy' | 'disaster';
  summary: string;
  sourceUrl?: string;
}

type ViewMode = 'flat' | '3d';
type Rotation = [number, number];  // [longitude, latitude]
```

---

## 4. 상태 관리 패턴

### 4.1 컴포넌트 로컬 상태 (useState)

각 컴포넌트는 독립적 로컬 상태를 관리하며 전역 스토어를 사용하지 않는다.

| 컴포넌트 | 상태 | 타입 | 초기값 |
|---------|------|------|--------|
| SideNav | user | `User \| null` | null |
| ValueChainView | selectedNode | `ValueChainNode \| null` | null |
| ValueChainView | isMobile | boolean | false |
| SVGMindMap | containerSize | number | 600 |
| SVGMindMap | isDark | boolean | false |
| SVGMindMap | tooltip | `TooltipState \| null` | null |
| SVGMindMap | hoveredId | `string \| null` | null |
| NewsImpactCard | isFavorite | boolean | false |
| NewsImpactCard | chartModal | `{code, name} \| null` | null |
| NewsImpactList | selectedSectors | `string[]` | [] |
| NewsImpactList | impactFilter | ImpactLevel | '전체' |
| PassiveIncomeCalculator | targetMonthly | number | 500_000 |
| PassiveIncomeCalculator | yieldPercent | number | 4 |
| PassiveIncomeCalculator | portfolioType | PortfolioType | 'dividend' |
| BinahMapLite | viewMode | ViewMode | 'flat' |
| BinahMapLite | flatZoom | `{tx, ty, scale}` | {0, 0, 1} |
| BinahMapLite | rotation | Rotation | [-127, -37] |
| BinahMapLite | notification | `GeoEvent \| null` | null |

### 4.2 Ref 기반 뮤터블 상태 (useRef)

성능이 중요한 드래그/애니메이션 로직은 setState 리렌더를 피하기 위해 ref를 사용한다.

| 컴포넌트 | ref | 용도 |
|---------|-----|------|
| SVGMindMap | containerRef | ResizeObserver 타겟 |
| BinahMapLite | rotRef | 드래그 중 최신 rotation 동기 참조 |
| BinahMapLite | dragRef | 드래그 시작점 / 이동 감지 |
| BinahMapLite | movedRef | 클릭 vs 드래그 구분 플래그 |
| BinahMapLite | animRef | requestAnimationFrame ID |
| BinahMapLite | notifTimer | 알림 자동 해제 타이머 |

### 4.3 파생 상태 (useMemo)

```typescript
// NewsImpactList — 섹터 × 영향도 복합 필터링
const filteredData = useMemo(() => {
  return data.filter((item) => {
    // 섹터 필터: 선택된 섹터가 affected_sectors와 부분 일치
    if (selectedSectors.length > 0) { ... }
    // 영향도 필터: 높음(≥67) / 중간(34~66) / 낮음(<34)
    if (impactFilter === '높음' && item.impact_score < 67) return false;
    ...
  });
}, [data, selectedSectors, impactFilter]);
```

### 4.4 퍼시스턴스 상태 (localStorage)

```typescript
// NewsImpactCard — 즐겨찾기 (key: 'fanen-news-favorites')
// Set<string> → JSON.stringify([...ids]) 직렬화
// 비동기 없음, 동기 읽기/쓰기 (SSR 안전 가드: typeof window !== 'undefined')
```

---

## 5. 반응형 브레이크포인트 전략 (mobile-first)

Tailwind CSS의 기본 브레이크포인트를 사용하며, **md(768px)** 가 핵심 분기점이다.

### 5.1 전역 레이아웃 분기

| 뷰포트 | 사이드바 | 하단 내비 | 메인 여백 |
|--------|---------|---------|---------|
| < 768px (mobile) | `hidden` | `block` (BottomNav) | `ml-0` |
| ≥ 768px (desktop) | `flex` (220px fixed) | `hidden` | `ml-[220px]` |

### 5.2 컴포넌트별 반응형 전략

**SideNav**
```
hidden md:flex flex-col fixed top-0 left-0 h-screen w-[220px]
```
- 모바일: 완전 숨김, BottomNav가 대체
- 데스크톱: fixed 사이드바

**ValueChainView — 뷰 전환**
```typescript
// JavaScript window.innerWidth 기반 분기 (CSS 브레이크포인트 아님)
const isMobile = window.innerWidth < 768;
// < 768px: TierList (계층형 리스트)
// ≥ 768px: SVGMindMap (원형 마인드맵)
```
- SVG 크기: ResizeObserver로 컨테이너 너비 감지, `Math.min(containerWidth, 700)` 상한 적용

**NewsImpactCard — 패널 레이아웃**
```
flex min-h-[7rem]
├── 좌측 색상 바: w-1 flex-shrink-0
├── 메인 콘텐츠: flex-1 (가로 공간 소비)
└── 우측 신호 패널: flex-shrink-0 w-20
```
- 모바일에서 w-20 우측 패널이 고정폭 유지 (flex-shrink-0)

**PassiveIncomeCalculator**
- 복리 경로 3개 카드: `space-y-2.5` 수직 스택, 별도 그리드 없음
- 슬라이더: `flex items-center gap-3`, 모바일도 동일 레이아웃

**BinahMapLite**
- SVG viewBox: `0 0 {w} {h}`, width는 ResizeObserver 동적 측정
- 3D 모드: `height + 28px` (조작 힌트 바 공간 확보)
- 토글 버튼: `absolute top-3 right-3` 오버레이

---

## 6. 애니메이션 스펙 (Framer Motion variants)

### 6.1 SideNav — 활성 인디케이터

```typescript
// layoutId 공유 애니메이션 — 메뉴 항목 간 위치 전환
<motion.span
  layoutId="sidenav-active"
  className="ml-auto w-1 h-4 rounded-full bg-teal-600 dark:bg-teal-400"
  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
/>
```

### 6.2 HubMenu — 반딧불이 레일 이동

```typescript
// 반디 무한 이동 애니메이션
animate={{
  x: ['-10%', '110%'],   // 레일 왼쪽에서 오른쪽으로
  y: [0, -6, 0, -4, 0, -7, 0],  // 불규칙 상하 부유
}}
transition={{
  x: { duration: 8, repeat: Infinity, ease: 'linear' },
  y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
}}

// 정류장 카드 hover
whileHover={{ scale: 1.05 }}
transition={{ type: 'spring', stiffness: 400, damping: 20 }}
```

### 6.3 ValueChainView — 마인드맵 등장 및 인터랙션

```typescript
// 엣지(연결선) 등장 — 티어별 순차 지연
initial={{ pathLength: 0, opacity: 0 }}
animate={{ pathLength: 1, opacity: 1 }}
transition={{
  pathLength: { duration: 0.6, delay: edge.tier * 0.2 },  // T0: 0ms, T1: 200ms, T2: 400ms
  opacity:    { duration: 0.3, delay: edge.tier * 0.2 },
}}

// 노드 등장 — tier × 0.25 + index × 0.04 stagger
initial={{ scale: 0, opacity: 0 }}
animate={{
  scale: isHovered ? 1.12 : 1,
  opacity: 1,
}}
transition={{
  scale:   { duration: 0.18 },
  opacity: { duration: 0.3, delay: tierDelay },
  default: { duration: 0.35, delay: tierDelay },
}}

// NodeTooltip 진입/이탈
initial={{ opacity: 0, scale: 0.9 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.9 }}
transition={{ duration: 0.15 }}

// CompanyCard 선택 패널 진입/이탈
initial={{ opacity: 0, y: 8 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: 8 }}
transition={{ duration: 0.2 }}
```

### 6.4 BinahMapLite — 지도 인터랙션

```typescript
// 평면 줌인 — CSS transform (Framer Motion animate prop)
<motion.g
  animate={!is3D
    ? { x: flatZoom.tx, y: flatZoom.ty, scale: flatZoom.scale }
    : { x: 0, y: 0, scale: 1 }
  }
  transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
/>

// 3D 스무스 회전 — 직접 rAF 구현 (easeInOutCubic)
const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
// ANIM_DURATION = 900ms

// 줌 리셋 버튼 진입/이탈
initial={{ opacity: 0, scale: 0.85 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.85 }}
transition={{ duration: 0.18 }}

// 클릭 알림 패널 진입/이탈
initial={{ opacity: 0, y: -12, scale: 0.96 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
exit={{ opacity: 0, y: -8, scale: 0.97 }}
transition={{ duration: 0.22, ease: 'easeOut' }}
// 자동 소멸: 3200ms 후 setNotification(null)
```

### 6.5 SVGMindMap — 마커 Pulse 애니메이션 (CSS)

```css
/* globals.css — BinahMapLite 마커 맥박 효과 */
.map-pulse-1 { animation: map-pulse-ring 2s ease-out infinite; }
.map-pulse-2 { animation: map-pulse-ring 2s ease-out 0.7s infinite; }

@keyframes map-pulse-ring {
  0%   { r: 6; opacity: 0.8; }
  100% { r: 18; opacity: 0; }
}
```

---

## 7. 디자인 시스템 토큰

### 7.1 색상 체계

```
배경
  zinc-50   (#FAFAFA) — 라이트 모드 기본 배경
  zinc-950  (#09090B) — 다크 모드 기본 배경

서피스
  white / zinc-900  — 카드, 패널 배경

테두리
  zinc-200 / zinc-800  — 기본 테두리

텍스트
  zinc-900 / zinc-100  — 기본 텍스트
  zinc-600 / zinc-400  — 보조 텍스트
  zinc-500 / zinc-500  — 힌트/캡션

Primary (브랜드)
  teal-600 (#0D9488)  — CTA, 활성 상태, 매수 신호
  teal-400            — 다크 모드 teal 대체

의미색 (데이터 신호 전용, 금융 의미 부여 컨텍스트에서만 사용)
  rose-500  (#F43F5E)  — 매도 / 위험 / 높은 리스크
  amber-400 (#FBBF24)  — 관망 / 주의 / 중간 리스크
  teal-500  (#14B8A6)  — 매수 / 안전 / 낮은 리스크
```

### 7.2 금지 색상

navy, blue-*, slate-* 계열은 이번 스프린트에서 코드베이스 전체에서 제거되었다.
신규 컴포넌트에서 이들 색상 사용 금지.

### 7.3 타이포그래피 계층

| 용도 | Tailwind 클래스 | 비고 |
|------|----------------|------|
| 헤드라인 | `text-base font-bold` | NewsImpactCard headline |
| 섹션 제목 | `text-sm font-semibold` | 필터 레이블 등 |
| 본문 | `text-sm` | AI 요약, 설명 |
| 보조 | `text-xs` | 메타 정보, 날짜 |
| 캡션 | `text-[10px]` / `text-[9px]` | 뱃지, 힌트 |
| 모노스페이스 | `font-mono` | 종목 코드 |

### 7.4 반경 / 그림자

```
rounded-lg    — 버튼, 인풋
rounded-xl    — 카드, 패널
rounded-2xl   — HubMenu 컨테이너
rounded-full  — 필터 칩, 배지

shadow-sm  — 카드 기본
shadow-lg  — 모달, 툴팁
```

---

## 8. 접근성 고려사항 (WCAG 2.1 AA)

### 8.1 구현된 접근성 속성

| 컴포넌트 | 접근성 처리 |
|---------|-----------|
| SideNav | `<aside>` 시맨틱 태그, `<nav>` 내비게이션 랜드마크 |
| ValueChainView SVG | `aria-label="수혜 기업 연결망 마인드맵"` |
| NewsImpactCard | `<article>` 시맨틱 태그, 즐겨찾기 버튼 `aria-label` (즐겨찾기 추가/해제) |
| StockChartModal | 닫기 버튼 `aria-label="닫기"`, ESC 키 핸들러 |
| BinahMapLite | 토글 버튼 `title="지도 축소"` |
| PassiveIncomeCalculator | `<label>` 요소로 input 연결 |
| PortfolioStyleFilter | `type="button"` 명시 |

### 8.2 키보드 내비게이션

- `StockChartModal`: `document.addEventListener('keydown')` 로 ESC 키 닫기 지원
- SideNav 메뉴 항목: `<Link>` 태그로 네이티브 포커스 관리
- 모든 인터랙티브 요소: `type="button"` 명시로 기본 submit 동작 방지

### 8.3 색상 대비

- 텍스트: zinc-700(라이트) / zinc-300(다크) — 배경 대비 4.5:1 이상
- 시그널 색상은 텍스트 + 진행 바 + 컬러 바 등 다중 채널로 전달 (색맹 대응)
- 다크모드: MutationObserver로 `document.documentElement.classList` 감지

### 8.4 미비 항목 (개선 필요)

| 항목 | 현황 | 권장 처리 |
|------|------|---------|
| SVGMindMap 노드 키보드 탐색 | 마우스 전용 | `tabIndex`, `onKeyDown` Enter/Space 추가 |
| BinahMapLite 마커 접근성 | `aria-label` 미적용 | `<title>` 요소 또는 `aria-label` 추가 |
| NewsImpactList 필터 상태 알림 | 미구현 | `aria-live="polite"` 결과 수 변경 공지 |
| HubMenu 반딧불이 | `aria-hidden="true"` 미적용 | 장식 요소 hidden 처리 |

---

## 9. 성능 고려사항

### 9.1 메모이제이션

```typescript
// BinahMapLite — 이벤트 핸들러 useCallback
const handleMarkerClick = useCallback((event, mx, my) => { ... }, [viewMode, ...]);
const animateTo = useCallback((target) => { ... }, [setRot]);

// NewsImpactCard — 즐겨찾기 토글 useCallback
const toggleFavorite = useCallback(() => { ... }, [item.id]);

// ValueChainView — 마우스 이벤트 useCallback
const handleMouseEnter = useCallback((e, node) => { ... }, []);
const handleMouseLeave = useCallback(() => { ... }, []);
```

### 9.2 SVG 렌더링 최적화

- `buildMindMapLayout` 은 순수 함수로 체인이 변경되지 않는 한 재계산 없음
- SVG `pathLength` 애니메이션: GPU 합성 레이어 활용 (transform/opacity 기반)
- D3 경로 계산: SVG 렌더 사이클 외부에서 동기 계산

### 9.3 외부 리소스

- BinahMapLite: `/public/world-110m.json` 초기 1회 fetch, 이후 메모리 보관
- StockChartModal: 모달 열릴 때마다 Railway API 호출 (`/api/krx/stock?code=`)

---

## 10. 파일 저장 경로 및 export 규칙

| 파일 경로 | export 방식 |
|-----------|-----------|
| `src/components/common/SideNav.tsx` | `export default SideNav` |
| `src/features/dashboard/components/HubMenu.tsx` | `export function HubMenu` |
| `src/features/value-chain/components/ValueChainView.tsx` | `export function ValueChainView` |
| `src/features/news-impact/components/NewsImpactCard.tsx` | `export default NewsImpactCard` |
| `src/features/news-impact/components/NewsImpactList.tsx` | `export default NewsImpactList` |
| `src/features/portfolio/components/PortfolioStyleFilter.tsx` | `export default PortfolioStyleFilter` |
| `src/features/dividend/components/PassiveIncomeCalculator.tsx` | `export default PassiveIncomeCalculator` |
| `src/features/binah-map/components/BinahMapLite.tsx` | `export function BinahMapLite` |

모든 컴포넌트: `'use client'` 지시어 적용 (브라우저 API, 이벤트 핸들러, React 훅 사용)

---

## 11. 의존성 외부 라이브러리

| 라이브러리 | 용도 | 컴포넌트 |
|-----------|------|---------|
| framer-motion | 애니메이션 | SideNav, HubMenu, ValueChainView, BinahMapLite |
| d3 | 지리 투영 / 경로 생성 | BinahMapLite |
| topojson-client | GeoJSON 변환 | BinahMapLite |
| next/navigation | usePathname, useRouter | SideNav |
| @supabase/supabase-js | 인증 상태 | SideNav |

---

## 12. 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|---------|
| v0.0.1 | 2026-03-26 | 초안 작성 — Sprint 10 구현 완료 8개 컴포넌트 문서화 |
