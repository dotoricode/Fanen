# BINAH (비나) — Plan Document

> 작성일: 2026-03-25
> PRD 참조: docs/00-pm/binah.prd.md (735줄)
> 이전 코드베이스: 파낸(Fanen) Sprint 1~9 완료 → BINAH 브랜드 개편
> 개발 방향: 브랜드 전환 + 신규 기능 + 완전 무료화

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | 1,423만 개인투자자의 76.3%가 노후 준비 부족을 체감하고 있으며, 일반인은 글로벌 정세에서 "뉴스 → 수혜 섹터 → 연관 기업 체인"으로 이어지는 인사이트를 혼자 도출할 수 없다. 기존 파낸(Fanen) 서비스는 핵심 기능이 유료 잠금 뒤에 가려져 있고 브랜드 정체성이 혼재됐다. |
| **Solution** | 파낸(Fanen)을 BINAH(비나)로 전면 개편. AI 어시스턴트 반디(Bandi)가 글로벌 정세를 선제적으로 감지해 수혜 섹터 및 Value Chain(Tier 1~3) 기업을 자동 발굴하고, 불로소득 목표 달성을 설계해주는 완전 무료 투자 인사이트 플랫폼으로 전환한다. |
| **Function UX Effect** | 비나 맵(세계 지도 + 빛 강도 시각화) → Value Chain 드릴다운 → 불로소득 목표 계산기 → 반디 차트 해설(신호등 + 쉬운 말)의 원스톱 플로우. 반디의 모닝 라이트로 매일 재방문 동기 생성. |
| **Core Value** | "반디가 찾은 오늘의 기회, 당신의 내일이 빛나도록" — 정세 감지 + Value Chain 발굴 + 불로소득 설계의 삼위일체. 완전 무료로 정보 소외 계층 진입 장벽 완전 제거. |

---

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 파낸은 핵심 기능(뉴스 분석, 섹터맵)이 Pro/Premium 잠금 뒤에 있어 서비스의 핵심 가치를 사용자가 경험할 수 없었다. 브랜드 정체성도 "뉴스 앱인지 AI 코치인지" 혼재. BINAH는 완전 무료 + 명확한 정체성(불로소득 발굴)으로 재출발한다. |
| **WHO** | 전 연령 불로소득/노후 대비 수요자 — 20대(자산 형성 시작), 40~55대(Beachhead: 배당 관심 직장인), 60대(배당 현금흐름 중심) |
| **RISK** | (1) Value Chain Tier 2~3 데이터 소스 확보 필요 (2) 비나 맵 D3 세계 지도 구현 복잡도 (3) 리브랜딩 과정에서 기존 코드베이스 일관성 유지 (4) 완전 무료 전환 시 SubscriptionGate 제거로 인한 로직 정리 |
| **SUCCESS** | MAU 10만(6개월), DAU/MAU 30%+, 비나 맵 → Value Chain 전환율, 불로소득 계산기 완료율, TypeScript 오류 0건 |
| **SCOPE** | Sprint 10: 브랜드 교체 + 무료화 + 홈/비나 맵 개편 + 반디 캐릭터 / Sprint 11: Value Chain Tier 1~3 + 배당 허브 + 반디 차트 해설 / Sprint 12: 모닝 라이트 알림 + 반디 고도화 + 백엔드 연동 |

---

## 1. 브랜드 전환 (Sprint 10 — P0)

### 1.1 서비스명 변경: 파낸 → BINAH

| 항목 | 변경 전 | 변경 후 |
|------|--------|--------|
| 서비스명 | 파낸 (Fanen) | BINAH (비나) |
| AI 캐릭터 | 핀이 (FinAI) | 반디 (Bandi) |
| 슬로건 | "세상이 움직이면, 파낸이 먼저 압니다" | "반디가 찾은 오늘의 기회, 당신의 내일이 빛나도록" |
| 태그라인 | — | BINAH: Deep Insight, Smart Investment |

**변경 필요 파일:**
```
src/app/layout.tsx              (title, metadata)
src/app/page.tsx                (브랜드명 텍스트)
src/features/landing/LandingPage.tsx  (슬로건, 브랜드명)
src/features/ai-coach/components/FinniAvatar.tsx  → BandiAvatar.tsx
src/components/common/Header.tsx    (로고/브랜드명)
public/                         (파비콘, OG 이미지)
```

### 1.2 컬러 시스템 전환

| 항목 | 기존 파낸 | 새 BINAH |
|------|---------|---------|
| Primary | #2563EB (Blue) | #0D9488 (Teal) |
| Accent | — | #A3E635 (Lime — 반디 발광) |
| Background (dark) | slate-900 | #0F1923 (Deep Navy) |
| 반디 glow | — | #CCFBF1 (Teal 발광) |

**변경 필요 파일:**
```
src/app/globals.css         (CSS 변수 --color-primary 등)
tailwind.config.ts          (primary 색상 교체)
src/styles/zoom.css         (버튼 색상 참조)
```

### 1.3 반디 (Bandi) 캐릭터 SVG 구현

**디자인 스펙** (이미지 참조: Bandi.png):
- 동그란 유리 헬멧 + 투명 헤드셋
- 몸체: 따뜻한 베이지/화이트
- 배/가슴: 레몬 옐로우-라임 발광 (반딧불이)
- 표정: 커다란 눈, 귀여운 미소
- mood: default / happy / thinking / excited / **glowing** (새 mood — 기회 발견 시)
- 애니메이션: 발광 pulse (기회 감지 시 깜빡임)

**파일:**
```
src/features/ai-coach/components/BandiAvatar.tsx  (신규 — FinniAvatar 대체)
```

### 1.4 완전 무료화 (SubscriptionGate 제거)

**제거 대상:**
```
src/app/news/page.tsx           → SubscriptionGate 제거
src/app/sector/page.tsx         → SubscriptionGate 제거
src/app/global-news/page.tsx    → SubscriptionGate 제거
src/app/coach/page.tsx          → SubscriptionGate 제거
src/app/journal/page.tsx        → SubscriptionGate 제거
src/app/dividend/page.tsx       → SubscriptionGate 제거
src/features/news-impact/components/NewsImpactList.tsx  → 구독 조건 제거
```

**pricing 페이지**: 구독 가격표 제거 → "BINAH는 완전 무료입니다" 페이지로 전환

---

## 2. 홈 화면 개편 (Sprint 10 — P0)

### 2.1 새 홈 구조

```
기존: 대시보드 (포트폴리오 요약 + 뉴스)
↓
새: 반디의 모닝 라이트 + 비나 맵 (기본형)
```

**홈 레이아웃:**
```
┌─────────────────────────────────────┐
│  반디의 오늘 브리핑  🔆              │
│  "오늘 미국이 관세를 발표했어요!     │
│   방산·에너지 섹터에 기회가 있을     │
│   것 같아요. 한번 볼까요? →"        │
├─────────────────────────────────────┤
│  비나 맵 (Lite)                     │
│  세계 지도 위 Hot Zone 표시         │
│  [자세히 보기 →]                    │
├─────────────────────────────────────┤
│  오늘의 수혜 섹터 Top 3             │
│  🟢 방산 / 🟡 에너지 / 🔵 반도체   │
└─────────────────────────────────────┘
```

**구현 파일:**
```
src/app/page.tsx                (홈 개편)
src/features/dashboard/DashboardHome.tsx  (모닝 브리핑 섹션 추가)
src/features/binah-map/         (신규 feature)
├── components/
│   ├── BinahMapLite.tsx        (홈용 축소판)
│   └── BinahMapFull.tsx        (전체 페이지용)
├── hooks/
│   └── useBinahMap.ts
└── types.ts
```

---

## 3. 비나 맵 (BINAH Map) — Sprint 10 기본형, Sprint 11 완성형

### 3.1 비나 맵 기본형 (Sprint 10)

- D3.js 세계 지도 (`topojson-client`)
- 정세 이벤트 포인트: 위도/경도 기반 마커
- 빛의 강도: 리스크 스코어에 따라 크기/투명도 조절
- 클릭 시: 해당 이벤트 → 수혜 섹터 목록 표시 (슬라이드업 패널)

### 3.2 비나 맵 완성형 (Sprint 11)

- 클릭 드릴다운: 이벤트 → 섹터 → Value Chain (Tier 1~3) 연결
- 지정학적 리스크 스코어 (0~100) 실시간 표시
- 히트맵 모드 / 마커 모드 전환

**구현 파일:**
```
src/app/binah-map/page.tsx      (신규 전체 페이지)
src/features/binah-map/         (위 구조 참조)
src/lib/mock/mockBinahMap.ts    (신규 Mock 데이터)
```

---

## 4. Value Chain 분석 (Sprint 11 — P0)

### 4.1 기능 정의

섹터 트렌드 감지 시 메이저 종목뿐 아니라 Tier 1~3 연관 기업 자동 발굴.

**예시 — 방산 섹터 호황:**
```
메이저: 한화에어로스페이스, LIG넥스원
  └── Tier 1: HSD엔진(한화엔진), SNT모티브 [직접 납품]
        └── Tier 2: 풍산(탄약/소재), 한화솔루션(복합소재) [부품/소재]
              └── Tier 3: 한국항공우주(MRO), 현대로템(정비/물류) [간접 수혜]
```

### 4.2 UI 컴포넌트

```
src/features/value-chain/
├── components/
│   ├── ValueChainView.tsx      (Sankey 다이어그램 + 계층 리스트)
│   ├── TierBadge.tsx           (T1/T2/T3 뱃지)
│   └── CompanyCard.tsx         (종목 카드 — 배당률, 특징 포함)
├── hooks/
│   └── useValueChain.ts
└── types.ts
```

### 4.3 데이터 구조

```typescript
interface ValueChainNode {
  ticker: string;
  name: string;
  tier: 0 | 1 | 2 | 3;  // 0 = 메이저
  relationship: string;   // "직접 납품", "부품/소재" 등
  dividendYield?: number; // 시가배당률
  description: string;    // 반디 설명
  signal: 'buy' | 'wait' | 'watch'; // 신호등
}
```

---

## 5. 배당 & 불로소득 허브 (Sprint 11 — P0)

### 5.1 투자 성향 카테고리

| 카테고리 | 아이콘 | 핵심 지표 |
|----------|--------|---------|
| 배당형 | 💰 | 시가배당률, 배당성장률, 배당 안정성 |
| 가치형 | 📊 | PER, PBR, 내재가치 괴리율 |
| 성장형 | 🚀 | 매출성장률, 영업이익률 |
| 테마형 | 🌐 | 섹터 트렌드 + Value Chain 연계 |
| ETF 안정형 | 🛡️ | 월배당 ETF, 저변동성, 분산투자 |

### 5.2 불로소득 목표 계산기

```
입력: 목표 월 불로소득 (예: 50만원)
출력:
  - 필요 투자금 (시가배당률 4% 기준: 1억 5천만원)
  - 추천 포트폴리오 구성 (ETF + 배당주 혼합)
  - 달성 예상 시나리오 (월 X만원 저축 시 Y년 후)
  - 반디 멘트: "이 구성이면 방산 섹터 수혜까지 겸할 수 있어요! 🎯"
```

### 5.3 월배당 ETF 시뮬레이터

```
선택: TIGER 미국배당다우존스 100주
표시:
  - 월 예상 배당: 약 5,500원 (55원/주)
  - 연 예상 배당: 약 66,000원
  - 배당 재투자 시 10년 후 복리 계산
  - 차트: 배당 누적 시각화
```

**구현 파일:**
```
src/features/dividend/components/PassiveIncomeCalculator.tsx  (신규)
src/features/dividend/components/MonthlyETFSimulator.tsx      (신규)
src/lib/mock/mockDividend.ts    (기존 확장)
```

---

## 6. 반디 차트 해설 (Sprint 11 — P1)

### 6.1 기능 정의

일반인도 이해 가능한 차트 분석 결과 제공.

**구성 요소:**
1. **신호등 카드**: 🟢 진입 좋음 / 🟡 관망 권고 / 🔴 리스크 주의
2. **반디 설명**: "지금 이 종목은 120일 이동평균선 위에 있어요. 꾸준히 오르는 중이에요!"
3. **근거 요약 카드**:
   - 지지선: X,XXX원 (최근 저점)
   - 저항선: X,XXX원 (돌파 시 목표)
   - 거래량: 평균 대비 +XX% (관심 증가)
   - 추세: 상승/횡보/하락

**구현 파일:**
```
src/features/chart-analysis/
├── components/
│   ├── BandiChartSignal.tsx    (신호등 + 반디 멘트)
│   └── ChartEvidenceCard.tsx  (근거 요약 카드)
└── hooks/
    └── useChartAnalysis.ts
```

---

## 7. 반디의 모닝 라이트 (Sprint 12 — P1)

매일 아침 글로벌 이슈 3문장 + 기회/리스크 알림.

```
[반디의 모닝 라이트 ☀️]
"안녕하세요! 오늘 반디가 세계를 둘러봤어요.
① 미국이 중국산 철강에 25% 관세를 부과한다고 발표했어요.
② 국내 철강 대체 수요가 늘 수 있어서 포스코·현대제철이 주목받고 있어요.
③ 관련 부품사도 반짝이고 있어요! Value Chain 확인해볼까요? →"
```

**구현 파일:**
```
src/features/morning-light/
├── components/
│   └── MorningLightCard.tsx
├── hooks/
│   └── useMorningLight.ts
└── types.ts
src/lib/mock/mockMorningLight.ts
```

---

## 8. 스프린트 계획

### Sprint 10 — 브랜드 전환 + 홈 개편 (P0)
```
M1: 브랜드 교체
  - 서비스명/슬로건 텍스트 변경 (layout, LandingPage, Header)
  - 컬러 시스템 전환 (globals.css, tailwind.config.ts)
  - 반디 SVG 캐릭터 구현 (BandiAvatar.tsx)

M2: 완전 무료화
  - 모든 페이지 SubscriptionGate 제거
  - pricing 페이지 → "완전 무료" 안내 페이지로 전환
  - plans.ts 정리

M3: 홈 화면 개편
  - 반디 모닝 브리핑 섹션 (Mock)
  - 비나 맵 Lite 기본형
  - 오늘의 수혜 섹터 Top 3
```

### Sprint 11 — 핵심 신기능 (P0)
```
M4: 비나 맵 완성형
  - D3.js 세계 지도 + 이벤트 마커
  - 드릴다운: 이벤트 → 섹터 → Value Chain

M5: Value Chain 분석 (Tier 1~3)
  - ValueChainView, TierBadge, CompanyCard
  - Mock 데이터 (방산/반도체/바이오 3개 테마)

M6: 배당 & 불로소득 허브
  - 불로소득 목표 계산기
  - 월배당 ETF 시뮬레이터
  - 투자 성향 카테고리 필터

M7: 반디 차트 해설
  - BandiChartSignal (신호등)
  - ChartEvidenceCard (근거 카드)
```

### Sprint 12 — 반디 고도화 + 백엔드 연동 (P1)
```
M8: 반디의 모닝 라이트
  - 일별 브리핑 카드 + 푸시 알림 기반

M9: 반디 캐릭터 고도화
  - glowing mood 애니메이션
  - 기회 발견 시 반짝임 연출

M10: 백엔드 실데이터 연동
  - Mock → KRX/DART 실데이터 교체
  - 글로벌 뉴스 API 연동 (Value Chain 자동화)
```

---

## 9. 파일 생성/수정 목록

### 신규 생성 (Sprint 10: 12개)
```
src/features/binah-map/
├── components/BinahMapLite.tsx
├── components/BinahMapFull.tsx
├── hooks/useBinahMap.ts
└── types.ts

src/features/ai-coach/components/BandiAvatar.tsx
src/lib/mock/mockBinahMap.ts
src/lib/mock/mockMorningLight.ts
src/app/binah-map/page.tsx
```

### 신규 생성 (Sprint 11: 14개)
```
src/features/value-chain/
├── components/ValueChainView.tsx
├── components/TierBadge.tsx
├── components/CompanyCard.tsx
├── hooks/useValueChain.ts
└── types.ts

src/features/dividend/components/PassiveIncomeCalculator.tsx
src/features/dividend/components/MonthlyETFSimulator.tsx

src/features/chart-analysis/
├── components/BandiChartSignal.tsx
├── components/ChartEvidenceCard.tsx
└── hooks/useChartAnalysis.ts
```

### 수정 (Sprint 10: 12개)
```
src/app/layout.tsx              (BINAH 메타데이터)
src/app/page.tsx                (홈 개편)
src/app/globals.css             (컬러 변수)
tailwind.config.ts              (primary 색상)
src/features/landing/LandingPage.tsx  (브랜드명/슬로건)
src/components/common/Header.tsx    (로고/브랜드명)
src/features/dashboard/DashboardHome.tsx  (모닝 브리핑)
src/app/pricing/page.tsx        (완전 무료 안내)
src/app/news/page.tsx           (SubscriptionGate 제거)
src/app/sector/page.tsx         (SubscriptionGate 제거)
src/app/global-news/page.tsx    (SubscriptionGate 제거)
src/app/coach/page.tsx          (SubscriptionGate 제거)
```

---

## 10. 성공 기준

| 기준 | 측정 방법 |
|------|---------|
| TypeScript 오류 0건 | `tsc --noEmit` 통과 |
| 모든 페이지 무료 접근 가능 | free 계정으로 전체 기능 접근 확인 |
| 브랜드 "파낸/핀이" 잔존 0건 | `grep -r "파낸\|핀이\|Fanen\|FinAI" src/` 결과 0 |
| 비나 맵 렌더링 정상 | 세계 지도 + 이벤트 마커 표시 확인 |
| 반디 모든 mood 표시 | default/happy/thinking/excited/glowing 5종 확인 |
| 불로소득 계산기 동작 | 월 목표 입력 → 포트폴리오 출력 정상 |
| 다크모드 정상 | 전체 신규 컴포넌트 dark: 클래스 적용 |

---

## 11. CLAUDE.md 원칙 준수 (변경 사항)

### 11.1 DisclaimerBanner
- 기존: 분석 페이지에 표시 → **유지**
- 비나 맵, Value Chain 분석, 반디 차트 해설 페이지에도 **신규 추가 필수**

### 11.2 AiBadge
- Value Chain 분석 결과 (Tier 1~3 발굴) → AiBadge 표시
- 반디 차트 해설 결과 → AiBadge 표시
- 불로소득 계산기 추천 포트폴리오 → AiBadge 표시

### 11.3 구독 플랜
- `lib/plans.ts`: 플랜 체계 단순화 (free 단일 플랜)
- `SubscriptionGate`: 전체 페이지에서 제거 (완전 무료화)
- `useSubscription`: 단순화 가능 (항상 'free' 반환 → 또는 완전 제거)

### 11.4 AI 환각 방지 (강화)
- Value Chain Tier 2~3 기업명은 KRX/DART 공식 데이터 바인딩 필수
- 모든 AI 분석 결과에 출처 명시 (`data-source: KRX`, `data-source: DART`)
- Mock 데이터도 실제 상장 기업 티커 사용
