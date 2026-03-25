# Sprint 10 UI 전면 개편 (UI Overhaul) — Planning Document

> **Summary**: 파낸(Fanen) 브랜드 전환 및 UI 전면 개편으로 BINAH 완전 출시 준비 — 데스크톱 SideNav, 반디 레일 애니메이션, 비나 맵 FLAT 투영, Value Chain 방사형 마인드맵, 필터 시각화 개선, 복리 시뮬레이션, 컬러 시스템 통일을 포함한 9개 구현 항목의 계획 문서
>
> **Project**: BINAH (파낸 / Fanen)
> **Version**: 0.0.1
> **Author**: PM Agent
> **Date**: 2026-03-26
> **Status**: Draft

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | Sprint 9 완료 시점에서 UI가 모바일 전용 BottomNav에만 의존하고 있어 데스크톱 사용자의 탐색성이 낮으며, 컬러 시스템(slate/blue)이 BINAH 브랜드 정체성과 불일치한다. 비나 맵은 3D 투영 비율 오류로 지도 왜곡이 발생했고, Value Chain은 D3 Sankey 다이어그램의 복잡도가 일반 투자자 이해를 저해하며, 배당 시뮬레이션은 단기(1년) 기준만 제공되어 복리 효과를 체감하기 어렵다. |
| **Solution** | (1) 데스크톱 SideNav 9개 메뉴 추가 및 모바일/데스크톱 레이아웃 분리, (2) HubMenu 반디 레일 애니메이션 재설계, (3) 비나 맵 FLAT 투영 비율 수정 + 3D 토글 복원 + "세계정세" 레이블 교체, (4) Value Chain D3 Sankey 제거 후 방사형 마인드맵 전환, (5) 뉴스/시그널 필터 시각적 분리 재설계, (6) 투자 스타일 필터 탭(PRD S3.2), (7) 10/20/30년 복리 시뮬레이션(PRD S3.1), (8) BINAH 브랜드 파낸→파낸 전면 전환, (9) 전역 zinc 컬러 시스템 통일. |
| **Function/UX Effect** | 데스크톱 사용자의 탐색 단계 단축(BottomNav 의존 해소), 반디 캐릭터 존재감 강화로 재방문 동기 제고, 비나 맵 지도 정확도 회복, Value Chain 인지 부하 감소(Sankey → 마인드맵), 복리 시뮬레이션 시각화로 배당 투자 의사결정 지원 강화. |
| **Core Value** | "반디가 찾은 오늘의 기회, 당신의 내일이 빛나도록" — 브랜드·UI·데이터 시각화를 BINAH 정체성으로 완전 통일하여 정보 소외 계층의 진입 장벽 제거. |

---

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | Sprint 9까지 기능 구현 중심으로 진행된 결과, 브랜드(파낸→BINAH) 전환이 미완 상태이고 UI 일관성(컬러·레이아웃·컴포넌트 언어)이 확보되지 않았다. 데스크톱 사용성과 일반 투자자 이해 중심의 시각화가 BINAH 출시 전 반드시 선행되어야 한다. |
| **WHO** | 20~60대 일반 투자자(정보 소외 계층) — 모바일/PC 혼용 사용자, 금융 차트 비전문가, 배당·불로소득 목표 중심 투자자 |
| **RISK** | (1) SideNav 추가 시 기존 BottomNav와 레이아웃 충돌 가능성 / (2) Sankey 제거 시 value-chain 데이터 구조 변경에 따른 기존 소비자 컴포넌트 영향 / (3) zinc 컬러 전환 시 다크모드 렌더링 불일치 발생 가능성 / (4) 비나 맵 FLAT 투영 수치 미세 조정 공수 과소평가 |
| **SUCCESS** | TypeScript 오류 0건 · 데스크톱(1280px+) SideNav 렌더링 정상 · 비나 맵 FLAT/3D 토글 이상 없음 · Value Chain 방사형 마인드맵 방산/반도체/바이오 3개 테마 정상 렌더링 · 복리 시뮬레이션 10/20/30년 수치 정확성 검증 · zinc 컬러 다크모드 전체 페이지 통과 |
| **SCOPE** | Sprint 10 (현 스프린트): 9개 UI 개편 항목 완료 / Sprint 11: Value Chain Tier 1~3 데이터 연동 + 실데이터 배당 API / Sprint 12: 반디 고도화 + 백엔드 실데이터 교체 |

---

## 1. Overview

### 1.1 Purpose

Sprint 10 UI 전면 개편은 파낸(Fanen) 코드베이스를 BINAH 브랜드로 완전 전환하고, 데스크톱 사용성·시각화 품질·컬러 일관성을 확보하여 BINAH 공개 출시 준비를 완료하는 것을 목적으로 한다.

### 1.2 Background

Sprint 1~9는 기능(뉴스 분석, 섹터맵, 비나 맵, Value Chain, 배당 시뮬레이터, 모의투자, AI 코치) 구현에 집중했다. 브랜드 전환(BINAH 리브랜딩)은 Sprint 10에서 시작되었으나 UI 레이아웃·컬러·컴포넌트 언어가 혼재한 상태다. BINAH 출시 기준 충족을 위해 UI 전면 정비가 필요하다.

### 1.3 Related Documents

- PRD: `docs/00-pm/binah.prd.md` (v1.1, 2026-03-26)
  - S3.1 불로소득 목표 계산기 / 복리 시뮬레이션
  - S3.2 투자 성향별 포트폴리오 필터
- 기존 Plan: `docs/01-plan/binah.plan.md` (Sprint 10~12 스프린트 계획 원본)
- 관련 Feature Plans:
  - `docs/01-plan/features/value-chain.plan-v0.0.2.md`
  - `docs/01-plan/features/passive-income.plan-v0.0.1.md`
  - `docs/01-plan/features/dashboard-ux-normalize.plan-v0.0.1.md`

---

## 2. Scope

### 2.1 In Scope (구현 항목 전체)

- [x] **UI-01** feat(layout): 데스크톱 SideNav 추가 (9개 메뉴), 모바일/데스크톱 레이아웃 분리
- [x] **UI-02** feat(dashboard): HubMenu 반딧불이(반디) 레일 애니메이션 재설계
- [x] **UI-03** feat(map): 세계지도 FLAT 투영 비율 수정, 3D 토글 복원, HotZone → 세계정세 레이블
- [x] **UI-04** feat(value-chain): D3 Sankey 제거 → 방사형 마인드맵 + 비활성 카테고리 탭
- [x] **UI-05** feat(news): 섹터/영향도 필터 시각적 분리, 시그널 패널 재디자인
- [x] **UI-06** feat(portfolio): 투자 스타일 필터 탭 (PRD S3.2)
- [x] **UI-07** feat(dividend): 10/20/30년 복리 시뮬레이션 추가 (PRD S3.1)
- [x] **UI-08** refactor(branding): BINAH→파낸 전면 전환, 로고 슬로건 업데이트
- [x] **UI-09** refactor(colors): 전체 slate/blue → zinc 컬러 시스템 통일

### 2.2 Out of Scope

- Value Chain Tier 1~3 실데이터 API 연동 (→ Sprint 11)
- 반디 캐릭터 glowing mood 고도화 애니메이션 (→ Sprint 12)
- 배당 데이터 KRX/DART 실데이터 교체 (→ Sprint 12)
- 모닝 라이트 푸시 알림 시스템 (→ Sprint 12)
- 신규 기능 구현 (비나 맵 Full 드릴다운, 차트 해설) (→ Sprint 11)

---

## 3. Requirements

### 3.1 Functional Requirements — MoSCoW 우선순위

| ID | 항목 | 우선순위 | PRD 참조 | 상태 |
|----|------|:--------:|---------|------|
| FR-01 | 데스크톱(1280px+) SideNav: 대시보드·비나맵·섹터·뉴스·Value Chain·포트폴리오·배당·모의투자·AI 코치 9개 메뉴 | P0 Must | — | 구현 완료 |
| FR-02 | 모바일(<1280px) BottomNav 유지, 데스크톱 SideNav 와 레이아웃 충돌 없음 | P0 Must | — | 구현 완료 |
| FR-03 | HubMenu 반디 레일 애니메이션: 반딧불이 발광 pulse 이펙트 | P0 Must | — | 구현 완료 |
| FR-04 | 비나 맵 FLAT 투영: 위도/경도 왜곡 없는 Mercator 비율 수정 | P0 Must | S1.1 | 구현 완료 |
| FR-05 | 비나 맵 3D 토글: FLAT ↔ 3D Globe 전환 버튼 복원 | P0 Must | S1.1 | 구현 완료 |
| FR-06 | 비나 맵 레이블: "HotZone" → "세계정세" 한국어 레이블 교체 | P0 Must | S1.1 | 구현 완료 |
| FR-07 | Value Chain: D3 Sankey 다이어그램 제거, 방사형 마인드맵으로 교체 | P0 Must | S2.2 | 구현 완료 |
| FR-08 | Value Chain: 비활성 카테고리 탭 (방산/반도체/바이오 테마 탭 UI) | P0 Must | S2.2 | 구현 완료 |
| FR-09 | 뉴스 페이지: 섹터 필터와 영향도 필터 시각적 분리 (색상·위치·레이블) | P1 Should | — | 구현 완료 |
| FR-10 | 시그널 패널: 신호등(🟢🟡🔴) + 반디 멘트 카드 재디자인 | P1 Should | S4.1 | 구현 완료 |
| FR-11 | 포트폴리오 투자 스타일 필터 탭: 배당형/가치형/성장형/테마형/ETF안정형 | P0 Must | S3.2 | 구현 완료 |
| FR-12 | 배당 시뮬레이터 복리 시뮬레이션: 10년/20년/30년 기간 선택 및 복리 누적 차트 | P0 Must | S3.1 | 구현 완료 |
| FR-13 | 브랜딩 전환: 코드베이스 내 "파낸/Fanen/핀이/FinAI" 문자열 → "BINAH/비나/반디/Bandi" 교체 | P0 Must | — | 구현 완료 |
| FR-14 | 로고·슬로건 업데이트: "반디가 찾은 오늘의 기회, 당신의 내일이 빛나도록" | P0 Must | — | 구현 완료 |
| FR-15 | 전역 컬러 시스템: slate/blue → zinc 토큰으로 일괄 교체 (globals.css, tailwind.config) | P0 Must | — | 구현 완료 |
| FR-16 | 다크모드: zinc 컬러 기반 dark: 클래스 전체 페이지 적용 확인 | P0 Must | — | 구현 완료 |

### 3.2 Non-Functional Requirements

| 카테고리 | 기준 | 측정 방법 |
|----------|------|---------|
| 타입 안전성 | TypeScript 오류 0건 | `tsc --noEmit` 통과 |
| 성능 | 비나 맵 FLAT 초기 렌더링 < 1.5초 (LCP 기준) | Vercel Analytics / Lighthouse |
| 반응형 | SideNav 레이아웃 브레이크포인트 1280px 정확 적용 | Chrome DevTools 768/1024/1280/1440px |
| 접근성 | SideNav·탭·토글 ARIA 레이블 적용 | axe DevTools 스캔 |
| 브랜드 일관성 | "파낸/Fanen/핀이/FinAI" 문자열 잔존 0건 | `grep -r "파낸\|Fanen\|핀이\|FinAI" src/` 결과 0 |
| 면책 고지 | 신규/변경된 분석 페이지 DisclaimerBanner 표시 | 코드 리뷰 + 시각 확인 |

---

## 4. 구현 항목별 상세 (P0/P1/P2 분류)

### P0 — 반드시 완료 (Critical for BINAH 출시)

#### UI-01 / UI-02: 레이아웃 & 네비게이션

| 항목 | 변경 파일 | 요점 |
|------|----------|------|
| 데스크톱 SideNav | `src/app/layout.tsx`, `src/components/common/BottomNav.tsx` | `hidden lg:flex` / `flex lg:hidden` 분기 |
| 반디 레일 애니메이션 | `src/features/dashboard/DashboardHome.tsx`, `src/features/dashboard/components/HubMenu*` | CSS keyframe pulse + Tailwind `animate-pulse` 조합 |

#### UI-03: 비나 맵

| 항목 | 변경 파일 | 요점 |
|------|----------|------|
| FLAT 투영 수정 | `src/features/binah-map/components/BinahMapLite.tsx` | D3 geoMercator scaleExtent 재조정 |
| 3D 토글 복원 | `src/features/binah-map/components/GeoEventPanel.tsx` | toggle state + geoOrthographic 조건 분기 |
| 레이블 교체 | `src/features/binah-map/components/*.tsx` | "HotZone" → "세계정세" 문자열 교체 |

#### UI-04: Value Chain 시각화

| 항목 | 변경 파일 | 요점 |
|------|----------|------|
| Sankey 제거 | `src/features/value-chain/components/ValueChainView.tsx` | D3 Sankey import 제거, SVG 방사형 레이아웃으로 교체 |
| 방사형 마인드맵 | `src/features/value-chain/components/ValueChainView.tsx` | 중앙 메이저 종목 + 방사형 Tier 1/2/3 노드 배치 |
| 비활성 탭 UI | `src/features/value-chain/components/*.tsx` | 방산/반도체/바이오 탭 + disabled 스타일 |

#### UI-06 / UI-07: 포트폴리오 & 배당 (PRD S3.1, S3.2)

| PRD 항목 | 구현 항목 | 변경 파일 |
|---------|---------|----------|
| S3.2 투자 성향별 포트폴리오 | 포트폴리오 스타일 필터 탭 5종 | `src/features/dividend/components/PortfolioTypeFilter.tsx` |
| S3.1 불로소득 계산기 | 복리 시뮬레이션 10/20/30년 | `src/features/dividend/components/DividendSimulator.tsx`, `MonthlyETFSimulator.tsx` |

#### UI-08 / UI-09: 브랜딩 & 컬러

| 항목 | 변경 파일 | 요점 |
|------|----------|------|
| 브랜드 전환 | `src/features/landing/LandingPage.tsx`, `src/components/common/Header.tsx`, `src/components/common/BinahLogo.tsx`, `src/app/layout.tsx` | 텍스트 + SVG 로고 교체 |
| zinc 컬러 통일 | `src/app/globals.css`, Tailwind config, 전체 컴포넌트 | `slate-*` / `blue-*` → `zinc-*` 토큰 |

### P1 — 완료 권장 (UI 품질 기준 충족)

| 항목 | ID | 변경 파일 |
|------|----|---------|
| 뉴스 필터 시각적 분리 | UI-05 | `src/features/news-impact/components/NewsImpactList.tsx`, `NewsImpactCard.tsx` |
| 시그널 패널 재디자인 | UI-05 | `src/components/common/TrafficLightSignal.tsx`, `src/app/signal/page.tsx` |

### P2 — 향후 스프린트 (This Sprint 외)

| 항목 | 대상 Sprint |
|------|------------|
| Value Chain 실데이터 연동 (Tier 1~3 KRX/DART) | Sprint 11 |
| 반디 glowing mood 고도화 | Sprint 12 |
| 배당 실데이터 API 교체 | Sprint 12 |

---

## 5. PRD 참조 매핑

| PRD 항목 | Plan 구현 ID | 완료 여부 |
|---------|------------|:--------:|
| S1.1 비나 맵: 세계 지도 위 리스크/기회 시각화 | UI-03 | 완료 |
| S2.2 인터랙티브 Value Chain 시각화 | UI-04 | 완료 (방사형 마인드맵으로 구현) |
| S3.1 불로소득 목표 계산기 / 복리 시뮬레이션 | UI-07 | 완료 (10/20/30년) |
| S3.2 투자 성향별 포트폴리오 필터 | UI-06 | 완료 |
| S4.1 반디 차트 해설 / 신호등 패널 | UI-05 (일부) | 시그널 패널 재디자인 완료, 차트 해설은 Sprint 11 |

---

## 6. Success Criteria — Definition of Done

### 6.1 필수 완료 기준 (Gate)

- [ ] `tsc --noEmit` — TypeScript 오류 0건
- [ ] `grep -r "파낸\|Fanen\|핀이\|FinAI" src/` — 잔존 문자열 0건
- [ ] 데스크톱(1280px) SideNav 9개 메뉴 렌더링 정상, 모바일(375px) BottomNav 렌더링 정상
- [ ] 비나 맵 FLAT/3D 토글 전환 오류 없음, "세계정세" 레이블 표시 확인
- [ ] Value Chain 방사형 마인드맵 — 방산/반도체/바이오 3개 테마 탭 렌더링 정상
- [ ] 포트폴리오 투자 스타일 필터 탭 5종 (배당형/가치형/성장형/테마형/ETF안정형) 작동 확인
- [ ] 배당 복리 시뮬레이션 10년/20년/30년 수치 및 차트 정상 출력
- [ ] 전체 신규/변경 페이지 zinc 다크모드 렌더링 이상 없음
- [ ] 분석 결과 표시 페이지 DisclaimerBanner 렌더링 확인 (비나 맵, Value Chain, 시그널 페이지)

### 6.2 품질 기준

- [ ] ESLint 오류 0건 (`next lint`)
- [ ] 비나 맵 FLAT 초기 렌더링 1.5초 이내
- [ ] SideNav ARIA 레이블 적용 (axe DevTools 주요 항목 통과)
- [ ] 반디 레일 애니메이션 60fps 유지 (Chrome Performance 탭 확인)

---

## 7. Risks and Mitigation

| 위험 | 영향도 | 발생 가능성 | 완화 방안 |
|------|:------:|:----------:|---------|
| SideNav + BottomNav 레이아웃 충돌 | High | Medium | Tailwind `lg:` 브레이크포인트 단일 기준 적용, `hidden/flex` 분기 패턴 통일 |
| Sankey 제거로 인한 value-chain 소비 컴포넌트 영향 | High | Medium | 변경 전 grep으로 소비자 목록 확인, TypeScript 컴파일로 영향 범위 검증 |
| zinc 컬러 전환 시 다크모드 색상 불일치 | Medium | High | globals.css CSS 변수 기반 일괄 교체, dark: 클래스 전수 확인 체크리스트 작성 |
| 비나 맵 FLAT 투영 수치 미세 조정 공수 초과 | Medium | Medium | D3 geoMercator fitExtent 표준 패턴 적용, Mock 데이터 좌표 재검증 |
| 브랜딩 전환 누락 (grep 미포함 이미지/주석) | Low | Medium | `grep -r` 범위를 `src/` 전체 + `public/` OG 이미지 alt 텍스트까지 확장 |

---

## 8. Impact Analysis

### 8.1 변경된 주요 리소스

| 리소스 | 유형 | 변경 내용 |
|--------|------|---------|
| `src/app/layout.tsx` | UI Layout | SideNav 추가, 브랜드 메타데이터 BINAH 전환 |
| `src/components/common/BottomNav.tsx` | UI Component | 모바일 전용 분기 (`lg:hidden`) |
| `src/app/globals.css` | Style | zinc 컬러 CSS 변수 교체 |
| `src/features/value-chain/components/ValueChainView.tsx` | Feature Component | D3 Sankey 제거 → 방사형 SVG |
| `src/features/binah-map/components/BinahMapLite.tsx` | Feature Component | FLAT 투영 수정 |
| `src/features/binah-map/components/GeoEventPanel.tsx` | Feature Component | 3D 토글 복원 |
| `src/features/dividend/components/DividendSimulator.tsx` | Feature Component | 10/20/30년 복리 시뮬레이션 추가 |
| `src/features/dividend/components/PortfolioTypeFilter.tsx` | Feature Component | 투자 스타일 필터 탭 신규 |
| `src/components/common/TrafficLightSignal.tsx` | UI Component | 시그널 패널 재디자인 |

### 8.2 영향 범위 (소비자 컴포넌트)

| 변경 리소스 | 소비 경로 | 영향 |
|------------|---------|------|
| `ValueChainView.tsx` (Sankey 제거) | `src/app/value-chain/page.tsx` → `ValueChainPageClient.tsx` | 검증 필요 — props 인터페이스 변경 여부 확인 |
| `BinahMapLite.tsx` (투영 변경) | `src/features/dashboard/components/MorningBriefCard.tsx` (Lite 임베드) | 검증 필요 — width/height prop 재확인 |
| `globals.css` (zinc 전환) | 전체 페이지 / 컴포넌트 — Tailwind purge 대상 전부 | 렌더링 전수 확인 필요 |
| `BottomNav.tsx` (lg:hidden) | `src/app/layout.tsx` | Breaking 없음 — 조건부 렌더링만 추가 |
| `TrafficLightSignal.tsx` (재디자인) | `src/app/signal/page.tsx`, 뉴스 카드 컴포넌트 | 검증 필요 — 색상 클래스 변경 |

### 8.3 검증 체크리스트

- [ ] `ValueChainView` 소비자 컴포넌트 props 호환성 확인
- [ ] `BinahMapLite` 임베드 위치 width/height 정상 확인
- [ ] zinc 컬러 전환 후 전체 페이지 시각 회귀 없음 확인
- [ ] `TrafficLightSignal` 소비자 컴포넌트 색상/크기 정상 확인

---

## 9. Architecture Considerations

### 9.1 Project Level

| Level | 선택 여부 |
|-------|:--------:|
| Starter | ☐ |
| Dynamic (Feature-based modules) | ✅ |
| Enterprise | ☐ |

기존 `src/features/` 기반 Dynamic 레벨을 유지한다. Sprint 10 UI 개편은 신규 레이어 도입 없이 기존 feature 단위 내에서 컴포넌트 교체/추가만 수행한다.

### 9.2 핵심 아키텍처 결정

| 결정 | 선택 | 근거 |
|------|------|------|
| 네비게이션 분기 | Tailwind `lg:` 브레이크포인트 + `hidden/flex` | 빌드 타임 CSS 분기로 JS 렌더링 부하 없음 |
| Value Chain 시각화 | 방사형 SVG (D3 force-free) | Sankey 대비 일반 투자자 인지 부하 감소, D3 의존성 최소화 |
| 컬러 시스템 | CSS 변수 + Tailwind 토큰 이중 레이어 | globals.css 변수 교체로 전역 일괄 적용 가능 |
| 복리 시뮬레이션 | 클라이언트 사이드 순수 계산 (no API) | 실데이터 연동 전 Mock 기반, Railway API 불필요 |

---

## 10. Convention Prerequisites

### 10.1 CLAUDE.md 원칙 준수 확인

- [ ] 신규/변경 분석 페이지에 `DisclaimerBanner` 컴포넌트 임포트 및 렌더링 확인
  - 대상: 비나 맵 페이지, Value Chain 페이지, 시그널 페이지
- [ ] AI 분석 결과 표시 영역에 `AiBadge` 표시 확인
  - 대상: Value Chain 방사형 마인드맵 결과, 시그널 패널
- [ ] `lib/plans.ts` 구독 플랜 상수 참조 방식 유지 (하드코딩 금지)
- [ ] 민감 데이터 처리 경로 변경 없음 확인 (Railway FastAPI 유지)

### 10.2 환경 변수 변경 없음

Sprint 10 UI 개편은 기존 환경 변수를 그대로 사용한다. 신규 환경 변수 없음.

---

## 11. Next Steps

1. [ ] CTO(팀 리드) Plan 문서 승인
2. [ ] Design 문서 작성 (`sprint10-ui-overhaul.design.md`) — SideNav 컴포넌트 설계, 방사형 마인드맵 SVG 레이아웃 명세
3. [ ] Impact Analysis 8.3 체크리스트 수행 (변경 리소스 소비자 검증)
4. [ ] Definition of Done 6.1 체크리스트 전수 확인
5. [ ] Sprint 11 Plan 작성 시작 — Value Chain 실데이터 연동, 차트 해설 기능

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.0.1 | 2026-03-26 | 초안 작성 — Sprint 10 구현 9개 항목 기반 Plan 문서 | PM Agent |
