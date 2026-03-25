# fanen-sprint9 Gap Analysis
작성일: 2026-03-24

## Match Rate: 95%
구현 완료: 23/24 항목 (신규 11/12 + 수정 12/12 + 다크모드 전파 완료)

---

## 1. 파일 존재 검증

### 신규 생성 (11/12 = 92%)

| # | 파일 | 상태 |
|---|------|------|
| 1 | src/components/common/DarkModeToggle.tsx | O |
| 2 | src/components/common/DevModeBanner.tsx | O |
| 3 | src/features/global-news/components/GlobalNewsCard.tsx | O |
| 4 | src/features/global-news/components/GlobalNewsList.tsx | X (page.tsx 인라인 처리) |
| 5 | src/features/global-news/components/SectorImpactHeatmap.tsx | O |
| 6 | src/features/global-news/components/BenefitStockCard.tsx | O |
| 7 | src/features/global-news/components/GlobalNewsAnalysis.tsx | O |
| 8 | src/features/global-news/hooks/useGlobalNews.ts | O |
| 9 | src/features/global-news/index.ts | O |
| 10 | src/app/global-news/page.tsx | O |
| 11 | src/styles/zoom.css | O |
| 12 | src/lib/mock/mockGlobalNews.ts | O |

### 수정 파일 (12/12 = 100%)

| # | 파일 | 상태 | 비고 |
|---|------|------|------|
| 1 | src/features/ai-coach/components/FinniAvatar.tsx | O | 4 mood 지원 완료 |
| 2 | src/features/landing/LandingPage.tsx | O | dark: 클래스 적용 완료 |
| 3 | src/features/dashboard/DashboardHome.tsx | O | dark: 클래스 적용 완료 |
| 4 | src/hooks/useSubscription.ts | O | DEV_UNLOCK_PRO 처리 |
| 5 | src/app/globals.css | O | CSS 변수 + .dark 클래스 |
| 6 | src/components/common/Header.tsx | O | DarkModeToggle 통합 |
| 7 | src/components/common/BottomNav.tsx | O | dark: 클래스 적용 |
| 8 | src/app/layout.tsx | O | suppressHydrationWarning + DevModeBanner |
| 9 | src/app/onboarding/step3/page.tsx | O | 4개 옵션 + dark: 적용 |
| 10 | src/app/profile/page.tsx | O | UI 모드 switcher + dark: 적용 |
| 11 | src/lib/plans.ts | O | global_news feature 추가 |
| 12 | src/app/news/page.tsx | O | 글로벌 수혜 분석 탭 링크 |

---

## 2. TypeScript 검증

```
npx tsc --noEmit → 오류 0건
```

---

## 3. CLAUDE.md 절대 원칙 준수 현황

### 3.1 DisclaimerBanner

| 페이지 | 상태 | variant |
|--------|------|---------|
| src/app/global-news/page.tsx | O | signal |

### 3.2 AiBadge

| 위치 | 상태 |
|------|------|
| BenefitStockCard.tsx (글로벌 뉴스 종목 추천) | O |
| GlobalNewsAnalysis.tsx (섹터 분석 결과) | O |

### 3.3 SubscriptionGate

| 페이지 | 필요 플랜 | 상태 |
|--------|----------|------|
| /global-news | pro | O (SubscriptionGate requiredPlan="pro") |

### 3.4 plans.ts 구독 참조

| 기능 | 상태 |
|------|------|
| global_news feature | O (FEATURE_PLAN_MAP에 추가) |

---

## 4. 모듈별 구현 상태

### S9-M1: 핀이 캐릭터 리디자인 — 100%

| 항목 | 상태 |
|------|------|
| SVG 리디자인 (그라디언트 바디, 하이라이트 눈, 볼터치) | O |
| mood: default/happy/thinking/excited | O |
| LandingPage 적용 (mood="happy") | O |
| DashboardHome 적용 (mood="default") | O |
| AiCoachChat 적용 (mood="happy") | O |
| ChatMessage AI 메시지 (mood="thinking") | O |

### S9-M2: 다크모드 — 95%

| 항목 | 상태 |
|------|------|
| globals.css CSS 변수 (:root + .dark) | O |
| DarkModeToggle (localStorage 'fanen-theme') | O |
| Header 통합 | O |
| layout.tsx suppressHydrationWarning | O |
| Card.tsx dark: 클래스 | O |
| Button.tsx dark: 클래스 | O (QA에서 추가) |
| Toast.tsx dark: 클래스 | O (QA에서 추가) |
| BottomNav.tsx dark: 클래스 | O |
| LandingPage.tsx dark: 클래스 | O (QA에서 추가) |
| DashboardHome.tsx dark: 클래스 | O (QA에서 추가) |
| ProfilePage dark: 클래스 | O (QA에서 추가) |
| OnboardingStep3 dark: 클래스 | O (QA에서 추가) |
| 기타 분석 페이지 dark:bg-slate-900 | O (기존 구현) |

### S9-M3: Pro 잠금해제 개발 플래그 — 100%

| 항목 | 상태 |
|------|------|
| NEXT_PUBLIC_DEV_UNLOCK_PRO 환경변수 처리 | O |
| useSubscription → plan='premium' 반환 | O |
| DevModeBanner 노란색 배너 | O |
| layout.tsx 상단 배너 통합 | O |
| .env.local.example 업데이트 | O |

### S9-M4: 고령층 확대모드 — 91%

| 항목 | 상태 |
|------|------|
| zoom.css 생성 (150% 폰트, 64px 버튼) | O |
| globals.css @import zoom.css | O |
| 온보딩 step3 확대 옵션 추가 (총 4개) | O |
| 프로필 페이지 UI 모드 변경 | O |
| zoom/senior/expert 클래스 상호 배타 | O |
| button font-size 1.15rem (설계: 1.2rem) | ⚠️ minor |

### S9-M5: 글로벌 뉴스 → 수혜 섹터/종목 분석 — 92%

| 항목 | 상태 |
|------|------|
| mockGlobalNews.ts (10건, 5개 카테고리) | O |
| GlobalNewsItem/SectorImpact/StockRecommendation 인터페이스 | O |
| useGlobalNews.ts (선택/분석 상태 관리) | O |
| GlobalNewsCard.tsx (카테고리 뱃지 + 선택) | O |
| GlobalNewsList.tsx | X (page.tsx 인라인 처리, 기능 동작 동일) |
| SectorImpactHeatmap.tsx (바 차트) | O |
| BenefitStockCard.tsx (AiBadge + TrafficLightSignal) | O |
| GlobalNewsAnalysis.tsx | O |
| /global-news page (DisclaimerBanner + SubscriptionGate) | O |
| /news page 탭 링크 추가 | O |
| plans.ts global_news feature | O |

---

## 5. QA에서 직접 수정한 항목

### 다크모드 전파 (PDCA iterate 단계)

1. **Button.tsx**: secondary/ghost variant dark: 클래스 추가
2. **Toast.tsx**: TYPE_STYLES dark: 배경색 추가
3. **LandingPage.tsx**: 전체 섹션 dark: 클래스 추가 (bg, text, border)
4. **DashboardHome.tsx**: 전체 카드/텍스트 dark: 클래스 추가
5. **profile/page.tsx**: 배경/텍스트/버튼 dark: 클래스 추가
6. **onboarding/step3/page.tsx**: 제목/카드/버튼 dark: 클래스 추가
7. **StockChartInner.tsx**: lightweight-charts v4→v5 API 수정 (addSeries + CandlestickSeries/LineSeries)

---

## 6. 추가 구현 사항 (설계 문서 외)

- `CATEGORY_LABELS` export (mockGlobalNews.ts) — 카테고리 한국어 라벨 매핑
- `IMPACT_CONFIG` export (mockGlobalNews.ts) — 영향도별 색상/라벨 config
- TrafficLightSignal in BenefitStockCard — 신호등 UI 통합
- Profile page UI mode switcher — 프로필에서 모드 변경 추가

---

## 7. 결론

- **Match Rate: 95%** (23/24 + 다크모드 전파 완료)
- TypeScript 오류: **0건**
- CLAUDE.md 원칙 위반: **0건**
- 다크모드: 전체 주요 페이지/컴포넌트 적용 완료
- Pro 잠금해제: DEV 플래그 정상 동작
- 글로벌 뉴스 분석: 10건 Mock + 섹터 히트맵 + 종목 추천 완성
