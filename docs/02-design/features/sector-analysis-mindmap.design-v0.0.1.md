# 섹터 분석 마인드맵 — Design Document

> 버전: v0.0.1
> 작성일: 2026-03-26
> Plan 참조: docs/01-plan/features/sector-analysis-mindmap.plan-v0.0.1.md
> 아키텍처: Option C — Pragmatic Balance

---

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | Value Chain Sankey → 섹터 분석 방사형 마인드맵. 모노크롬 다크 팔레트로 Fintech 톤 달성. |
| **WHO** | 섹터 생태계 관계 탐색 투자자 |
| **RISK** | 기존 SVGMindMap 로직 재활용 가능 — 색상 시스템만 교체. zoom/pan 추가 시 framer-motion과 d3.zoom 충돌 가능성. |
| **SUCCESS** | 방사형 그래프 렌더링 오류 0건, 모노크롬 팔레트 완전 적용, zoom/pan 동작, 모바일 방사형 유지 |
| **SCOPE** | value-chain 폴더 → sector-analysis rename + 색상 시스템 교체 + zoom/pan 추가 + 모바일 fallback 제거 |

---

## 1. 아키텍처 옵션 비교

| 항목 | Option A (최소 변경) | Option B (완전 재작성) | Option C (Pragmatic) ✅ |
|------|---------------------|----------------------|------------------------|
| 설명 | 파일명·색상만 변경 | 새 컴포넌트 전체 신규 작성 | 기존 로직 재활용 + 색상·기능 교체 |
| 복잡도 | 낮음 | 높음 | 중간 |
| 유지보수 | 기존 코드 구조 유지 | 깔끔한 구조 | 기존 패턴 유지 |
| 작업량 | 소 (~150줄) | 대 (~800줄) | 중 (~300줄) |
| 위험도 | 낮음 | 높음 (regression) | 낮음 |
| **선택** | — | — | **✅ 채택** |

**선택 이유**: 기존 `buildMindMapLayout()` 레이아웃 알고리즘과 SVGMindMap 구조가 이미 요구 스펙과 일치. 색상 시스템·zoom/pan·모바일 처리만 교체하면 충분.

---

## 2. 변경 범위 (파일 레벨)

### 2.1 신규 생성

```
src/features/sector-analysis/
├── types.ts                        # value-chain/types.ts 복사 (ValueChain/Node 타입 유지)
├── mock/
│   └── mockSectorData.ts           # mockValueChains.ts 복사 + 네이밍 변경
├── hooks/
│   └── useSectorAnalysis.ts        # useValueChain.ts → import 경로만 변경
├── components/
│   ├── SectorMindmapView.tsx       # ValueChainView.tsx 리팩토링 (핵심)
│   └── SectorDetailPanel.tsx       # CompanyCard + 상세 정보 (기존 CompanyCard 재활용)
└── index.ts

src/app/sector-analysis/
├── page.tsx                        # ValueChainPage 내용 변경
└── SectorAnalysisPageClient.tsx    # ValueChainPageClient 리팩토링
```

### 2.2 삭제

```
src/app/value-chain/               # 전체 삭제
src/features/value-chain/          # 전체 삭제
```

### 2.3 수정

```
src/components/common/SideNav.tsx   # /value-chain → /sector-analysis, 레이블 변경
next.config.js                      # /value-chain → /sector-analysis redirect 추가
```

---

## 3. 색상 시스템 교체

### 3.1 기존 → 신규 매핑

| 역할 | 기존 | 신규 |
|------|------|------|
| 중앙 노드 fill | `#0D9488` (teal) | `#F9FAFB` |
| 중앙 노드 텍스트 | `#FFFFFF` | `#111111` |
| T0 stroke | `#0D9488` | `#3B82F6` |
| T1 stroke | `#0D9488` | `#9CA3AF` |
| T2 stroke | `#F59E0B` (amber) | `#374151` |
| T3 stroke | `#F43F5E` (rose) | `#374151` |
| 노드 fill (다크) | `#18181B` (zinc-900) | `#1F2937` |
| 노드 fill (라이트) | `#FFFFFF` | `#F9FAFB` |
| 엣지 | teal/amber/rose | `#374151` (단일) |
| hover accent | amber `#F59E0B` | `#3B82F6` |
| 레이블 | zinc-400/600 | `#9CA3AF` |

### 3.2 색상 상수 구조

```typescript
// SectorMindmapView.tsx 상수
const PALETTE = {
  bg: '#1F2937',
  centerFill: '#F9FAFB',
  centerText: '#111111',
  nodeFillDark: '#1F2937',
  nodeFillLight: '#F9FAFB',
  nodeStroke: {
    center: '#F9FAFB',
    tier0: '#3B82F6',   // accent — 중요 섹터
    tier1: '#9CA3AF',   // 연관 섹터
    tier2: '#374151',   // 기업
    tier3: '#374151',   // 공급사
  },
  edge: '#374151',
  edgeOpacity: 0.3,
  hover: '#3B82F6',
  label: '#9CA3AF',
} as const;
```

---

## 4. zoom/pan 설계

### 4.1 구현 방법

d3.zoom을 SVG ref에 적용. framer-motion 충돌 방지를 위해 `<g transform>` 방식 사용.

```typescript
// SVG 구조
<svg ref={svgRef} ...>
  <g ref={gRef}>  {/* zoom transform 적용 대상 */}
    {/* edges */}
    {/* nodes */}
  </g>
</svg>

// useEffect에서 d3.zoom 등록
useEffect(() => {
  if (!svgRef.current || !gRef.current) return;
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.3, 3])
    .on('zoom', (event) => {
      d3.select(gRef.current).attr('transform', event.transform.toString());
    });
  d3.select(svgRef.current).call(zoom);
  return () => { d3.select(svgRef.current).on('.zoom', null); };
}, []);
```

### 4.2 framer-motion 충돌 방지

- `motion.g` → 일반 `<g>` 교체 (zoom transform과 motion transform 충돌 방지)
- 노드 애니메이션은 CSS transition으로 대체 (`transition: opacity 0.3s, transform 0.2s`)
- 엣지 draw 애니메이션: SVG `strokeDashoffset` CSS animation 유지

### 4.3 모바일 터치 지원

d3.zoom은 기본적으로 터치 이벤트(pinch) 지원. 별도 처리 불필요.

```typescript
// 모바일 터치 zoom 활성화 (d3.zoom 기본 동작)
zoom.touchable(() => true);
```

---

## 5. 모바일 처리

### 5.1 TierList fallback 제거

기존 `isMobile` 분기 + `TierList` 컴포넌트 완전 삭제.

```typescript
// 제거 대상
const [isMobile, setIsMobile] = useState(false);
useEffect(() => { ... window.addEventListener('resize', check) ... }, []);
// TierList 컴포넌트 전체

// 대체: 항상 SVGMindMap 렌더링, 모바일에서는 초기 zoom scale 축소
const MOBILE_INITIAL_SCALE = window.innerWidth < 768 ? 0.65 : 1;
```

### 5.2 모바일 컨테이너

```typescript
// 모바일에서 높이 자동 조정
style={{ height: isMobileWidth ? containerSize * 0.85 : containerSize }}
```

---

## 6. 컴포넌트 상세 설계

### 6.1 SectorMindmapView.tsx (핵심)

```
Props: { chain: ValueChain }
State:
  - selectedNode: ValueChainNode | null
  - hoveredId: string | null
  - tooltip: TooltipState | null
  - containerSize: number
  - isDark: boolean
Refs:
  - containerRef: HTMLDivElement
  - svgRef: SVGSVGElement     ← 신규 (d3.zoom용)
  - gRef: SVGGElement          ← 신규 (zoom transform 적용)

레이아웃 알고리즘: buildMindMapLayout() 유지 (변경 없음)
색상: PALETTE 상수로 일원화
줌/팬: d3.zoom (useEffect)
애니메이션: CSS transition (framer-motion 제거)
```

### 6.2 SectorDetailPanel.tsx

기존 `CompanyCard.tsx` 패턴 재활용. 우측 슬라이드인 패널.

```
Props: { node: ValueChainNode | null; onClose: () => void }
위치: 절대 위치, 그래프 컨테이너 우측
크기: w-72, h-auto
애니메이션: CSS transition translateX
```

### 6.3 SectorAnalysisPageClient.tsx

`ValueChainPageClient.tsx`와 동일 구조. 변경 사항:
- import 경로: `@/features/sector-analysis/...`
- URL: `/sector-analysis?sector=...`
- 라우터: `router.replace('/sector-analysis?sector=...')`

---

## 7. SideNav 변경

```typescript
// 변경 전
{ href: '/value-chain', label: '수혜 기업 연결망', icon: LinkIcon }

// 변경 후
{ href: '/sector-analysis', label: '섹터 분석', icon: LinkIcon }
```

---

## 8. next.config.js 리다이렉트

```javascript
// next.config.js
async redirects() {
  return [
    {
      source: '/value-chain',
      destination: '/sector-analysis',
      permanent: true,
    },
    {
      source: '/value-chain/:path*',
      destination: '/sector-analysis/:path*',
      permanent: true,
    },
  ];
},
```

---

## 9. 타입 변경

```typescript
// types.ts — 기존 타입 유지, 주석만 업데이트
/** 섹터 분석 티어 레벨 — 0=중심섹터, 1=연관섹터, 2=기업, 3=공급사 */
export type TierLevel = 0 | 1 | 2 | 3;

// ValueChain, ValueChainNode 타입명 유지 (API 호환성)
// 향후 SectorAnalysis로 alias 추가 가능
export type SectorData = ValueChain;
export type SectorNode = ValueChainNode;
```

---

## 10. 구독 플랜 & DisclaimerBanner

```typescript
// page.tsx에서 기존 방식 유지
import DisclaimerBanner from '@/components/common/DisclaimerBanner';
// checkSubscription 미들웨어 연결 유지 (기존 value-chain과 동일)
```

---

## 11. 구현 가이드

### 11.1 구현 순서

```
1. src/features/sector-analysis/ 폴더 생성 (types, mock, hooks 복사)
2. SectorMindmapView.tsx 작성 (ValueChainView 기반, 색상+zoom 변경)
3. SectorDetailPanel.tsx 작성
4. src/app/sector-analysis/ 페이지 작성
5. SideNav 링크 변경
6. next.config.js 리다이렉트 추가
7. src/app/value-chain/ + src/features/value-chain/ 삭제
8. TypeScript 검증 (npx tsc --noEmit)
```

### 11.2 주의사항

- `framer-motion` import 제거 후 CSS transition으로 대체
- d3.zoom과 SVG viewBox 좌표계 일치 확인 (transform origin)
- `DisclaimerBanner` 반드시 유지
- `checkSubscription` 미들웨어 연결 확인

### 11.3 Session Guide

| 모듈 | 파일 수 | 내용 |
|------|--------|------|
| module-1 | 4개 | sector-analysis feature 폴더 생성 (types, mock, hooks, index) |
| module-2 | 1개 | SectorMindmapView.tsx (핵심 컴포넌트) |
| module-3 | 1개 | SectorDetailPanel.tsx |
| module-4 | 2개 | App 페이지 (page.tsx + PageClient.tsx) |
| module-5 | 3개 | SideNav + next.config.js + 구 폴더 삭제 |
