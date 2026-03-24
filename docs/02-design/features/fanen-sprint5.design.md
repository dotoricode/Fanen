# fanen-sprint5 Design Document

## Context Anchor

| Axis | Content |
|------|---------|
| **WHY** | 60대 은퇴자(Beachhead) 핵심 가치 제공 — 배당 현금흐름 시각화로 Pro 전환 유도 |
| **WHO** | 60대 은퇴자 (배당 중심 투자), 40대 직장인 (포트폴리오 관리) |
| **RISK** | KRX 실 데이터 미연동 시 mock 데이터로 대체, AI 환각 방지 절대 원칙 준수 |
| **SUCCESS** | 배당 시뮬레이터 3회 무료 사용 후 Pro 업그레이드 유도 표시, DisclaimerBanner 필수 |
| **SCOPE** | Sprint 5: 배당 캘린더(5-1) + 배당 시뮬레이터(5-2) + 포트폴리오 CRUD(5-3) |

---

## 1. Overview

Sprint 5는 Beachhead 타깃인 60대 은퇴자를 위한 핵심 기능을 구현한다.

### 1.1 Sprint 5 기능 목록

| # | 기능 | 우선도 | 경로 |
|---|------|--------|------|
| 5-1 | 배당 캘린더 | P0 | `/dividend` |
| 5-2 | 배당 시뮬레이터 | P0 | `/dividend` (탭/섹션) |
| 5-3 | 포트폴리오 CRUD | P1 | `/portfolio` |

### 1.2 절대 원칙 (위반 금지)

- **DisclaimerBanner**: 모든 분석 화면에 필수 렌더링
- **AI 환각 방지**: 금융 수치 직접 생성 금지 (KRX/DART 바인딩 또는 mock 명시)
- **데이터 레지던시**: 포트폴리오(개인 금융) → Railway FastAPI 처리, Vercel 처리 금지
- **구독 게이트**: SubscriptionGate 컴포넌트로 Pro 기능 제한

---

## 2. DB Schema (이미 마이그레이션 완료)

### 2.1 dividend_calendar

```typescript
type DividendCalendarRow = {
  id: string;
  stock_code: string;
  stock_name: string;
  ex_dividend_date: string | null;  // 배당락일
  payment_date: string | null;      // 배당 지급일
  dividend_amount: number | null;   // 주당 배당금 (원)
  dividend_yield: number | null;    // 배당수익률 (%)
  created_at: string;
};
```

### 2.2 portfolios

```typescript
type PortfolioRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  total_value: number;              // 평가금액 (원)
  created_at: string;
  updated_at: string;
};
```

### 2.3 dividend_simulations

```typescript
type DividendSimulationRow = {
  id: string;
  user_id: string;
  portfolio_id: string | null;
  simulation_params: Json | null;   // { principal, annual_yield, years, reinvest }
  result: Json | null;              // { monthly_income, total_return, projections[] }
  created_at: string;
};
```

---

## 3. 아키텍처 설계 (Option C — Pragmatic Balance)

### 3.1 디렉토리 구조

```
src/
├── features/
│   ├── dividend/
│   │   ├── components/
│   │   │   ├── DividendCalendar.tsx     # 월별 배당 캘린더 뷰 (client)
│   │   │   ├── DividendCalendarCard.tsx # 개별 배당 종목 카드 (client)
│   │   │   └── DividendSimulator.tsx    # 배당 시뮬레이터 폼 + 결과 (client)
│   │   ├── hooks/
│   │   │   ├── useDividendCalendar.ts   # dividend_calendar 조회
│   │   │   └── useDividendSimulator.ts  # 시뮬레이터 계산 로직
│   │   ├── types.ts
│   │   └── index.ts
│   ├── portfolio/
│   │   ├── components/
│   │   │   ├── PortfolioList.tsx        # 포트폴리오 목록 (client)
│   │   │   ├── PortfolioCard.tsx        # 개별 포트폴리오 카드 (client)
│   │   │   └── PortfolioForm.tsx        # 생성/수정 폼 (client)
│   │   ├── hooks/
│   │   │   └── usePortfolios.ts         # portfolios CRUD 훅
│   │   ├── types.ts
│   │   └── index.ts
├── app/
│   ├── dividend/
│   │   └── page.tsx                     # 배당 페이지 (server)
│   └── portfolio/
│       └── page.tsx                     # 포트폴리오 페이지 (server)
```

### 3.2 컴포넌트 설계

#### DividendCalendar (client, `'use client'`)
- `useDividendCalendar` 훅으로 데이터 조회
- 월 선택 탭 (현재월 기준 ±3개월)
- 선택 월의 배당 종목 카드 목록 렌더링
- DisclaimerBanner 포함

#### DividendSimulator (client, `'use client'`)
- 입력: 투자원금, 연배당수익률, 기간(10/20/30년), 배당 재투자 여부
- 계산: 클라이언트 사이드 (순수 수학 함수, AI 미사용)
- 결과: 월 배당 수령액, 총 수익, 연도별 프로젝션 테이블
- **SubscriptionGate**: 3회 초과 시 Pro 전환 유도 (localStorage 카운트)
- DisclaimerBanner 필수 (AI 미사용이지만 투자 참고자료)

#### PortfolioList (client, `'use client'`)
- `usePortfolios` 훅으로 CRUD
- 포트폴리오 목록 + 생성 버튼
- 각 포트폴리오 카드에 수정/삭제 액션

### 3.3 훅 설계

#### useDividendCalendar
```typescript
interface UseDividendCalendarReturn {
  data: DividendCalendarRow[];
  selectedMonth: string;  // 'YYYY-MM' 형식
  setSelectedMonth: (month: string) => void;
  loading: boolean;
  error: string | null;
}
```

#### useDividendSimulator
```typescript
interface SimulatorParams {
  principal: number;        // 투자원금 (만원)
  annualYield: number;      // 연 배당수익률 (%)
  years: number;            // 투자 기간 (년)
  reinvest: boolean;        // 배당 재투자 여부
}

interface SimulatorResult {
  monthlyIncome: number;    // 월 배당 수령액 (원)
  annualIncome: number;     // 연 배당 수령액 (원)
  totalReturn: number;      // 총 수익률 (%)
  projections: YearlyProjection[];
}

interface YearlyProjection {
  year: number;
  portfolioValue: number;
  annualDividend: number;
  cumulativeDividend: number;
}
```

#### usePortfolios
```typescript
interface UsePortfoliosReturn {
  portfolios: PortfolioRow[];
  loading: boolean;
  error: string | null;
  createPortfolio: (data: { name: string; description?: string; total_value: number }) => Promise<void>;
  updatePortfolio: (id: string, data: Partial<PortfolioRow>) => Promise<void>;
  deletePortfolio: (id: string) => Promise<void>;
}
```

---

## 4. 페이지 설계

### 4.1 `/dividend` 페이지

```tsx
// 서버 컴포넌트
export default function DividendPage() {
  return (
    <div>
      <h1>배당 캘린더 & 시뮬레이터</h1>
      <DisclaimerBanner variant="default" />
      <Tabs>
        <Tab label="배당 캘린더"><DividendCalendar /></Tab>
        <Tab label="배당 시뮬레이터"><DividendSimulator /></Tab>
      </Tabs>
    </div>
  );
}
```

실제로는 탭 없이 섹션으로 구분 (스크롤):
1. 배당 캘린더 섹션
2. 배당 시뮬레이터 섹션

### 4.2 `/portfolio` 페이지

```tsx
// 서버 컴포넌트 (미들웨어로 인증 보호)
export default function PortfolioPage() {
  return (
    <div>
      <h1>내 포트폴리오</h1>
      <DisclaimerBanner variant="default" />
      <PortfolioList />
    </div>
  );
}
```

---

## 5. 배당 시뮬레이터 계산 로직

AI 없는 순수 수학 계산. 금융 수치를 AI가 생성하지 않음.

```typescript
function calculateDividend(params: SimulatorParams): SimulatorResult {
  const { principal, annualYield, years, reinvest } = params;
  const principalWon = principal * 10000;  // 만원 → 원
  const rate = annualYield / 100;

  const projections: YearlyProjection[] = [];
  let portfolioValue = principalWon;
  let cumulativeDividend = 0;

  for (let year = 1; year <= years; year++) {
    const annualDividend = portfolioValue * rate;
    cumulativeDividend += annualDividend;
    if (reinvest) {
      portfolioValue += annualDividend;
    }
    projections.push({ year, portfolioValue, annualDividend, cumulativeDividend });
  }

  return {
    monthlyIncome: (principalWon * rate) / 12,
    annualIncome: principalWon * rate,
    totalReturn: ((portfolioValue - principalWon) / principalWon) * 100,
    projections,
  };
}
```

---

## 6. 구독 게이트 전략 (5-5)

배당 시뮬레이터 사용 횟수를 localStorage로 추적:
- Free: 3회 무료 사용
- 3회 초과: SubscriptionGate로 블록 + Pro 업그레이드 CTA

```typescript
const SIMULATOR_KEY = 'fanen-sim-count';

function getSimulatorCount(): number {
  return parseInt(localStorage.getItem(SIMULATOR_KEY) ?? '0', 10);
}

function incrementSimulatorCount(): number {
  const next = getSimulatorCount() + 1;
  localStorage.setItem(SIMULATOR_KEY, String(next));
  return next;
}
```

---

## 7. 구현 가이드 (Do Phase)

### 7.1 구현 순서

**M1: dividend feature** (배당 캘린더 + 시뮬레이터)
1. `src/features/dividend/types.ts`
2. `src/features/dividend/hooks/useDividendCalendar.ts`
3. `src/features/dividend/hooks/useDividendSimulator.ts`
4. `src/features/dividend/components/DividendCalendarCard.tsx`
5. `src/features/dividend/components/DividendCalendar.tsx`
6. `src/features/dividend/components/DividendSimulator.tsx`
7. `src/features/dividend/index.ts`
8. `src/app/dividend/page.tsx`

**M2: portfolio feature** (포트폴리오 CRUD)
1. `src/features/portfolio/types.ts`
2. `src/features/portfolio/hooks/usePortfolios.ts`
3. `src/features/portfolio/components/PortfolioCard.tsx`
4. `src/features/portfolio/components/PortfolioForm.tsx`
5. `src/features/portfolio/components/PortfolioList.tsx`
6. `src/features/portfolio/index.ts`
7. `src/app/portfolio/page.tsx`

### 7.2 공통 패턴

- 모든 훅: `'use client'` 없음 (컴포넌트 내부에서만 import)
- 모든 feature 컴포넌트: `'use client'` 지시어 포함
- 모든 훅: `isSupabaseConfigured()` 체크 후 Supabase 호출
- 모든 페이지: `DisclaimerBanner` 렌더링 필수
- 포트폴리오 페이지: 미들웨어 보호됨 (추가 체크 불필요)
- 배당 페이지: 공개 접근 가능 (캘린더는 공개, 시뮬레이터는 3회 무료)
