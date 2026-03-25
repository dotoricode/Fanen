# Value Chain 분석 — Plan Document

> 버전: v0.0.1
> 작성일: 2026-03-25
> PRD 참조: docs/00-pm/binah.prd.md
> 이전 컨텍스트: docs/archive/fanen/binah/binah.plan.md § 4. Value Chain 분석 (Sprint 11)

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | 일반 투자자는 글로벌 정세 뉴스를 접하더라도 "메이저 종목 → Tier 1~3 연관 기업"까지 이어지는 수혜 체인을 스스로 파악할 수 없다. 현재 BINAH는 섹터 인과관계 시각화까지는 제공하지만, 구체적인 기업 레벨 체인이 없다. |
| **Solution** | AI가 섹터 트렌드 감지 시 메이저 종목 → Tier 1(직접 납품) → Tier 2(부품/소재) → Tier 3(간접 수혜)까지 자동 발굴하여 Sankey 다이어그램 + 계층 리스트로 시각화한다. |
| **Function UX Effect** | 비나 맵 → 섹터 클릭 → Value Chain 드릴다운(Sankey) → 개별 기업 카드(신호등 + 배당률 + 반디 설명) 원스톱 흐름 |
| **Core Value** | "숨은 수혜주 발굴" — 메이저 종목이 아닌 Tier 2~3 기업에서 더 높은 알파를 찾을 수 있다는 인사이트 제공 |

---

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | BINAH의 핵심 차별화 기능. 비나 맵이 "정세 → 섹터" 연결이라면, Value Chain은 "섹터 → 기업" 연결로 투자 액션까지 이어주는 마지막 고리다. |
| **WHO** | 테마/트렌드 투자에 관심 있는 20~40대, 숨은 중소형 수혜주를 찾는 적극적 투자자 |
| **RISK** | (1) KRX/DART 공식 API로 Tier 2~3 기업 데이터 커버리지 제한 → 초기엔 mock 데이터 + 점진적 실데이터 교체 (2) Sankey 다이어그램 SSR 이슈 → dynamic import 필수 (3) AI 환각 방지: 기업명/수치는 KRX/DART 바인딩 필수 |
| **SUCCESS** | Value Chain 페이지 진입률 > 40% (비나 맵 대비), 기업 카드 클릭률 > 20%, TypeScript 오류 0건 |
| **SCOPE** | v0.0.1: `src/features/value-chain/` 신규 + 비나 맵 드릴다운 연결 + mock 데이터 기반 Sankey UI |

---

## 1. 기능 요구사항

### 1.1 Value Chain 시각화

**Sankey 다이어그램 (D3.js)**
- 좌→우 흐름: 글로벌 이벤트 → 섹터 → 메이저(Tier 0) → T1 → T2 → T3
- 노드 클릭 시 CompanyCard 팝업
- 모바일: Sankey → 계층 리스트로 fallback

**계층 리스트 (대안 뷰)**
- 아코디언 형태, Tier별 펼침/접힘
- TierBadge(T1/T2/T3) 표시

### 1.2 기업 카드 (CompanyCard)

각 기업 노드에 표시:
- 티커 + 기업명
- Tier 뱃지 (T1 직접납품 / T2 부품소재 / T3 간접수혜)
- 신호등 (🟢 매수 / 🟡 관망 / 🔴 리스크)
- 시가배당률 (있는 경우)
- 반디 한줄 설명 ("방산 직납 Top3 부품사예요")
- AI 뱃지 + 출처 URL (CLAUDE.md 절대 원칙)

### 1.3 비나 맵 드릴다운 연결

`src/features/binah-map/` 섹터 노드 클릭 시 `/value-chain?sector=defense` 이동.

### 1.4 데이터 구조

```typescript
interface ValueChainNode {
  ticker: string;
  name: string;
  tier: 0 | 1 | 2 | 3;       // 0 = 메이저
  relationship: string;        // "직접 납품", "부품/소재", "간접 수혜"
  dividendYield?: number;      // 시가배당률 (%)
  description: string;         // 반디 설명
  signal: 'buy' | 'wait' | 'watch';
  sourceUrl: string;           // KRX/DART 출처 (필수)
}

interface ValueChain {
  sector: string;
  eventTrigger: string;        // 트리거 이벤트 설명
  nodes: ValueChainNode[];
  updatedAt: string;
}
```

---

## 2. 구현 범위 (v0.0.1)

### 신규 생성 파일

```
src/features/value-chain/
├── types.ts
├── index.ts
├── components/
│   ├── ValueChainView.tsx      Sankey 다이어그램 (D3, dynamic import)
│   ├── TierBadge.tsx           T1/T2/T3 뱃지 컴포넌트
│   └── CompanyCard.tsx         기업 카드 (신호등 + 배당률 + 반디 설명)
├── hooks/
│   └── useValueChain.ts        섹터 파라미터로 체인 조회
└── mock/
    └── mockValueChains.ts      방산/반도체/2차전지 mock 데이터 3종
```

```
src/app/value-chain/
└── page.tsx                    /value-chain?sector={sector} 페이지
```

### 수정 파일

```
src/features/binah-map/         섹터 클릭 → /value-chain 드릴다운 링크 추가
src/app/(dashboard)/layout.tsx  네비게이션 메뉴에 Value Chain 추가
```

### CLAUDE.md 절대 원칙 체크리스트

- [ ] DisclaimerBanner 렌더링 (value-chain 페이지)
- [ ] AiBadge + 출처 URL 병기 (모든 AI 분석 결과)
- [ ] AI가 기업명/수치 직접 생성 금지 — mock 데이터에서만 참조
- [ ] checkSubscription 불필요 (완전 무료)

---

## 3. 성공 기준

| 지표 | 기준값 |
|------|--------|
| TypeScript 오류 | 0건 |
| Sankey 렌더링 | SSR 오류 없음 |
| 비나 맵 → Value Chain 전환 | 드릴다운 링크 동작 |
| mock 데이터 섹터 | 방산 / 반도체 / 2차전지 3종 |
| DisclaimerBanner | 페이지 렌더링 확인 |
