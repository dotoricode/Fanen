# BINAH (비나) — Design Document

> 작성일: 2026-03-25
> Plan 참조: docs/01-plan/features/binah.plan.md
> PRD 참조: docs/00-pm/binah.prd.md
> 설계 범위: Sprint 10 (브랜드 전환 + 완전 무료화 + 홈 개편 + 비나 맵 기본형)
> 반디 캐릭터 참조: Bandi.png (황금빛 발광 구체, 심플한 눈코입, 오라 효과)

---

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 파낸(Fanen)은 핵심 가치(불로소득 발굴)가 유료 잠금 뒤에 숨겨져 있고 브랜드 정체성이 혼재. BINAH는 완전 무료 + 반디 캐릭터 중심의 명확한 정체성으로 재출발 |
| **WHO** | 20~60대 전 연령 불로소득/노후 대비 수요자. Beachhead: 40~55세 배당 관심 직장인 |
| **RISK** | (1) 기존 파낸/핀이 브랜드 잔존 텍스트 누락 (2) SubscriptionGate 제거 시 로직 정리 미흡 (3) D3 비나 맵 세계 지도 구현 복잡도 (4) 반디 SVG 5 mood 구현 완성도 |
| **SUCCESS** | 브랜드 텍스트 "파낸/핀이/Fanen/FinAI" 0건, 모든 페이지 무료 접근, 반디 5 mood 정상 표시, TypeScript 오류 0 |
| **SCOPE** | Sprint 10 전체 (M1 브랜드교체 + M2 무료화 + M3 홈개편 + 비나 맵 기본형) |

---

## 1. Overview

### 1.1 설계 목표

파낸(Fanen) → BINAH(비나) 브랜드 전환을 기술적으로 실행하는 Sprint 10 전체 설계.

**핵심 변경 3가지:**
1. **비주얼**: Blue→Teal 컬러 전환 + 반디 SVG 캐릭터 (황금빛 발광 구체)
2. **접근성**: SubscriptionGate 전면 제거 → 완전 무료 플랫폼
3. **홈**: 반디 모닝 브리핑 + 비나 맵 Lite로 랜딩 개편

### 1.2 아키텍처 선택

**Option C — Pragmatic Balance (선택)**

| | Option A (최소 변경) | Option B (완전 분리) | Option C (균형) |
|-|---------------------|---------------------|-----------------|
| 접근 | 텍스트만 교체, 구조 유지 | 새 feature 폴더 전부 신규 | 핵심 구조 유지 + 신규 feature 분리 |
| 장점 | 빠름, 안전 | 코드 깔끔 | 속도 + 유지보수 균형 |
| 단점 | 기술부채 잔존 | 리팩토링 범위 과다 | 중간 복잡도 |
| 권장 | ❌ | ❌ | ✅ |

**선택 이유**: 기존 Sprint 1~9 코드베이스(Auth, 뉴스, 섹터맵, 포트폴리오)는 최대한 유지하면서 브랜드 변경 파일과 신규 feature(binah-map)를 명확히 분리.

---

## 2. 컬러 시스템 설계

### 2.1 토큰 정의

| 토큰 | 기존 파낸 | BINAH | 용도 |
|------|---------|-------|------|
| `--color-primary` | `#1A56DB` | `#0D9488` | 주요 버튼, 링크, 포커스 링 |
| `--accent` | `#2563EB` | `#0D9488` | CSS 변수 accent |
| `--accent-dark` | `#60A5FA` | `#2DD4BF` | 다크모드 accent |
| `--bandi-glow` | (없음) | `#FDE68A` | 반디 발광색 (황금빛) |
| `--bandi-lime` | (없음) | `#A3E635` | 반디 몸체 Lime |
| `--bg-primary-dark` | `#0F172A` | `#0F1923` | 다크모드 배경 (Deep Navy) |
| `--bg-card-dark` | `#1E293B` | `#162032` | 다크모드 카드 |

### 2.2 `globals.css` 변경 사양

```css
/* BINAH 브랜드 CSS 변수 */
:root {
  --color-primary: #0D9488;    /* Teal — 기존 #1A56DB */
  --color-secondary: #A3E635;  /* Lime accent — 신규 */
  --color-danger: #E02424;     /* 유지 */
  --color-background: #ffffff;
  --color-foreground: #171717;

  /* 반디 캐릭터 색상 */
  --bandi-glow: #FDE68A;       /* 황금빛 발광 */
  --bandi-body: #FCD34D;       /* 몸체 황금 */
  --bandi-lime: #A3E635;       /* 가슴 Lime */
  --bandi-aura: rgba(253, 230, 138, 0.3); /* 오라 */
}

/* 라이트모드 변수 */
:root {
  --bg-primary: #F9FAFB;
  --bg-card: #FFFFFF;
  --bg-nav: #FFFFFF;
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --border-color: #E5E7EB;
  --accent: #0D9488;           /* Teal */
}

/* 다크모드 변수 */
.dark {
  --bg-primary: #0F1923;       /* Deep Navy — 기존 #0F172A */
  --bg-card: #162032;          /* 기존 #1E293B */
  --bg-nav: #162032;
  --text-primary: #F1F5F9;
  --text-secondary: #94A3B8;
  --border-color: #1E3448;
  --accent: #2DD4BF;           /* Teal 밝은 버전 */
}
```

### 2.3 `tailwind.config.ts` 변경 사양

```typescript
colors: {
  primary: {
    DEFAULT: '#0D9488',   // Teal
    50:  '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#0D9488',
    600: '#0F766E',
    700: '#115E59',
    800: '#134E4A',
    900: '#042F2E',
  },
  bandi: {
    glow:  '#FDE68A',  // 황금빛 발광
    body:  '#FCD34D',  // 몸체
    lime:  '#A3E635',  // 가슴 Lime
    aura:  '#FEF3C7',  // 배경 오라
  },
  // secondary, danger 유지
}
```

---

## 3. 반디 (Bandi) SVG 캐릭터 설계

### 3.1 이미지 분석 (Bandi.png)

제공된 이미지를 기반으로 SVG 설계:
- **형태**: 완벽한 원형 발광 구체 (원형 gradient)
- **색상**: 황금빛 노랑 → 레몬 옐로우 (radial gradient)
- **눈**: 흰 원 + 검은 동공, 귀엽고 단순한 스타일
- **입**: 작고 단순한 선형 입 (기본 상태: 약간 벌린 'ㅡ' 형태)
- **오라**: 구체 주변을 흐르는 황금빛 발광 파티클/곡선
- **그림자**: 아래에 황금빛 그림자 (reflection)

### 3.2 `BandiAvatar.tsx` 컴포넌트 사양

**파일**: `src/features/ai-coach/components/BandiAvatar.tsx`

```typescript
interface BandiAvatarProps {
  mood?: 'default' | 'happy' | 'thinking' | 'excited' | 'glowing';
  size?: number;        // px, 기본값 80
  animate?: boolean;   // pulse 애니메이션 여부
  className?: string;
}
```

**5 Mood 상세:**

| Mood | 눈 | 입 | 오라 | 사용 시점 |
|------|-----|-----|------|----------|
| `default` | 동그란 눈 (보통) | 작은 수평선 | 부드러운 glow | 기본 대기 상태 |
| `happy` | 반달 눈 (눈웃음) | 살짝 벌린 U형 미소 | 밝은 glow | 긍정 응답, 환영 |
| `thinking` | 한쪽 눈 살짝 좁아짐 | 작은 o형 | 흐릿한 glow | 분석 중, 로딩 |
| `excited` | 크게 뜬 눈 | 활짝 벌린 입 | 강한 pulse | 기회 발견, 경고 |
| `glowing` | 반짝이는 눈 (★) | 미소 | 전체 발광 최대 | 최고 기회 발굴 |

**SVG 핵심 구조:**

```svg
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- 외부 오라 (glow ring) -->
  <circle cx="50" cy="50" r="46" fill="rgba(253,230,138,0.2)" />
  <circle cx="50" cy="50" r="42" fill="rgba(253,230,138,0.3)" />

  <!-- 몸체 (radial gradient) -->
  <defs>
    <radialGradient id="bandiBody" cx="40%" cy="35%">
      <stop offset="0%" stopColor="#FEF9C3" />  <!-- 밝은 중심 -->
      <stop offset="50%" stopColor="#FCD34D" />  <!-- 황금빛 -->
      <stop offset="100%" stopColor="#D97706" /> <!-- 외곽 어두움 -->
    </radialGradient>
  </defs>
  <circle cx="50" cy="50" r="40" fill="url(#bandiBody)" />

  <!-- 눈 (mood에 따라 변경) -->
  <!-- 왼쪽 눈 -->
  <circle cx="36" cy="44" r="7" fill="white" />
  <circle cx="37" cy="45" r="4" fill="#1C1917" />
  <!-- 오른쪽 눈 -->
  <circle cx="64" cy="44" r="7" fill="white" />
  <circle cx="65" cy="45" r="4" fill="#1C1917" />

  <!-- 입 (mood에 따라 변경) -->
  <!-- default: 작은 수평선 -->
  <rect x="44" y="60" width="12" height="3" rx="1.5" fill="#92400E" />

  <!-- 아래 그림자/reflection -->
  <ellipse cx="50" cy="95" rx="25" ry="5"
    fill="rgba(253,230,138,0.4)" />
</svg>
```

### 3.3 애니메이션 정의

```css
/* 기본 pulse (부드러운 숨쉬기) */
@keyframes bandiBreath {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 8px rgba(253,230,138,0.6)); }
  50%       { transform: scale(1.04); filter: drop-shadow(0 0 16px rgba(253,230,138,0.9)); }
}

/* glowing mode (기회 발견 시 강한 발광) */
@keyframes bandiGlow {
  0%, 100% { filter: drop-shadow(0 0 12px rgba(253,230,138,0.8)) drop-shadow(0 0 24px rgba(163,230,53,0.4)); }
  50%       { filter: drop-shadow(0 0 24px rgba(253,230,138,1)) drop-shadow(0 0 48px rgba(163,230,53,0.7)); }
}

/* thinking (느린 회전 오라) */
@keyframes bandiThink {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
```

---

## 4. 완전 무료화 설계 (SubscriptionGate 제거)

### 4.1 제거 전략

**원칙**: SubscriptionGate 컴포넌트 자체는 유지 (다른 프로젝트 참조 가능성), 각 페이지에서만 제거.

**제거 대상 파일 목록:**

| 파일 | 변경 내용 |
|------|---------|
| `src/app/news/page.tsx` | `<SubscriptionGate>` wrapper 제거, 내부 컨텐츠 직접 렌더링 |
| `src/app/sector/page.tsx` | 동일 |
| `src/app/global-news/page.tsx` | 동일 |
| `src/app/coach/page.tsx` | 동일 |
| `src/app/journal/page.tsx` | 동일 |
| `src/app/dividend/page.tsx` | 동일 |
| `src/features/news-impact/components/NewsImpactList.tsx` | `useSubscription` 제거, plan 체크 로직 제거 |

### 4.2 `lib/plans.ts` 단순화

```typescript
// 기존: Free / Pro / Premium 3단계
// 변경: 단일 플랜 (BINAH는 완전 무료)

export type PlanTier = 'free';   // 단일 플랜

export const PLANS = {
  free: {
    name: 'BINAH',
    price: 0,
    features: ['모든 기능 무제한 무료'],
  },
} as const;

// checkSubscription은 항상 true 반환 (무료화)
export function checkSubscription(_: unknown): true {
  return true;
}
```

### 4.3 `pricing/page.tsx` 개편

기존 가격 플랜 UI → "BINAH는 완전 무료입니다" 페이지:

```
┌─────────────────────────────────┐
│  반디 캐릭터 (glowing mood)      │
│  BINAH는 완전 무료입니다 🎉      │
│                                 │
│  ✅ 뉴스 분석 — 무제한           │
│  ✅ 비나 맵 — 무제한             │
│  ✅ Value Chain 분석 — 무제한    │
│  ✅ 반디 AI 코치 — 무제한        │
│  ✅ 불로소득 계산기 — 무제한     │
│                                 │
│  [시작하기 →]                   │
└─────────────────────────────────┘
```

### 4.4 Header.tsx 플랜 뱃지 제거

```typescript
// 기존: PlanBadge 컴포넌트 (Free/Pro/Premium 표시)
// 변경: PlanBadge 제거, 로고/네비게이션만 유지
// PlanBadge 컴포넌트 자체는 유지 (import만 제거)
```

---

## 5. 브랜드 텍스트 변경 설계

### 5.1 변경 파일별 상세

#### `src/app/layout.tsx`

```typescript
// 기존
export const metadata: Metadata = {
  title: '파낸 | 뉴스가 시장을 움직일 때',
  description: '세상이 움직이면, 파낸이 먼저 압니다.',
};

// 변경
export const metadata: Metadata = {
  title: 'BINAH | 반디가 찾은 오늘의 기회',
  description: '반디가 찾은 오늘의 기회, 당신의 내일이 빛나도록',
  keywords: ['투자', '불로소득', '배당', 'AI', 'BINAH', '비나'],
};
```

#### `src/components/common/Header.tsx`

```typescript
// 기존 로고 영역
<Link href="/" className="text-xl font-bold text-primary-500">파낸</Link>

// 변경 — BINAH 로고 (텍스트 기반, 추후 SVG 로고 교체 가능)
<Link href="/" className="flex items-center gap-2">
  <span className="text-xl font-black tracking-tight text-teal-600 dark:text-teal-400">
    BINAH
  </span>
  <span className="text-xs text-gray-500 dark:text-slate-400 hidden sm:block">비나</span>
</Link>
```

**Nav 메뉴 변경:**

| 기존 | 변경 |
|------|------|
| 뉴스 분석 | 뉴스 분석 (유지) |
| 섹터 맵 | 섹터 맵 (유지) |
| 포트폴리오 | 포트폴리오 (유지) |
| 배당 캘린더 | 배당 허브 |
| 모의투자 | 모의투자 (유지) |
| AI 코치 | 반디 코치 |
| _(신규)_ | 비나 맵 |

#### `src/features/landing/LandingPage.tsx`

```typescript
// Hero 섹션 변경
// 기존: "세상이 움직이면, 파낸이 먼저 압니다"
// 변경:
<h1>반디가 찾은 오늘의 기회,</h1>
<h1>당신의 내일이 빛나도록</h1>
<p>AI 어시스턴트 반디가 글로벌 정세에서 수혜 기업을 자동 발굴합니다.</p>
<p>완전 무료. 가입만 하면 모든 기능을 바로 사용하세요.</p>
```

#### `src/features/ai-coach/components/FinniAvatar.tsx` → `BandiAvatar.tsx`

파일명 변경 + 내용 전면 재작성 (Section 3 참조).

---

## 6. 홈 화면 개편 설계

### 6.1 새 홈 레이아웃

```
[로그인 O] DashboardHome 렌더링
[로그인 X] LandingPage 렌더링 (기존 유지, 브랜드 텍스트만 변경)
```

**DashboardHome 새 구조:**

```
┌─────────────────────────────────────────┐
│ 반디의 오늘 브리핑  ☀️                   │
│ ┌─────────────────────────────────────┐ │
│ │ [반디 SVG — happy mood]             │ │
│ │ "안녕하세요! 오늘 반디가 세계를      │ │
│ │  둘러봤어요. 방산 섹터에 기회가      │ │
│ │  감지됐어요! 비나 맵에서 확인        │ │
│ │  해볼까요? →"                       │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ 비나 맵 (Lite)                          │
│ [세계 지도 간략형 — Hot Zone 표시]       │
│ [자세히 보기 →]                         │
├─────────────────────────────────────────┤
│ 오늘의 수혜 섹터 Top 3                  │
│ 🟢 방산 +2.3%  🟡 에너지 +0.8%        │
│ 🔵 반도체 +1.1%                        │
└─────────────────────────────────────────┘
```

### 6.2 `MorningBriefCard` 컴포넌트 (신규)

**파일**: `src/features/dashboard/components/MorningBriefCard.tsx`

```typescript
interface MorningBriefProps {
  date: string;          // "2026-03-25"
  headline: string;      // "오늘 미국이 관세를 발표했어요!"
  opportunity: string;   // "방산·에너지 섹터에 기회가 있을 것 같아요."
  ctaLabel: string;      // "비나 맵에서 확인하기"
  ctaHref: string;       // "/binah-map"
  mood?: BandiMood;      // 반디 mood
}
```

**Mock 데이터 소스**: `src/lib/mock/mockMorningLight.ts`

```typescript
export const mockMorningLight = {
  date: '2026-03-25',
  headline: '미국이 중국산 철강에 25% 관세를 부과한다고 발표했어요.',
  opportunity: '국내 철강 대체 수요가 늘 수 있어요. 포스코·현대제철이 주목받고 있어요.',
  sectors: ['철강', '방산', '에너지'],
  mood: 'excited' as BandiMood,
  ctaLabel: '비나 맵에서 확인하기',
  ctaHref: '/binah-map',
};
```

### 6.3 `SectorTop3Card` 컴포넌트 (신규)

**파일**: `src/features/dashboard/components/SectorTop3Card.tsx`

```typescript
interface SectorTop3Item {
  name: string;
  change: number;     // +2.3 / -0.5
  signal: 'green' | 'yellow' | 'red';
}

interface SectorTop3Props {
  sectors: SectorTop3Item[];
}
```

---

## 7. 비나 맵 기본형 설계

### 7.1 기술 스택

- `d3` v7 (세계 지도 geo projection)
- `topojson-client` v3 (world-110m.json)
- `d3-geo` (geoNaturalEarth1 projection)

**패키지 추가:**
```bash
npm install d3 topojson-client
npm install -D @types/d3 @types/topojson-client
```

### 7.2 컴포넌트 구조

```
src/features/binah-map/
├── components/
│   ├── BinahMapLite.tsx      # 홈용 미니 지도 (600×300px)
│   └── BinahMapFull.tsx      # 전체 페이지 지도 (반응형)
├── hooks/
│   └── useBinahMap.ts        # 데이터 로딩 + 상태 관리
└── types.ts
```

### 7.3 타입 정의

```typescript
// src/features/binah-map/types.ts

/** 지정학적 이벤트 포인트 */
export interface GeoEvent {
  id: string;
  lat: number;
  lng: number;
  country: string;       // "미국", "중국"
  title: string;         // "관세 25% 부과"
  riskScore: number;     // 0~100 (빛 강도)
  affectedSectors: string[];
  publishedAt: string;
  type: 'trade' | 'military' | 'policy' | 'economic';
}

/** 비나 맵 상태 */
export interface BinahMapState {
  events: GeoEvent[];
  selectedEvent: GeoEvent | null;
  loading: boolean;
  error: string | null;
}
```

### 7.4 `BinahMapLite.tsx` 핵심 구조

```typescript
'use client';

/**
 * BinahMapLite — 홈 화면용 축소 비나 맵
 * D3 + TopoJSON으로 세계 지도 렌더링 + 이벤트 마커
 */
export default function BinahMapLite() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { events } = useBinahMap();

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 600, height = 280;
    const svg = d3.select(svgRef.current);

    // 투영: Natural Earth
    const projection = d3.geoNaturalEarth1()
      .scale(90)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // 세계 지도 (world-110m.json)
    // land 레이어: Deep Navy 계열
    svg.selectAll('path.land')
      .data(topojson.feature(world, world.objects.countries).features)
      .join('path')
      .attr('class', 'land')
      .attr('d', path)
      .attr('fill', '#1E3A5F')         // 다크 네이비 (땅)
      .attr('stroke', '#0F2744')       // 경계선

    // 이벤트 마커 (glow circle)
    svg.selectAll('circle.event')
      .data(events)
      .join('circle')
      .attr('class', 'event')
      .attr('cx', d => projection([d.lng, d.lat])![0])
      .attr('cy', d => projection([d.lng, d.lat])![1])
      .attr('r', d => 4 + (d.riskScore / 100) * 12)  // riskScore → 크기
      .attr('fill', 'rgba(253,230,138,0.6)')           // 황금빛
      .attr('stroke', '#FCD34D')
  }, [events]);

  return (
    <div className="rounded-xl bg-slate-900 dark:bg-[#0F1923] overflow-hidden">
      <svg ref={svgRef} viewBox="0 0 600 280" className="w-full" />
    </div>
  );
}
```

### 7.5 Mock 데이터 (`mockBinahMap.ts`)

```typescript
// src/lib/mock/mockBinahMap.ts
export const mockGeoEvents: GeoEvent[] = [
  {
    id: 'evt-001',
    lat: 38.9, lng: -77.0,    // 미국 워싱턴 D.C.
    country: '미국',
    title: '중국산 철강 25% 관세 부과',
    riskScore: 85,
    affectedSectors: ['철강', '방산', '에너지'],
    type: 'trade',
    publishedAt: '2026-03-25',
  },
  {
    id: 'evt-002',
    lat: 39.9, lng: 116.4,    // 중국 베이징
    country: '중국',
    title: '반도체 수출 규제 강화',
    riskScore: 70,
    affectedSectors: ['반도체', 'IT'],
    type: 'policy',
    publishedAt: '2026-03-25',
  },
  {
    id: 'evt-003',
    lat: 55.7, lng: 37.6,     // 러시아 모스크바
    country: '러시아',
    title: '에너지 수출 제한 검토',
    riskScore: 60,
    affectedSectors: ['에너지', '전력'],
    type: 'economic',
    publishedAt: '2026-03-24',
  },
  {
    id: 'evt-004',
    lat: 35.6, lng: 139.7,    // 일본 도쿄
    country: '일본',
    title: '반도체 장비 수출 협력 확대',
    riskScore: 40,
    affectedSectors: ['반도체', '2차전지'],
    type: 'trade',
    publishedAt: '2026-03-24',
  },
];
```

### 7.6 비나 맵 전체 페이지 (`/binah-map`)

```
src/app/binah-map/page.tsx

레이아웃:
┌─────────────────────────────────────┐
│  BINAH 맵  [반디 — thinking mood]   │
│  "세계의 기회를 탐색하고 있어요..."  │
├────────────────────────────────────-┤
│  [BinahMapFull — 반응형 지도]       │
│  이벤트 마커 클릭 → 슬라이드 패널   │
├─────────────────────────────────────┤
│  이벤트 목록 (카드 형태)            │
│  □ 미국 관세 — 방산/철강 🟢         │
│  □ 중국 규제 — 반도체 🟡            │
└─────────────────────────────────────┘

DisclaimerBanner 필수 포함
AiBadge 필수 포함 (분석 결과)
```

---

## 8. 파일별 상세 변경 명세

### 8.1 신규 생성 파일 (Sprint 10)

| 파일 | 역할 | 우선순위 |
|------|------|---------|
| `src/features/ai-coach/components/BandiAvatar.tsx` | 반디 SVG + 5 mood | P0 |
| `src/features/binah-map/types.ts` | GeoEvent, BinahMapState 타입 | P0 |
| `src/features/binah-map/hooks/useBinahMap.ts` | 이벤트 데이터 로딩 | P0 |
| `src/features/binah-map/components/BinahMapLite.tsx` | 홈 미니 지도 | P0 |
| `src/features/binah-map/components/BinahMapFull.tsx` | 전체 페이지 지도 | P0 |
| `src/features/dashboard/components/MorningBriefCard.tsx` | 반디 브리핑 카드 | P0 |
| `src/features/dashboard/components/SectorTop3Card.tsx` | 수혜 섹터 Top 3 | P0 |
| `src/lib/mock/mockBinahMap.ts` | 비나 맵 Mock 데이터 | P0 |
| `src/lib/mock/mockMorningLight.ts` | 모닝 브리핑 Mock 데이터 | P0 |
| `src/app/binah-map/page.tsx` | 비나 맵 전체 페이지 | P0 |

### 8.2 수정 파일 (Sprint 10)

| 파일 | 변경 내용 |
|------|---------|
| `src/app/globals.css` | 컬러 변수 전환 (Teal + Bandi tokens) |
| `tailwind.config.ts` | primary 색상 Teal 교체 + bandi 색상 추가 |
| `src/app/layout.tsx` | 메타데이터 BINAH로 변경 |
| `src/app/page.tsx` | DashboardHome에 MorningBriefCard + BinahMapLite 추가 |
| `src/features/landing/LandingPage.tsx` | 슬로건/브랜드명 변경 |
| `src/components/common/Header.tsx` | BINAH 로고 + PlanBadge 제거 + 네비 메뉴 업데이트 |
| `src/app/pricing/page.tsx` | 완전 무료 안내 페이지로 전환 |
| `src/lib/plans.ts` | 단일 플랜 단순화 |
| `src/app/news/page.tsx` | SubscriptionGate 제거 |
| `src/app/sector/page.tsx` | SubscriptionGate 제거 |
| `src/app/global-news/page.tsx` | SubscriptionGate 제거 |
| `src/app/coach/page.tsx` | SubscriptionGate 제거 |
| `src/app/journal/page.tsx` | SubscriptionGate 제거 |
| `src/app/dividend/page.tsx` | SubscriptionGate 제거 |
| `src/features/news-impact/components/NewsImpactList.tsx` | useSubscription 제거 |
| `src/features/dashboard/DashboardHome.tsx` | 새 홈 레이아웃 |

---

## 9. 구현 순서 (Session Guide)

### Module 1 — 컬러 + 브랜드 텍스트 (Day 1)
1. `globals.css` CSS 변수 교체
2. `tailwind.config.ts` primary→Teal + bandi 색상 추가
3. `layout.tsx` 메타데이터 변경
4. `Header.tsx` 로고/PlanBadge/네비 변경
5. `LandingPage.tsx` 슬로건/브랜드명 변경

### Module 2 — 반디 SVG 캐릭터 (Day 1~2)
6. `BandiAvatar.tsx` 신규 생성 (5 mood SVG + 애니메이션)

### Module 3 — 완전 무료화 (Day 2)
7. `plans.ts` 단일 플랜 단순화
8. 7개 페이지 SubscriptionGate 제거
9. `NewsImpactList.tsx` useSubscription 제거
10. `pricing/page.tsx` 완전 무료 안내 페이지

### Module 4 — 비나 맵 + 홈 개편 (Day 3)
11. `mockBinahMap.ts`, `mockMorningLight.ts` Mock 데이터 생성
12. `binah-map/types.ts` + `useBinahMap.ts`
13. `BinahMapLite.tsx` (홈용)
14. `BinahMapFull.tsx` + `/binah-map/page.tsx`
15. `MorningBriefCard.tsx` + `SectorTop3Card.tsx`
16. `DashboardHome.tsx` 레이아웃 개편
17. `page.tsx` (홈) 통합

---

## 10. 성공 기준 검증

| 기준 | 검증 방법 |
|------|---------|
| 브랜드 잔존 0건 | `grep -r "파낸\|핀이\|Fanen\|FinAI" src/` = 0 |
| TypeScript 오류 0 | `npx tsc --noEmit` 통과 |
| 모든 기능 무료 접근 | 비로그인/free 계정으로 전체 페이지 접근 확인 |
| 반디 5 mood | Storybook 또는 직접 확인 |
| 비나 맵 렌더링 | `/binah-map` 접속 시 세계 지도 + 마커 표시 |
| 다크모드 정상 | Teal 컬러 + Deep Navy 배경 확인 |
| DisclaimerBanner | 분석 페이지 + 비나 맵 페이지 포함 확인 |

---

## 11. CLAUDE.md 원칙 준수

### 11.1 데이터 레지던시
- 비나 맵: Mock 데이터 기반 → Sprint 12에서 Railway FastAPI 연동
- GeoEvent 데이터는 Vercel Route Handler에서 처리 가능 (비민감 공개 정보)

### 11.2 AI 환각 방지
- Mock 데이터의 기업명은 실제 상장 종목 티커 사용
- 모든 분석 결과에 `<AiBadge />` 표시
- 비나 맵 이벤트 → 수혜 섹터 연결은 "BINAH AI 분석" 출처 명시

### 11.3 면책 고지
- `/binah-map/page.tsx` — `<DisclaimerBanner />` 필수
- `BandiChartSignal` (Sprint 11) — `<DisclaimerBanner variant="signal" />` 예정

### 11.4 RLS
- 신규 테이블 없음 (Sprint 10은 프론트엔드 전용)
- Sprint 12 백엔드 연동 시 RLS 정책 별도 설계 예정
