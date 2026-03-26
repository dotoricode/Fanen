# Plan: value-chain-redesign v0.0.1

## 메타데이터
- Feature: value-chain-redesign
- Sprint: 12
- Phase: Plan → Design → Do → Check
- 작성일: 2026-03-26
- 작성자: CTO Lead

---

## 1. 목표 (Objective)

사이드바의 '섹터 분석'과 '섹터 연결망' 두 메뉴를 **'섹터 연결망' 하나로 통폐합**하고,
기존 방사형 마인드맵을 **다차원 Node-Link 다이어그램**으로 전면 재설계한다.
PRD Feature 2(Value Chain Tier 1~3 자동 발굴)의 시각화 요구사항을 완성한다.

---

## 2. 현황 분석

### 2.1 기존 메뉴 구조
| 메뉴 | URL | 컴포넌트 | 처리 |
|------|-----|---------|------|
| 섹터 분석 | `/sector` | `SectorMapSection` (Force Graph) | **삭제** |
| 섹터 연결망 | `/sector-analysis` | `SectorMindmapView` (Radial Mindmap) | **재설계** |

### 2.2 삭제 대상 파일
- `src/app/sector/page.tsx`
- `src/features/sector-map/` 전체 디렉토리

### 2.3 유지·재활용 파일
- `src/app/sector-analysis/page.tsx` — 서버 컴포넌트 구조 유지
- `src/app/sector-analysis/SectorAnalysisPageClient.tsx` — 대폭 리팩토링
- `src/features/sector-analysis/types.ts` — ValueChain/ValueChainNode 타입 유지
- `src/features/sector-analysis/hooks/useSectorAnalysis.ts` — 그대로 유지
- `src/features/sector-analysis/mock/mockSectorData.ts` — 그대로 유지
- `src/features/sector-analysis/components/SectorDetailPanel.tsx` — 글라스모피즘 스타일 업데이트
- `src/components/common/SideNav.tsx` — 메뉴 1개 제거

---

## 3. 요구사항

### 3.1 기능 요구사항 (FR)
| ID | 요구사항 | 우선순위 |
|----|---------|--------|
| FR-01 | 사이드바에서 '섹터 분석' 메뉴 제거, '섹터 연결망'만 유지 | P0 |
| FR-02 | `/sector` 페이지 및 `sector-map` feature 코드 삭제 | P0 |
| FR-03 | 중앙 섹터 → Tier 1(직접납품) → Tier 2(부품/소재) → Tier 3(물류/MRO) 다방향 Node-Link 다이어그램 | P0 |
| FR-04 | '전체 뷰' (모든 섹터 연결망) / '상세 뷰' (단일 섹터 깊이 탐색) 토글 | P0 |
| FR-05 | 라이트/다크 모드 완벽 지원 | P0 |
| FR-06 | 노드 등장 시 중앙→외곽 Stagger 애니메이션 | P1 |
| FR-07 | 엣지 위 Animated Beam (실버 빛 흐름) | P1 |
| FR-08 | Hover 시 연결 노드 강조, 비연결 노드 Dim + Spring Physics | P1 |

### 3.2 비기능 요구사항 (NFR)
| ID | 요구사항 |
|----|---------|
| NFR-01 | 무채색(Achromatic) + Glassmorphism 디자인 |
| NFR-02 | framer-motion + SVG 애니메이션 활용 |
| NFR-03 | 모바일 반응형 (줌/팬 지원) |
| NFR-04 | Value Chain 조회 < 2초 (PRD 성능 기준) |

---

## 4. 기술 결정 (Architecture Decisions)

### 4.1 시각화 엔진: D3 Force Simulation (기존 방식 유지)
**결정**: `d3-force`를 그대로 사용하되, 레이아웃을 `forceSimulation` 기반으로 전환
- 기존 `buildMindMapLayout`은 정적 각도 계산 → 노드 겹침 발생
- `d3.forceSimulation` + `forceLink` + `forceCollide` + `forceRadial`로 자연스러운 배치

**레이아웃 전략**:
```
중앙 노드 (tier -1): fx=0, fy=0 고정
Tier 0: forceRadial(r=120) — 섹터 내 메이저 기업
Tier 1: forceRadial(r=220) — 직접 납품 기업
Tier 2: forceRadial(r=320) — 부품/소재 기업
Tier 3: forceRadial(r=410) — 물류/MRO 기업
```

### 4.2 애니메이션 전략
- **Stagger**: framer-motion `useAnimate` + `staggerChildren` 0.04s
- **Animated Beam**: SVG `<animateMotion>` + `stroke-dashoffset` CSS animation
- **Spring Hover**: framer-motion `useSpring` + `scale` + `opacity`

### 4.3 뷰 모드 전환
- **전체 뷰**: 모든 활성 섹터의 대표 노드(Tier 0만)를 하나의 Force Simulation에 표시, 섹터 간 연결 표현
- **상세 뷰**: 단일 섹터 선택 시 Tier 0~3 전체 계층 표시 (현재 방식 개선)
- 토글 위치: 페이지 우상단 `SegmentedControl` 컴포넌트

---

## 5. 구현 범위 (Do Phase 태스크 분배)

### 5.1 frontend-dev
- `SideNav.tsx`: `/sector` 항목 제거
- `src/app/sector/page.tsx` 삭제
- `src/features/sector-map/` 디렉토리 삭제
- `SectorAnalysisPageClient.tsx`: 전체 뷰/상세 뷰 토글 UI 추가, 글라스모피즘 스타일 적용
- `src/app/sector-analysis/page.tsx`: 헤더 + DisclaimerBanner 글라스모피즘 스타일 업데이트
- CSS 변수 확인 및 라이트/다크 완벽 지원

### 5.2 d3-expert
- `SectorMindmapView.tsx` → `ValueChainDiagram.tsx`로 전면 재작성
  - D3 forceSimulation 기반 레이아웃
  - 전체 뷰 / 상세 뷰 모드 각각 구현
  - Tier별 색상/크기 차별화 (무채색 팔레트)
  - Hover 연결 강조 로직 개선

### 5.3 animation-dev
- Stagger 등장 애니메이션 (framer-motion AnimatePresence)
- Animated Beam SVG animation (엣지 실버 흐름)
- Spring Physics Hover (framer-motion useSpring)
- 섹터 탭/뷰 전환 시 부드러운 트랜지션

---

## 6. 의존성 확인

```json
{
  "framer-motion": "이미 설치됨 (SideNav에서 사용 중)",
  "d3": "이미 설치됨 (SectorMindmapView에서 사용 중)"
}
```
추가 패키지 설치 불필요.

---

## 7. 체크리스트 (완료 기준)

- [ ] SideNav에서 '섹터 분석' 메뉴 제거됨
- [ ] `/sector` 페이지 접근 시 404 또는 `/sector-analysis`로 리다이렉트
- [ ] sector-map feature 코드 완전 삭제
- [ ] Node-Link 다이어그램: 중앙→Tier 3까지 다방향 표시
- [ ] 전체 뷰 / 상세 뷰 토글 동작
- [ ] 라이트 모드: 흰 배경 + 투명 유리 노드
- [ ] 다크 모드: 검정 배경 + 투명 유리 노드
- [ ] Stagger 등장 애니메이션 동작
- [ ] Animated Beam 엣지 동작
- [ ] Hover spring 강조 동작
