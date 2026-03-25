# Sprint 3 — 프론트엔드 UI 컴포넌트 구현

## 목표
뉴스 영향 분석과 섹터 인과관계 맵 UI 컴포넌트를 구현한다. D3.js 포스 그래프로 섹터 관계를 시각화하고, SSR 호환성 문제를 해결한다.

## 구현 내용

### NewsImpactList (뉴스 영향 분석 목록)
- `src/features/news-impact/components/NewsImpactList.tsx`
  - TrafficLightSignal로 영향도(impact_score) 시각화
  - 일반/전문가 모드(`uiMode`) 전환 지원
  - 구독 게이트(`SubscriptionGate`) — Pro 이상 필요
  - `DisclaimerBanner` 렌더링 (CLAUDE.md 절대 원칙)
- `src/features/news-impact/hooks/useNewsImpacts.ts`
  - Supabase `news_impacts` 테이블 조회
  - Railway `POST /api/news/analyze` 결과 비동기 병합

### SectorMapSection (섹터 인과관계 맵 섹션)
- `src/features/sector-map/components/SectorMapSection.tsx`
  - SectorForceGraph + SectorDrilldownPanel 통합 레이아웃
  - UiModeSwitch로 일반/시니어 모드 전환
  - 구독 게이트 — Pro 이상 필요
- `src/features/sector-map/hooks/useSectorCausalMap.ts`
  - Supabase `sector_causal_maps` 전체 조회
  - 노드 dedup 처리 (from_sector + to_sector 중복 제거)

### SectorForceGraph (D3.js 포스 그래프)
- `src/features/sector-map/components/SectorForceGraph.tsx`
  - D3.js `forceSimulation`으로 노드-링크 레이아웃 계산
  - 클릭 이벤트 → `onSectorClick` 콜백
  - `next/dynamic({ ssr: false })`로 SSR 비활성화 (D3 브라우저 전용)

### SectorDrilldownPanel (드릴다운 패널)
- `src/features/sector-map/components/SectorDrilldownPanel.tsx`
  - 선택된 섹터의 인과관계 목록 표시
  - 인과 강도(`causal_strength`) 시각화

## SSR 버그 수정 (핵심)

### 문제
`npm run dev` 시 `GET /` 500 에러 발생:
```
Error: Element type is invalid: expected a string... but got: undefined
```

### 원인
`useNewsImpacts.ts`와 `useSectorCausalMap.ts` 파일 첫 줄에 `'use client'` 지시어가 있었음.
Next.js 14 App Router에서 훅 파일에 `'use client'`를 붙이면 모듈 경계(module boundary) 문제가 발생하여 해당 파일을 import하는 컴포넌트가 React에게 `undefined`로 전달됨.

### 수정
- `useNewsImpacts.ts` — `'use client'` 제거 (훅은 컴포넌트가 아님)
- `useSectorCausalMap.ts` — `'use client'` 제거
- `SectorMapSection.tsx` — 디버그 코드(console.log, try/catch) 제거, 정상 상태 복원
- `sector/page.tsx` — 직접 경로 import를 barrel export로 복원
- `sector-map/index.ts` — `SectorForceGraph` barrel 제외 유지 (D3 SSR 방지)

### TypeScript 타입 수정
Supabase 쿼리 결과가 `never`로 추론되는 문제:
- `database.types.ts` — 모든 테이블에 `Relationships: []` 추가 (`GenericTable` 요건 충족)
- `useSectorCausalMap.ts` — 명시적 `SectorCausalMapRow` 타입 캐스팅 추가
- `useNewsImpacts.ts` — 명시적 `NewsImpactRow` 타입 캐스팅 추가

## 주요 파일

| 파일 | 설명 |
|------|------|
| `src/features/news-impact/components/NewsImpactList.tsx` | 뉴스 영향 분석 목록 컴포넌트 |
| `src/features/news-impact/hooks/useNewsImpacts.ts` | 뉴스 데이터 훅 |
| `src/features/sector-map/components/SectorMapSection.tsx` | 섹터 맵 통합 섹션 |
| `src/features/sector-map/components/SectorForceGraph.tsx` | D3.js 포스 그래프 |
| `src/features/sector-map/components/SectorDrilldownPanel.tsx` | 드릴다운 패널 |
| `src/features/sector-map/hooks/useSectorCausalMap.ts` | 섹터 인과관계 훅 |
| `src/types/database.types.ts` | Supabase 데이터베이스 타입 |
