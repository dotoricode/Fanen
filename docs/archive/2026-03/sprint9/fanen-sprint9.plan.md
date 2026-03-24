# fanen-sprint9 Plan Document

> 작성일: 2026-03-24
> 이전 완료: fanen-v2-overhaul (96% Match Rate)

---

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | fanen-sprint9 |
| 목표 | UI 품질 향상 + 접근성 확장 + 글로벌 뉴스 분석 기능 |
| 우선순위 | 핀이 리디자인 → 다크모드 → Pro 잠금해제 → 확대모드 → 글로벌 뉴스 분석 |
| 접근 방식 | Mock-first 유지 (배포 최후) |

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 핀이 캐릭터 완성도 + 다크모드 + 고령층 접근성 + 글로벌 뉴스 분석으로 서비스 차별화 |
| **WHO** | 기존 타깃(20~60대) + 확대: 60대+ 고령층, 해외 정세에 관심 있는 투자자 |
| **RISK** | 다크모드 CSS 누락, 확대모드와 시니어모드 충돌, 글로벌 뉴스 Mock 데이터 설계 |
| **SUCCESS** | 다크모드 전페이지 정상, Pro 기능 DEV 플래그로 열림, 글로벌 뉴스→종목 흐름 완성 |
| **SCOPE** | 프론트 전용 (백엔드 연동 제외), 배포 미포함 |

---

## 모듈 정의

### S9-M1: 핀이 캐릭터 리디자인

**목표**: 더 귀엽고 표정이 풍부한 핀이로 교체

**세부 요구사항**:
- SVG 리디자인: 더 큰 눈 + 하이라이트 점 + 볼터치 + 둥근 실루엣
- 감정 상태별 variant: `default | happy | thinking | excited`
- `src/features/ai-coach/components/FinniAvatar.tsx` 업데이트
- 랜딩 페이지, 대시보드, 코치 채팅에 적용

### S9-M2: 다크모드 지원

**목표**: 전체 앱 다크모드 전환

**세부 요구사항**:
- `next-themes` 패키지 또는 CSS variables + 클래스 방식
- `DarkModeToggle` 컴포넌트 → Header에 통합
- `globals.css` CSS 변수 체계 (`--bg-primary`, `--text-primary` 등)
- Tailwind `dark:` 클래스 주요 컴포넌트 적용
- localStorage `fanen-theme` 키로 유지
- 우선 대상: layout, Header, BottomNav, Card, Button, 모든 page.tsx

### S9-M3: Pro 요금제 개발 모드 잠금해제

**목표**: 개발/데모용으로 Pro 기능을 자유롭게 볼 수 있도록

**세부 요구사항**:
- `NEXT_PUBLIC_DEV_UNLOCK_PRO=true` 환경변수 플래그
- `useSubscription` 훅에서 DEV 플래그 시 `plan = 'premium'` 반환
- 앱 상단에 개발 모드 노란색 배너 표시: "🔧 개발 모드 — Pro/Premium 잠금 해제됨"
- `.env.local.example`에 DEV 플래그 추가

### S9-M4: 고령층 확대모드 (Zoom Mode)

**목표**: 기존 시니어모드(120%) 대비 더 강력한 접근성 확대

**세부 요구사항**:
- `zoom` CSS 클래스: 폰트 150%, 버튼 최소 높이 64px, 줄간격 2.0
- 온보딩 step3에 "확대모드" 옵션 추가 (일반/전문가/시니어/확대 총 4개)
- 프로필 설정에서도 변경 가능
- `src/styles/zoom.css` 생성
- `globals.css`에 `@import` 추가

### S9-M5: 글로벌 뉴스 → 수혜 섹터/종목 분석

**목표**: 세계 정세 뉴스를 분석하여 한국 수혜 섹터와 종목 추천

**세부 요구사항**:
- 신규 페이지: `/global-news`
- 기능 흐름: 글로벌 뉴스 입력/선택 → AI 분석 → 영향 섹터 → 수혜 종목
- Mock 뉴스 10건 (지정학, 원자재, 금리, 무역 등 카테고리)
- 섹터 히트맵 (수혜/중립/피해 시각화)
- 종목 카드 (종목명, 근거, 신뢰도)
- DisclaimerBanner + AiBadge 필수
- 네비게이션: BottomNav에 추가 (뉴스 탭에서 접근 또는 별도 탭)
- Pro 이상 필요 (`SubscriptionGate requiredPlan="pro"`)

---

## 구현 파일 목록

### 신규 (17개)
```
src/components/common/DarkModeToggle.tsx
src/components/common/DevModeBanner.tsx
src/features/global-news/components/GlobalNewsCard.tsx
src/features/global-news/components/GlobalNewsList.tsx
src/features/global-news/components/SectorImpactHeatmap.tsx
src/features/global-news/components/BenefitStockCard.tsx
src/features/global-news/components/GlobalNewsAnalysis.tsx
src/features/global-news/hooks/useGlobalNews.ts
src/features/global-news/index.ts
src/app/global-news/page.tsx
src/styles/zoom.css
src/lib/mock/mockGlobalNews.ts
```

### 수정 (14개)
```
src/features/ai-coach/components/FinniAvatar.tsx  (리디자인)
src/features/landing/LandingPage.tsx              (핀이 업데이트)
src/features/dashboard/DashboardHome.tsx          (핀이 업데이트)
src/hooks/useSubscription.ts                      (DEV 플래그)
src/app/globals.css                               (CSS 변수 + dark)
src/components/common/Header.tsx                  (DarkModeToggle)
src/components/common/BottomNav.tsx               (global-news 탭)
src/app/layout.tsx                                (DevModeBanner)
src/app/onboarding/step3/page.tsx                 (확대모드 옵션)
src/app/profile/page.tsx                          (확대모드 설정)
src/styles/senior.css                             (zoom.css 분리 확인)
src/lib/plans.ts                                  (global_news feature 추가)
```

---

## 스프린트 계획

| Phase | 모듈 | 에이전트 |
|-------|------|---------|
| P1 (병렬) | S9-M1 핀이 리디자인 | ui-designer |
| P1 (병렬) | S9-M2 다크모드 | darkmode-dev |
| P1 (병렬) | S9-M3 Pro 잠금해제 | feature-dev |
| P2 (병렬) | S9-M4 확대모드 | accessibility-dev |
| P2 (병렬) | S9-M5 글로벌 뉴스 | news-analyst-dev |
| P3 | QA + Gap Analysis | qa-specialist |
