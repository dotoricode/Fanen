# fanen-sprint9 Design Document

> 작성일: 2026-03-24
> Plan 참조: docs/01-plan/features/fanen-sprint9.plan.md

---

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 핀이 완성도 + 다크모드 + Pro 잠금해제(개발) + 고령층 접근성 + 글로벌 뉴스 분석 |
| **WHO** | 20~60대 일반 투자자 + 확대: 60대+ 고령층 |
| **RISK** | dark: 클래스 누락, zoom/senior 모드 충돌, 글로벌 뉴스 Mock 타입 불일치 |
| **SUCCESS** | 다크모드 전환 정상, Pro 기능 DEV 플래그로 열림, 글로벌뉴스→종목 흐름 완성 |
| **SCOPE** | 프론트 전용, Mock-first 유지 |

---

## S9-M1: 핀이 (Finni) 캐릭터 리디자인

### 디자인 사양

```
현재 핀이 (기존):                새 핀이 (귀여운 버전):
- 단순 직사각형 몸통             - 더 둥근 몸통 (rx="16")
- 작은 원형 눈 2개               - 큰 눈 + 하이라이트 점 (반짝이)
- 직선 입                        - 곡선 미소 + 볼터치 (핑크)
- 단색 파랑                      - 파랑 그라데이션 + 그림자
- 단일 상태                      - 4가지 감정 상태
```

### FinniAvatar 컴포넌트 설계

```typescript
// src/features/ai-coach/components/FinniAvatar.tsx
interface FinniAvatarProps {
  size?: number;
  mood?: 'default' | 'happy' | 'thinking' | 'excited';
}

// mood별 눈/입 변형:
// default: 정상 눈 + 미소
// happy: 초승달 눈(^_^) + 큰 미소
// thinking: 한쪽 눈 찡긋 + 말풍선 점 3개
// excited: 별 눈(★) + 활짝 웃음
```

### SVG 구조 (새 핀이)

```svg
<svg viewBox="0 0 64 64">
  <!-- 그림자 -->
  <ellipse cx="32" cy="60" rx="18" ry="4" fill="rgba(0,0,0,0.1)"/>

  <!-- 몸통 (둥글게) -->
  <rect x="8" y="18" width="48" height="38" rx="16" fill="url(#bodyGrad)"/>

  <!-- 그라데이션 정의 -->
  <defs>
    <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#60A5FA"/>
      <stop offset="100%" stop-color="#2563EB"/>
    </linearGradient>
  </defs>

  <!-- 배꼽 (귀여운 포인트) -->
  <circle cx="32" cy="48" r="3" fill="rgba(255,255,255,0.3)"/>

  <!-- 눈 (크고 귀엽게) -->
  <circle cx="22" cy="32" r="7" fill="white"/>
  <circle cx="42" cy="32" r="7" fill="white"/>
  <!-- 눈동자 -->
  <circle cx="23" cy="33" r="4" fill="#1D4ED8"/>
  <circle cx="43" cy="33" r="4" fill="#1D4ED8"/>
  <!-- 하이라이트 (반짝이) -->
  <circle cx="25" cy="31" r="1.5" fill="white"/>
  <circle cx="45" cy="31" r="1.5" fill="white"/>

  <!-- 볼터치 (핑크) -->
  <ellipse cx="15" cy="38" rx="5" ry="3" fill="rgba(251,113,133,0.4)"/>
  <ellipse cx="49" cy="38" rx="5" ry="3" fill="rgba(251,113,133,0.4)"/>

  <!-- 입 (미소) -->
  <path d="M24 44 Q32 50 40 44" stroke="white" stroke-width="2.5"
        stroke-linecap="round" fill="none"/>

  <!-- 안테나 -->
  <rect x="29" y="6" width="6" height="14" rx="3" fill="#93C5FD"/>
  <circle cx="32" cy="5" r="4" fill="#FBBF24"/>
  <!-- 안테나 반짝이 -->
  <circle cx="34" cy="3" r="1" fill="white" opacity="0.8"/>

  <!-- 팔 -->
  <rect x="0" y="26" width="10" height="16" rx="5" fill="#93C5FD"/>
  <rect x="54" y="26" width="10" height="16" rx="5" fill="#93C5FD"/>

  <!-- 손 -->
  <circle cx="5" cy="43" r="5" fill="#BFDBFE"/>
  <circle cx="59" cy="43" r="5" fill="#BFDBFE"/>
</svg>
```

### mood별 눈 변형

```typescript
const MOOD_EYES = {
  default: (
    <>
      <circle cx="22" cy="32" r="7" fill="white"/>
      <circle cx="42" cy="32" r="7" fill="white"/>
      <circle cx="23" cy="33" r="4" fill="#1D4ED8"/>
      <circle cx="43" cy="33" r="4" fill="#1D4ED8"/>
      <circle cx="25" cy="31" r="1.5" fill="white"/>
      <circle cx="45" cy="31" r="1.5" fill="white"/>
    </>
  ),
  happy: (
    // 초승달 눈 (^_^)
    <>
      <path d="M15 35 Q22 27 29 35" stroke="#1D4ED8" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M35 35 Q42 27 49 35" stroke="#1D4ED8" strokeWidth="3" fill="none" strokeLinecap="round"/>
    </>
  ),
  thinking: (
    // 한쪽만 찡긋
    <>
      <circle cx="22" cy="32" r="7" fill="white"/>
      <circle cx="23" cy="33" r="4" fill="#1D4ED8"/>
      <circle cx="25" cy="31" r="1.5" fill="white"/>
      {/* 오른쪽 찡긋 */}
      <path d="M35 32 Q42 28 49 32" stroke="#1D4ED8" strokeWidth="3" fill="none" strokeLinecap="round"/>
    </>
  ),
  excited: (
    // 별 눈 ★
    <>
      <text x="15" y="38" fontSize="14" fill="#FBBF24">★</text>
      <text x="35" y="38" fontSize="14" fill="#FBBF24">★</text>
    </>
  ),
};
```

---

## S9-M2: 다크모드 설계

### 전략: CSS Variables + Tailwind dark 클래스

```css
/* globals.css — CSS 변수 체계 */
:root {
  --bg-primary: #F9FAFB;       /* gray-50 */
  --bg-card: #FFFFFF;
  --bg-nav: #FFFFFF;
  --text-primary: #111827;     /* gray-900 */
  --text-secondary: #6B7280;   /* gray-500 */
  --border: #E5E7EB;           /* gray-200 */
  --accent: #2563EB;           /* blue-600 */
}

.dark {
  --bg-primary: #0F172A;       /* slate-900 */
  --bg-card: #1E293B;          /* slate-800 */
  --bg-nav: #1E293B;
  --text-primary: #F1F5F9;     /* slate-100 */
  --text-secondary: #94A3B8;   /* slate-400 */
  --border: #334155;           /* slate-700 */
  --accent: #60A5FA;           /* blue-400 */
}
```

### DarkModeToggle 컴포넌트

```typescript
// src/components/common/DarkModeToggle.tsx
'use client';
// 달 / 태양 아이콘 토글
// localStorage 'fanen-theme' 저장
// document.documentElement.classList.toggle('dark')
// useEffect로 초기 로드 시 적용
```

### Header 통합

```typescript
// Header.tsx에 DarkModeToggle 추가 (알림 벨 옆)
<DarkModeToggle />
<BellIcon />
<UserMenu />
```

### Tailwind dark: 적용 주요 컴포넌트

| 컴포넌트 | light | dark |
|---------|-------|------|
| body | bg-gray-50 | dark:bg-slate-900 |
| Card | bg-white | dark:bg-slate-800 |
| Header/Nav | bg-white border-gray-200 | dark:bg-slate-800 dark:border-slate-700 |
| text-primary | text-gray-900 | dark:text-slate-100 |
| text-secondary | text-gray-500 | dark:text-slate-400 |
| input | bg-white border-gray-300 | dark:bg-slate-700 dark:border-slate-600 |
| Button primary | bg-blue-600 | dark:bg-blue-500 |

### 적용 파일 목록

- `src/app/globals.css` — CSS 변수 + .dark override
- `src/app/layout.tsx` — html 태그에 suppressHydrationWarning
- `src/components/common/DarkModeToggle.tsx` (신규)
- `src/components/common/Header.tsx` — DarkModeToggle 추가
- `src/components/common/BottomNav.tsx` — dark: 클래스
- `src/components/ui/Card.tsx` — dark: 클래스
- `src/components/ui/Button.tsx` — dark: 클래스
- `src/components/ui/Toast.tsx` — dark: 클래스
- `src/app/layout.tsx` — dark: body 클래스
- 주요 page.tsx 10개 — bg/text dark 클래스

---

## S9-M3: Pro 잠금해제 (개발 모드)

### 환경변수 플래그

```typescript
// src/hooks/useSubscription.ts 수정
export function useSubscription() {
  // DEV 플래그 체크
  const devUnlock = process.env.NEXT_PUBLIC_DEV_UNLOCK_PRO === 'true';

  if (USE_MOCK || devUnlock) {
    // devUnlock 시 premium으로 반환
    const plan: PlanTier = devUnlock ? 'premium' : 'free';
    return { plan, loading: false, isPro: devUnlock, isPremium: devUnlock };
  }
  // ...실 Supabase 조회
}
```

### DevModeBanner 컴포넌트

```typescript
// src/components/common/DevModeBanner.tsx
// NEXT_PUBLIC_DEV_UNLOCK_PRO=true 시에만 렌더
// 상단 고정 노란 배너: "🔧 개발 모드 — Pro/Premium 기능 모두 접근 가능"
// 클릭하면 .env.local 설정 안내 토스트
```

### .env.local.example 업데이트

```env
# 개발용 Pro/Premium 잠금해제 (true로 설정 시 구독 체크 우회)
NEXT_PUBLIC_DEV_UNLOCK_PRO=false
```

---

## S9-M4: 확대모드 (Zoom Mode)

### zoom.css 설계

```css
/* src/styles/zoom.css */
.zoom {
  font-size: 150%;        /* senior: 120% */
  line-height: 2.0;       /* senior: 1.8 */
}

.zoom button,
.zoom [role="button"] {
  min-height: 64px;       /* senior: 52px */
  font-size: 1.2rem;
  padding: 1rem 2rem;
}

.zoom input, .zoom select, .zoom textarea {
  min-height: 64px;
  font-size: 1.2rem;
}

.zoom h1 { font-size: 2.5rem; }
.zoom h2 { font-size: 2rem; }
.zoom p  { font-size: 1.1rem; }

/* 네비게이션 아이콘도 크게 */
.zoom nav svg { width: 32px; height: 32px; }
.zoom nav span { font-size: 0.9rem; }
```

### 온보딩 step3 수정

```
기존 3개 옵션:
  [일반 모드] [전문가 모드] [시니어 모드]

수정 4개 옵션:
  [일반 모드]    (기본)
  [전문가 모드]  (고급 지표 표시)
  [시니어 모드]  (글자 120% 확대)
  [확대 모드]    (글자 150% 확대, 고령층 추천)
```

### 클래스 적용 로직

```typescript
// step3/page.tsx
const handleUiMode = (mode: string) => {
  const root = document.documentElement;
  root.classList.remove('senior', 'zoom', 'expert');

  if (mode === 'senior') root.classList.add('senior');
  if (mode === 'zoom')   root.classList.add('zoom');
  if (mode === 'expert') root.classList.add('expert');

  localStorage.setItem('fanen-ui-mode', mode);
};
```

---

## S9-M5: 글로벌 뉴스 → 수혜 섹터/종목 분석

### 페이지 레이아웃

```
/global-news
┌─────────────────────────────────────────────────────┐
│  [DisclaimerBanner variant="signal"]                │
├─────────────────────────────────────────────────────┤
│  [SubscriptionGate requiredPlan="pro"]              │
│  ┌─────────────────────────────────────────────────┐│
│  │  글로벌 뉴스 선택                               ││
│  │  [카드 목록] — 클릭하면 분석 시작               ││
│  │                                                  ││
│  │  선택된 뉴스: "미국 금리 인하 시사..."          ││
│  │  [분석하기] 버튼                                ││
│  ├─────────────────────────────────────────────────┤│
│  │  [AiBadge] 수혜 섹터 히트맵                    ││
│  │  반도체 🟢 +++ │ 금융 🟡 + │ 건설 🔴 ---       ││
│  ├─────────────────────────────────────────────────┤│
│  │  [AiBadge] 수혜 종목 추천                      ││
│  │  삼성전자 (반도체) 신뢰도 89%  ▲ 매수 신호     ││
│  │  SK하이닉스 (반도체) 신뢰도 82% ▲ 매수 신호   ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### Mock 데이터 설계

```typescript
// src/lib/mock/mockGlobalNews.ts

export interface GlobalNewsItem {
  id: string;
  title: string;          // 뉴스 제목 (한국어)
  source: string;         // "Bloomberg" | "Reuters" | "FT" 등
  category: 'geopolitics' | 'rate' | 'commodity' | 'trade' | 'tech';
  date: string;
  summary: string;        // 2~3줄 요약
  benefitSectors: SectorImpact[];
  benefitStocks: StockRecommendation[];
}

export interface SectorImpact {
  sector: string;
  impact: 'strong_positive' | 'positive' | 'neutral' | 'negative' | 'strong_negative';
  reason: string;
}

export interface StockRecommendation {
  code: string;           // 종목코드
  name: string;           // 종목명
  sector: string;
  signal: 'buy' | 'hold' | 'sell';
  confidence: number;     // 0~100
  reason: string;         // AI 분석 근거
}

// Mock 뉴스 10건:
export const MOCK_GLOBAL_NEWS: GlobalNewsItem[] = [
  {
    id: 'gn-001',
    title: '미 연준, 2026년 2회 금리 인하 시사 — 경기 연착륙 기대',
    source: 'Bloomberg',
    category: 'rate',
    // ...
    benefitSectors: [
      { sector: '반도체', impact: 'strong_positive', reason: '금리 인하 시 성장주 밸류에이션 개선' },
      { sector: '금융', impact: 'negative', reason: 'NIM(순이자마진) 축소 우려' },
    ],
    benefitStocks: [
      { code: '005930', name: '삼성전자', sector: '반도체', signal: 'buy', confidence: 87, reason: '...' },
    ],
  },
  // ...9개 더
];
```

### 컴포넌트 구조

```
src/features/global-news/
├── components/
│   ├── GlobalNewsCard.tsx         (뉴스 선택 카드)
│   ├── GlobalNewsList.tsx         (뉴스 카드 그리드)
│   ├── SectorImpactHeatmap.tsx    (섹터 영향도 시각화)
│   ├── BenefitStockCard.tsx       (종목 추천 카드)
│   └── GlobalNewsAnalysis.tsx     (분석 결과 통합)
├── hooks/
│   └── useGlobalNews.ts           (선택/분석 상태 관리)
└── index.ts
```

### BottomNav 업데이트

```typescript
// BottomNav: 뉴스 탭을 "글로벌" 서브 메뉴로 분기 또는
// 별도 탭으로 추가 (5탭 → 5탭 유지, 뉴스 → 글로벌뉴스 통합)
// 뉴스 탭 클릭 → 뉴스 피드 (기존)
// 뉴스 페이지 내 상단 탭: [AI 뉴스] [글로벌 분석]
```

---

## 구현 순서 (CTO 팀)

```
Phase 1 (병렬):
  ui-designer       → S9-M1 (핀이 SVG 리디자인)
  darkmode-dev      → S9-M2 (다크모드 CSS + Toggle)
  feature-dev       → S9-M3 (Pro 잠금해제 + DevBanner)

Phase 2 (Phase1 완료 후, 병렬):
  accessibility-dev → S9-M4 (확대모드 + 온보딩 업데이트)
  news-analyst-dev  → S9-M5 (글로벌 뉴스 분석 피처)

Phase 3:
  qa-specialist     → 전체 Gap Analysis
```

---

## 완료 기준

- [ ] 핀이 4가지 감정 상태 SVG 적용
- [ ] 다크모드 전환 시 전페이지 정상 렌더
- [ ] NEXT_PUBLIC_DEV_UNLOCK_PRO=true 시 Pro/Premium 기능 접근 가능
- [ ] zoom 모드 적용 시 온보딩/프로필에서 설정 가능
- [ ] /global-news 페이지에서 뉴스 선택 → 섹터 히트맵 + 종목 추천 표시
- [ ] TypeScript 오류 0개
- [ ] DisclaimerBanner + AiBadge 모든 분석 화면 적용
