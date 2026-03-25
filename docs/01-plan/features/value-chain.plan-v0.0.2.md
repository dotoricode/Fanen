# Value Chain 분석 — Plan Document

> 버전: v0.0.2
> 작성일: 2026-03-25
> 이전 버전: value-chain.plan-v0.0.1.md
> 변경 이유: v0.0.1에서 d3-sankey 미설치로 계층 리스트로 대체된 ValueChainView를 Sankey 다이어그램으로 교체

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | v0.0.1의 `ValueChainView.tsx`가 d3-sankey 미설치로 인해 단순 계층 리스트로 구현됨. 흐름(flow)이 시각적으로 표현되지 않아 "숨은 수혜주 발굴" 핵심 UX가 약함. |
| **Solution** | d3-sankey v0.12.3(설치 완료)를 사용해 Sankey 다이어그램으로 교체. 이벤트 → 섹터 → T0 → T1 → T2 → T3 흐름을 선 두께로 표현. |
| **Function UX Effect** | 노드 연결선 두께 = 연관도 강도. 클릭 시 CompanyCard 팝업. 모바일(<768px)은 계층 리스트 유지(반응형). |
| **Core Value** | 투자 체인의 흐름이 한눈에 보여 "이 이벤트가 어디까지 영향을 미치는지" 직관적으로 전달. |

---

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 설계 문서에서 약속한 Sankey 다이어그램을 실제로 구현. d3-sankey 설치 완료로 차선책 제거. |
| **WHO** | 동일 (테마/트렌드 투자 관심 사용자) |
| **RISK** | SSR 이슈 → 'use client' 컴포넌트이므로 문제 없음. SVG 크기 계산이 동적이므로 useRef + ResizeObserver 필요. |
| **SUCCESS** | Sankey 다이어그램 렌더링 오류 0건, 모바일 fallback 계층 리스트 정상 동작, TS 오류 0건 |
| **SCOPE** | `ValueChainView.tsx` 1개 파일만 수정. Design 문서 v0.0.2 업데이트. |

---

## 1. 패키지 확인 (설치 완료)

```bash
# 설치 완료 확인
npm list d3-sankey    # → d3-sankey@0.12.3 ✅
npm list @types/d3-sankey  # → @types/d3-sankey ✅
```

## 2. 구현 범위

### 수정 파일 (1개)

```
src/features/value-chain/components/ValueChainView.tsx
  현재: 계층 리스트 UI
  변경: D3 Sankey 다이어그램 (데스크톱) + 계층 리스트 (모바일 fallback)
```

### Sankey 구현 스펙

**노드 구성** (왼쪽 → 오른쪽):
```
[이벤트] → [섹터] → [T0 메이저 × 2] → [T1 직접납품 × 2] → [T2 부품소재 × 2] → [T3 간접수혜 × 2]
```

**링크 두께**: 기본값 동일 (v0.0.1), 향후 연관도 수치로 조정 가능하도록 `value` 필드 확장 예정.

**노드 색상**:
- T0: `#0D9488` (teal — BINAH primary)
- T1: `#3B82F6` (blue)
- T2: `#8B5CF6` (purple)
- T3: `#64748B` (slate)

**인터랙션**:
- 노드 hover: 툴팁 (티커 + 기업명)
- 노드 클릭: `selectedNode` 상태 → CompanyCard 표시 (기존 유지)

**SVG 컨테이너**:
- `useRef` + `ResizeObserver`로 반응형 너비
- 높이: 400px 고정
- `viewBox` 사용하지 않고 실제 px로 계산

**반응형**:
- `window.innerWidth < 768` → 기존 계층 리스트 렌더링

**코드 구조**:
```tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
// ... ValueChainNode → SankeyNode 변환 로직
```

## 3. 성공 기준

| 기준 | 검증 방법 |
|------|---------|
| Sankey SVG 렌더링 | 브라우저에서 /value-chain 접속 확인 |
| 노드 클릭 → CompanyCard | 클릭 이벤트 동작 확인 |
| 모바일 fallback | width < 768px 시 계층 리스트 표시 |
| TypeScript 오류 | `npx tsc --noEmit` 결과 0건 |
| 콘솔 오류 | 없음 |
