# Plan: senior-mode-fix

> version: v0.0.1 | created: 2026-03-26 | phase: plan

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | Senior 모드 활성화 시 `<html>` 루트 font-size가 120% 증가하며 모든 rem 단위가 팽창, 사이드바 겹침 및 레이아웃 붕괴 |
| **Solution** | CSS 변수(--senior-font-scale) 기반 선택적 폰트 스케일링으로 전환, 사이드바 가변 너비·z-index 강화, 고정 height 제거 |
| **UX Effect** | Senior 모드 전환 후에도 레이아웃이 정상 유지되며 글씨만 크게 읽힘. 텍스트 명도 강화로 가독성 향상 |
| **Core Value** | 고령층·시력 약자 사용자가 레이아웃 깨짐 없이 편안하게 파낸 서비스를 이용 가능 |

## Context Anchor

| | |
|---|---|
| **WHY** | Senior 모드가 실질적으로 사용 불가능한 버그 수준의 레이아웃 파괴를 일으킴 |
| **WHO** | 20~60대 중 시력 약자, 고령 투자자 (파낸 핵심 타깃) |
| **RISK** | CSS 변수 변경이 기존 standard 모드 레이아웃에 영향을 줄 수 있음 |
| **SUCCESS** | Senior 모드 활성화 시 사이드바 겹침 0건, 텍스트 잘림 0건, 레이아웃 시각적 정상 유지 |
| **SCOPE** | `senior.css`, `zoom.css`, `UiModeSwitch.tsx`, `SideNav.tsx`, `globals.css` |

## 1. 문제 정의

### 1.1 현재 상태
- `UiModeSwitch`가 Senior 모드 시 `document.documentElement.classList.add('senior')` 실행
- `senior.css`의 `.senior { font-size: 120% }` 가 `<html>` 루트에 적용됨
- 루트 font-size 변경 → 모든 `rem` 단위 1.2배 팽창
- 결과: 사이드바(w-[220px] 고정 px)는 유지되나 내부 텍스트·아이콘이 넘쳐 겹침 발생
- 화면 전체가 "확대된 것처럼" 보이는 시각 효과

### 1.2 영향 범위
- `src/styles/senior.css` — 루트 font-size 변경 로직
- `src/styles/zoom.css` — 유사 패턴 (font-size: 150%)
- `src/components/common/SideNav.tsx` — 고정 너비, 고정 높이 영역
- `src/components/common/UiModeSwitch.tsx` — 클래스 토글 로직
- `src/app/globals.css` — CSS 변수 선언부

## 2. 요구사항

### FR-01: 강제 확대 로직 제거
- `.senior` 클래스에서 `font-size: 120%` (루트 변경) 제거
- `zoom.css`의 루트 font-size 패턴도 동일하게 정리

### FR-02: CSS 변수 기반 폰트 스케일링
- `html.senior` 에 `--senior-font-scale: 1.25` CSS 변수 선언
- `senior.css`의 각 요소별 font-size를 `calc(var(--senior-base) * var(--senior-font-scale))` 방식으로 변경
- 기존 standard 모드(`--senior-font-scale: 1`)와 완전 분리

### FR-03: 반응형 레이아웃 대응
- SideNav 너비: senior 모드 시 `w-[260px]` 으로 확대 (min-w 포함)
- 고정 높이(`h-[xx]`) 사용 컴포넌트를 `min-h-*` + `h-auto` 로 전환
- SideNav z-index를 `z-50` 으로 상향 (현재 z-40)
- 메인 컨텐츠 영역 left margin을 senior 모드 시 `ml-[260px]` 로 조정

### FR-04: 텍스트 명도 강화
- Senior 모드 시 `--text-secondary` 를 zinc-400(#a1a1aa) → zinc-700(#3f3f46) 로 강화
- muted-foreground 토큰도 동일하게 대비 강화

## 3. 비기능 요구사항
- Standard 모드 레이아웃 완전 무변경
- Tailwind purge-safe: 동적 클래스는 safelist 또는 전체 클래스명 사용
- 다크 모드에서도 Senior 모드 정상 동작

## 4. 성공 기준
- [ ] Senior 모드 활성화 시 사이드바 텍스트 잘림 없음
- [ ] Senior 모드 활성화 시 콘텐츠 영역이 사이드바와 겹치지 않음
- [ ] 글씨 크기가 Standard 대비 시각적으로 명확히 큼
- [ ] Standard 모드 레이아웃 회귀 없음
- [ ] 다크 모드 + Senior 모드 조합 정상 동작
