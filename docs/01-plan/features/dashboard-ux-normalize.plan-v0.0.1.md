# Plan: dashboard-ux-normalize v0.0.1

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | 무채색 미니멀리즘 개편 후 비나 맵에서 세계 지도 실루엣이 사라지고 퀵 메뉴가 추상적 원형 노드로만 구성되어 어포던스(Affordance)를 상실했다 |
| **Solution** | 비나 맵에 TopoJSON 세계 지도 실루엣을 복구하고, HubMenu 위성 노드를 아이콘·제목·설명이 있는 카드 버튼으로 전환하여 직관성을 회복한다 |
| **Functional UX Effect** | 처음 방문한 사용자도 지도를 보고 "세계 정세 시각화"를 즉시 인식하고, 퀵 메뉴의 각 링크가 무엇인지 텍스트로 파악 가능 |
| **Core Value** | 미니멀리즘과 기능성의 균형 — 시각적 단순함은 유지하되 정보의 맥락과 탐색 단서를 복원 |

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 미니멀 리디자인이 어포던스를 희생시켜 신규 사용자 이탈 위험 증가 |
| **WHO** | 20~60대 일반 투자자 (정보 소외 계층), 첫 방문 사용자 |
| **RISK** | TopoJSON 라이브러리 미설치, SVG/HTML 하이브리드 복잡도 증가 |
| **SUCCESS** | 세계 지도 실루엣 표시, 퀵 메뉴 카드에서 제목+설명 텍스트 확인 가능 |
| **SCOPE** | BinahMapLite.tsx, HubMenu.tsx, binah.prd.md (section 13.3만) |

## 1. 요구사항

### 1.1 기능 요구사항

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-01 | BinahMapLite에 세계 지도 대륙 실루엣 표시 (`fill-zinc-100 dark:fill-zinc-800/50`) | P0 |
| FR-02 | GeoEvent 핀 hover 시 제목·설명 툴팁 표시 | P0 |
| FR-03 | HubMenu 위성 노드를 아이콘 + 제목 + 설명 카드 버튼으로 교체 | P0 |
| FR-04 | 카드 버튼 hover 시 테두리·그림자 강조 (affordance 시각화) | P1 |
| FR-05 | PRD section 13.3 비기능 요구사항에 어포던스 원칙 행 추가 | P1 |

### 1.2 비기능 요구사항

- TopoJSON 데이터 로드: 지도 초기 표시 < 1초 (캐싱)
- HubMenu 애니메이션: 기존 BeamParticle, Bézier 연결선 유지
- 접근성: 카드 버튼에 `aria-label` 추가
- 무채색 테마 유지: zinc 팔레트만 사용

## 2. 범위

### In Scope
- `src/features/binah-map/components/BinahMapLite.tsx` — 세계 지도 + 툴팁
- `src/features/dashboard/components/HubMenu.tsx` — 카드 버튼 위성 노드
- `docs/00-pm/binah.prd.md` — section 13.3 affordance 행 추가

### Out of Scope
- D3 geoPath 완전 전환 (equirectangular 수식 유지)
- 세계 지도 국가 단위 상세 데이터
- HubMenu 연결선/BeamParticle 변경
- 기타 페이지 UX 변경

## 3. 기술 제약

- `topojson-client` 패키지 미설치 → 설치 필요 (`--legacy-peer-deps`)
- `world-110m.json` TopoJSON 데이터 없음 → `public/` 에 추가 필요
- HubMenu: SVG 내부에서 HTML 버튼 → `<foreignObject>` 또는 SVG rect 기반 카드
- framer-motion v12: ease string 금지, `r` keyframe NaN 주의 (이미 fix됨)

## 4. 성공 기준

- [ ] 비나 맵에 대륙 실루엣 렌더링 (light/dark 모두)
- [ ] GeoEvent 핀 hover → 제목 표시 (최소 1줄)
- [ ] HubMenu 각 노드에 한글명 + 영문 설명 텍스트 표시
- [ ] hover 시 border/shadow 변화 확인
- [ ] TypeScript 빌드 에러 없음
- [ ] PRD 13.3에 affordance 행 추가 확인

## 5. 구현 순서

1. `topojson-client` 설치
2. `public/world-110m.json` 추가
3. `BinahMapLite.tsx` 세계 지도 + 툴팁
4. `HubMenu.tsx` 카드 버튼 리팩토링
5. `binah.prd.md` section 13.3 업데이트
