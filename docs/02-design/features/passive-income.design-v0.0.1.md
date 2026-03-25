# 불로소득 & 배당 허브 — Design Document

> 버전: v0.0.1
> 작성일: 2026-03-25
> Plan 참조: docs/01-plan/features/passive-income.plan-v0.0.1.md
> 아키텍처: Option C — Pragmatic Balance (기존 dividend feature 확장)

---

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | Value Chain으로 종목 발굴 후 "얼마나 투자해야 월 50만원이 되나?" 라는 질문에 즉각 답변. Beachhead 사용자(40~55세)의 은퇴 설계 핵심 도구. |
| **WHO** | 40~55세 배당 직장인, 60대 은퇴 예비자 |
| **RISK** | DividendSimulator 기존 로직 덮어쓰기 위험 — 기존 컴포넌트 유지, 신규 컴포넌트 추가 방식 |
| **SUCCESS** | 3탭 구조 동작, 계산기 결과 정확, TS 오류 0건 |
| **SCOPE** | `src/features/dividend/` + `src/app/dividend/page.tsx` |

---

## 1. 아키텍처 개요

### 1.1 디렉토리 구조 (최종)

```
src/features/dividend/
├── types.ts                         ← 기존 + PassiveIncomeResult, PortfolioType 추가
├── index.ts                         ← exports 추가
├── components/
│   ├── DividendCalendar.tsx         ← 기존 유지
│   ├── DividendCalendarCard.tsx     ← 기존 유지
│   ├── DividendSimulator.tsx        ← 기존 유지
│   ├── PassiveIncomeCalculator.tsx  ← 신규
│   ├── MonthlyETFSimulator.tsx      ← 신규
│   └── PortfolioTypeFilter.tsx      ← 신규
└── hooks/
    └── usePassiveIncome.ts          ← 신규 (계산 로직 분리)

src/app/dividend/
└── page.tsx                         ← 3탭 구조로 개편

src/lib/mock/
└── mockDividend.ts                  ← ETF 5종 + 성향별 포트폴리오 mock 추가
```

---

## 2. 타입 정의

```typescript
// types.ts 추가 내용

export type PortfolioType = 'dividend' | 'value' | 'growth' | 'theme' | 'etf';

export interface PortfolioTypeConfig {
  type: PortfolioType;
  label: string;
  icon: string;
  description: string;
}

export interface PassiveIncomeInput {
  targetMonthlyIncome: number;  // 목표 월 불로소득 (원)
  annualYieldPercent: number;   // 예상 연 배당수익률 (%)
  portfolioType: PortfolioType;
}

export interface PassiveIncomeResult {
  requiredInvestment: number;        // 필요 투자금 (원)
  recommendedPortfolio: PortfolioItem[];
  bandiComment: string;              // 반디 멘트
  sourceUrl: string;                 // KRX 출처 URL (CLAUDE.md 원칙)
}

export interface PortfolioItem {
  name: string;
  ticker: string;
  weight: number;          // 비중 (%)
  expectedYield: number;   // 예상 배당수익률 (%)
  type: PortfolioType;
}

export interface ETFMockData {
  ticker: string;
  name: string;
  annualYield: number;     // 연 분배율 (%)
  monthlyDividend: number; // 주당 월 분배금 (원)
  sourceUrl: string;       // KRX URL (CLAUDE.md 원칙)
}
```

---

## 3. 컴포넌트 설계

### 3.1 PassiveIncomeCalculator.tsx

```
Props: 없음 (내부 상태 관리)

State:
  - targetMonthly: number (입력값, 원)
  - yieldPercent: number (연 수익률 %, 기본 4.0)
  - portfolioType: PortfolioType (기본 'dividend')
  - result: PassiveIncomeResult | null

계산 로직 (usePassiveIncome hook 위임):
  requiredInvestment = targetMonthly * 12 / (yieldPercent / 100)

렌더:
  [입력 영역]
    슬라이더 or 입력: 목표 월 불로소득
    수익률 조절: 3% / 4% / 5% 버튼
    <PortfolioTypeFilter onSelect={setPortfolioType} />

  [결과 영역] (result 있을 때)
    필요 투자금: X,XXX만원
    추천 구성: PortfolioItem 목록
    반디 멘트 말풍선
    <AiBadge label="AI 분석" variant="info" source={result.sourceUrl} />
    <DisclaimerBanner />
```

### 3.2 MonthlyETFSimulator.tsx

```
Props: 없음 (내부 상태)

State:
  - selectedETF: ETFMockData
  - principal: number (투자 원금 만원)
  - years: number (투자 기간)
  - reinvest: boolean

로직: 기존 calculateDividend() 재사용 (types.ts에 이미 구현)

렌더:
  ETF 선택 드롭다운 (MOCK_ETF_LIST에서)
  원금 / 기간 입력
  재투자 토글
  [차트] recharts LineChart — 포트폴리오 가치 vs 배당 누적
  비교 카드: 재투자 vs 비재투자 최종값 차이
```

### 3.3 PortfolioTypeFilter.tsx

```
Props:
  selected: PortfolioType
  onSelect: (type: PortfolioType) => void

렌더: 5개 탭 버튼
  💰 배당형 / 📊 가치형 / 🚀 성장형 / 🌐 테마형 / 🛡️ ETF안정형
  선택된 탭: teal 강조
```

### 3.4 usePassiveIncome.ts

```typescript
export function usePassiveIncome(input: PassiveIncomeInput): PassiveIncomeResult {
  // 순수 계산 로직 (API 없음, v0.0.1은 mock)
  const requiredInvestment = (input.targetMonthlyIncome * 12) / (input.annualYieldPercent / 100);
  const portfolio = MOCK_PORTFOLIOS[input.portfolioType];
  const bandiComment = generateBandiComment(input.portfolioType, requiredInvestment);
  return {
    requiredInvestment,
    recommendedPortfolio: portfolio,
    bandiComment,
    sourceUrl: 'https://www.krx.co.kr',
  };
}
```

---

## 4. 페이지 설계 (`/dividend/page.tsx`)

```tsx
// 탭 상태 관리
const [activeTab, setActiveTab] = useState<'calculator' | 'simulator' | 'calendar'>('calculator');

// 탭 헤더
['불로소득 계산기', 'ETF 시뮬레이터', '배당 캘린더']

// 렌더
<DisclaimerBanner />  // 페이지 최상단 (CLAUDE.md 원칙)
<TabHeader />
{activeTab === 'calculator' && <PassiveIncomeCalculator />}
{activeTab === 'simulator' && <MonthlyETFSimulator />}
{activeTab === 'calendar' && <DividendCalendar />}
```

---

## 5. Mock 데이터 추가 (`mockDividend.ts`)

```typescript
// ETF 5종 mock
export const MOCK_ETF_LIST: ETFMockData[] = [
  { ticker: '458730', name: 'TIGER 미국배당다우존스', annualYield: 3.8, monthlyDividend: 55, sourceUrl: 'https://www.krx.co.kr' },
  { ticker: '441680', name: 'KODEX 미국배당프리미엄', annualYield: 8.2, monthlyDividend: 130, sourceUrl: 'https://www.krx.co.kr' },
  { ticker: '395160', name: 'TIGER 리츠부동산인프라', annualYield: 5.1, monthlyDividend: 42, sourceUrl: 'https://www.krx.co.kr' },
  { ticker: '329200', name: 'TIGER 미국채10년선물', annualYield: 3.2, monthlyDividend: 28, sourceUrl: 'https://www.krx.co.kr' },
  { ticker: '148020', name: 'KBSTAR 고배당', annualYield: 4.5, monthlyDividend: 60, sourceUrl: 'https://www.krx.co.kr' },
];

// 성향별 추천 포트폴리오 mock (5종)
export const MOCK_PORTFOLIOS: Record<PortfolioType, PortfolioItem[]> = {
  dividend: [...],   // 고배당주 중심
  value: [...],      // 저PER/저PBR 중심
  growth: [...],     // 성장주 + 소형 배당
  theme: [...],      // Value Chain 방산/반도체 연계
  etf: [...],        // 월배당 ETF 중심
};
```

---

## 6. 구현 순서 (Agent 분담)

### Agent 1 — Frontend (UI 컴포넌트)

```
1. src/features/dividend/components/PortfolioTypeFilter.tsx
2. src/features/dividend/components/PassiveIncomeCalculator.tsx
3. src/features/dividend/components/MonthlyETFSimulator.tsx
4. src/app/dividend/page.tsx (3탭 구조 개편)
```

### Agent 2 — Data/Logic (타입 + Mock + Hook)

```
1. src/features/dividend/types.ts (타입 추가)
2. src/lib/mock/mockDividend.ts (ETF + 포트폴리오 mock 추가)
3. src/features/dividend/hooks/usePassiveIncome.ts (신규)
4. src/features/dividend/index.ts (exports 추가)
```

**의존성**: Agent 2가 types.ts + mock 먼저 완료 → Agent 1 컴포넌트 시작

---

## 7. CLAUDE.md 원칙 준수 체크리스트

- [ ] `DisclaimerBanner` — page.tsx 최상단 렌더링
- [ ] `AiBadge source={sourceUrl}` — PassiveIncomeCalculator 결과 영역
- [ ] `sourceUrl: 'https://www.krx.co.kr'` — 모든 mock 데이터 항목
- [ ] AI가 수치 직접 생성 금지 — mock 파일에서만 참조
- [ ] TypeScript strict 오류 0건
