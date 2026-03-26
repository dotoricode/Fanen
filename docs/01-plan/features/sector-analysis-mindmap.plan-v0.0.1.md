# 섹터 분석 마인드맵 — Plan Document

> 버전: v0.0.1
> 작성일: 2026-03-26
> 피처명: sector-analysis-mindmap
> 전환 대상: value-chain (Sankey) → 섹터 분석 (Radial Mindmap)

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | 기존 Value Chain Sankey 다이어그램은 흐름(flow) 표현에 집중되어 섹터 생태계의 방사형 관계망(ecosystem)을 직관적으로 표현하지 못함. 또한 UI 명칭 "Value Chain"이 한국 투자자에게 생소함. |
| **Solution** | D3.js 기반 방사형 마인드맵으로 전면 교체. 중심=섹터, 1링=연관섹터, 2링=기업, 3링=공급사 구조로 관계망을 시각화. UI 명칭을 "섹터 분석"으로 변경. |
| **Function UX Effect** | TradingView/Bloomberg 수준의 모노크롬 다크 톤. hover 하이라이트, 클릭 디테일 패널, 줌/팬 인터랙션. 모바일도 방사형 유지(핀치줌 허용). |
| **Core Value** | 섹터 생태계 전체를 한눈에 파악. "이 섹터에서 어떤 기업들이 연결되어 있는가"를 투자자가 직관적으로 탐색 가능. |

---

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | Sankey → 관계망 시각화 전환. 한국 투자자 친화적 명칭(섹터 분석) 채택. |
| **WHO** | 섹터/종목 간 관계 탐색 투자자 (20~60대, 파낸 타깃 동일) |
| **RISK** | D3 radial 레이아웃 노드 겹침 문제. 모바일 소형 화면에서 가독성. 기존 value-chain 데이터 타입 재사용 vs 리팩토링 판단 필요. |
| **SUCCESS** | 방사형 그래프 렌더링 오류 0건, 노드 겹침 없음, 모바일 핀치줌 동작, TS 오류 0건, DisclaimerBanner 유지 |
| **SCOPE** | value-chain 피처 폴더/페이지 전면 교체 (sector-analysis로 rename). SideNav 링크 변경. |

---

## 1. 피처 목표

### 1.1 핵심 목표
- Value Chain Sankey 다이어그램을 **섹터 분석 방사형 마인드맵**으로 전면 교체
- UI 전체 명칭: **섹터 분석** (Value Chain 명칭 완전 제거)
- TradingView / Bloomberg 수준의 Fintech 대시보드 UI 품질

### 1.2 전환 범위

| 대상 | 현재 | 변경 후 |
|------|------|---------|
| URL | `/value-chain` | `/sector-analysis` |
| 피처 폴더 | `src/features/value-chain/` | `src/features/sector-analysis/` |
| 앱 페이지 | `src/app/value-chain/` | `src/app/sector-analysis/` |
| UI 명칭 | Value Chain / 밸류체인 | 섹터 분석 |
| 시각화 | D3 Sankey 다이어그램 | D3 방사형 마인드맵 |
| SideNav | value-chain 링크 | sector-analysis 링크 |

---

## 2. 그래프 스펙

### 2.1 레이아웃 구조

```
               [공급사A]  [공급사B]
           [기업A]           [기업C]
      [연관섹터A]               [연관섹터B]
               ← [섹터] →
      [연관섹터C]               [연관섹터D]
           [기업B]           [기업D]
               [공급사C]  [공급사D]
```

| 레이어 | 데이터 티어 | 설명 |
|--------|------------|------|
| Center | Tier 0 | 선택된 섹터 (항상 중심) |
| Ring 1 | Tier 1 | 연관 섹터 |
| Ring 2 | Tier 2 | 기업 |
| Ring 3 | Tier 3 | 공급사 |

### 2.2 그래프 타입
- **D3.js** 직접 구현 (신규 패키지 설치 불필요, 기존 d3 재사용)
- 레이아웃 알고리즘: Radial Tree (d3.tree + radial projection)
- 노드 겹침 방지: 각 링의 노드 수에 따라 각도 균등 분배
- SVG 기반, `useRef` + `ResizeObserver` 반응형 크기

### 2.3 금지 사항
- Sankey, force-directed random, rainbow/neon 색상 사용 금지

---

## 3. 스타일 스펙

### 3.1 컬러 팔레트 (고정)

| 역할 | 색상 코드 | 설명 |
|------|-----------|------|
| 배경 | `#111111` / `#1F2937` | 다크 배경 |
| 노드 기본 | `#374151` | 비활성 노드 |
| 노드 텍스트 | `#E5E7EB` | 기본 레이블 |
| 엣지 | `#374151` | thin line (1px) |
| 중심 노드 | `#F9FAFB` | 선택 섹터 강조 |
| 하이라이트 | `#3B82F6` | hover/선택 accent |
| 보조 텍스트 | `#9CA3AF` | 부가 정보 |

### 3.2 금지 사항
- rainbow, neon, cartoon, bright UI, heavy gradient 금지
- 다중 accent 색상 금지 (단일 `#3B82F6`만 허용)

### 3.3 UX 톤 기준
- **참고**: TradingView, Bloomberg, Notion Graph, Figma Graph
- **금지**: 개발 도구 느낌, 데모/토이 UI 느낌

---

## 4. 인터랙션 스펙

| 인터랙션 | 동작 |
|---------|------|
| hover | 해당 노드 + 연결 엣지 하이라이트 (`#3B82F6`) |
| click | 우측 디테일 패널 열림 (기업/섹터 정보) |
| zoom/pan | SVG 줌·패닝 허용 (d3.zoom) |
| focus animation | 클릭 시 해당 노드 중심 이동 애니메이션 |
| mobile | 핀치줌 허용, 방사형 유지 |

### 4.1 금지 사항
- 노드 겹침, 레이블 겹침 금지
- 지나친 노드 밀집(cluttered layout) 금지

---

## 5. 데이터 구조

### 5.1 기존 타입 재활용

기존 `src/features/value-chain/types.ts`의 Tier 구조 유지.
폴더 이동 시 import 경로만 변경.

```typescript
// 기존 구조 유지 (naming만 변경)
// ValueChainNode → SectorAnalysisNode (선택적 rename)
// Tier 0~3 구조 동일
```

### 5.2 그래프 데이터 변환

```typescript
// Tier 계층 → 방사형 트리 노드 변환
// { id, label, tier, parentId } 구조로 정규화
// d3.hierarchy 입력 형태로 변환
```

---

## 6. 컴포넌트 구조

```
src/features/sector-analysis/
├── types.ts                    # 타입 정의 (value-chain/types.ts 기반)
├── mock/
│   └── mockSectorData.ts       # mock 데이터 (기존 mock 변환)
├── hooks/
│   └── useSectorAnalysis.ts    # 데이터 훅 (useValueChain 기반)
├── components/
│   ├── SectorMindmapView.tsx   # 핵심: D3 방사형 마인드맵 (신규)
│   ├── SectorDetailPanel.tsx   # 클릭 시 디테일 패널 (신규)
│   ├── SectorTabs.tsx          # 섹터 선택 탭 (기존 SectorTabs 재활용)
│   └── NodeBadge.tsx           # 티어 뱃지 (TierBadge 리팩토링)
└── index.ts

src/app/sector-analysis/
├── page.tsx                    # 서버 컴포넌트 래퍼
└── SectorAnalysisPageClient.tsx # 클라이언트 메인
```

---

## 7. 마이그레이션 플랜

### 7.1 삭제/이동 대상

| 파일 | 처리 |
|------|------|
| `src/app/value-chain/` | 삭제 (sector-analysis로 대체) |
| `src/features/value-chain/` | 삭제 (sector-analysis로 대체) |
| `docs/01-plan/features/value-chain.*` | 보존 (히스토리 유지) |

### 7.2 SideNav 변경

```typescript
// 변경 전
{ href: '/value-chain', label: 'Value Chain' }

// 변경 후
{ href: '/sector-analysis', label: '섹터 분석' }
```

### 7.3 /value-chain → /sector-analysis 리다이렉트
- `next.config.js` redirects 추가 (기존 북마크 유저 고려)

---

## 8. 성공 기준

| 기준 | 검증 방법 |
|------|---------|
| 방사형 그래프 렌더링 | `/sector-analysis` 접속 → SVG 노드 표시 확인 |
| 노드 겹침 없음 | 각 링 노드 간격 균등 분배 시각 확인 |
| hover 하이라이트 | 노드 hover 시 `#3B82F6` 강조 확인 |
| 클릭 디테일 패널 | 노드 클릭 → 패널 표시 확인 |
| 줌/팬 | 마우스 휠/드래그 동작 확인 |
| 모바일 방사형 유지 | 375px 뷰포트에서 그래프 렌더링 확인 |
| DisclaimerBanner | 페이지 하단 표시 확인 |
| TypeScript 오류 | `npx tsc --noEmit` 결과 0건 |
| `/value-chain` 리다이렉트 | 구 URL → 신 URL 자동 이동 확인 |

---

## 9. 비기능 요구사항

| 항목 | 기준 |
|------|------|
| 초기 렌더링 | 200ms 이내 SVG 출력 |
| 노드 수 한도 | 최대 50개 노드 (성능 보장) |
| 접근성 | 핵심 노드에 aria-label 적용 |
| 구독 플랜 | `checkSubscription` 미들웨어 연결 유지 |
| DisclaimerBanner | 유지 필수 |
