# fanen-v2-overhaul Plan Document

> 작성일: 2026-03-24
> 이전 스프린트: Sprint 1~8 완료 (Match Rate 98.2%)
> 개편 방향: 프론트엔드 우선 개발 (Mock Data) → 백엔드 연동 → 배포

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | Sprint 8까지 구현했으나 (1) 회원가입/비밀번호 재설정 없음 (2) Pro/Premium 기능이 코드에만 있고 실제 잠금 미연결 (3) 백엔드 없이 개발 불가한 구조로 프론트 개발 속도 저하 (4) 랜딩/온보딩 UX 빈약 |
| **Solution** | Mock Data Layer 구축 → 프론트 전체 완성 → 인증 완성 → 구독 시스템 연결 → 백엔드 실데이터 교체 → 배포 |
| **Function UX** | 로그인/회원가입 완성 · 요금제 페이지 · 잠긴 기능 업그레이드 유도 · 개선된 랜딩 · 시니어/전문가 모드 전환 |
| **Core Value** | "세상이 움직이면, 파낸이 먼저 압니다" — 실제 사용 가능한 완성형 서비스로 전환 |

---

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 프론트 UI가 백엔드 의존으로 개발 속도 제한 → Mock Data로 독립 개발 후 백엔드 교체 패턴 적용 |
| **WHO** | 20~60대 일반 투자자 (정보 소외 계층) — 특히 시니어 UI 모드가 필요한 60대 은퇴자 |
| **RISK** | Mock→실데이터 교체 시 타입 불일치, 소셜 로그인 OAuth 설정 필요, 결제 시스템 미연동 |
| **SUCCESS** | 백엔드 없이 모든 페이지 렌더링 가능, 로그인 완전 동작, Pro 잠금 UI 정상 표시 |
| **SCOPE** | v2: Mock Layer + Auth 완성 + Subscription UI + UX 개선 + 신규 기능 / 배포는 최종 단계 |

---

## 1. 개발 원칙 (v2)

### 1.1 프론트엔드 우선 개발 전략

```
Mock Data Layer (src/lib/mock/)
    ↓
프론트엔드 완성 (모든 UI/UX)
    ↓
백엔드 연동 (Railway API / Supabase)
    ↓
실데이터 교체 (mock flag 제거)
    ↓
배포 (Vercel + Railway)
```

### 1.2 Mock Data 설계 원칙

- `src/lib/mock/` 디렉토리에 모든 mock 데이터 집중
- 각 feature별 `mock*.ts` 파일로 분리
- `USE_MOCK=true` 환경변수로 mock/real 전환
- 실데이터와 동일한 TypeScript 타입 사용 (교체 용이)

### 1.3 절대 원칙 (CLAUDE.md 기준)

- 민감 데이터: Railway FastAPI만 처리 (변경 없음)
- AI 환각 방지: 수치 직접 생성 금지 (변경 없음)
- DisclaimerBanner: 모든 분석 화면 (변경 없음)
- RLS: 모든 신규 테이블 (변경 없음)
- **추가**: Mock 데이터에도 실데이터와 동일한 타입/구조 사용

---

## 2. 개편 범위 (9개 Module)

### Module 1: Mock Data Infrastructure Layer
**우선순위**: P0 — 모든 다른 모듈의 전제조건

| 항목 | 내용 |
|------|------|
| 목적 | 백엔드 없이 모든 기능 UI 개발 가능하도록 |
| 범위 | `src/lib/mock/` 전체 구조 + 환경변수 스위치 |
| 산출물 | mock 데이터 파일 8개, MockProvider 컴포넌트 |

**Mock 데이터 파일 목록**:
```
src/lib/mock/
├── index.ts              (USE_MOCK 스위치 + 공통 export)
├── mockMarket.ts         (코스피/코스닥 지수 + OHLCV 차트 데이터)
├── mockNews.ts           (뉴스 임팩트 데이터 10건)
├── mockSector.ts         (섹터 인과관계 맵 데이터)
├── mockPortfolio.ts      (포트폴리오 5개 + 종목 데이터)
├── mockDividend.ts       (배당 캘린더 + 시뮬레이션 데이터)
├── mockTrading.ts        (모의투자 계좌 + 거래 내역 + 랭킹)
├── mockJournal.ts        (투자 일지 5건)
└── mockCoach.ts          (AI 코치 대화 히스토리 + 응답 템플릿)
```

---

### Module 2: Auth 완성 (로그인 + 회원가입 + 비밀번호 재설정)
**우선순위**: P0

**현재 상태**:
- 로그인 페이지: 있음 (카카오/구글/이메일)
- 회원가입 페이지: **없음**
- 비밀번호 재설정: **없음**
- 이메일 로그인 후 리다이렉트: **없음** (성공 후 페이지 이동 미구현)
- 로그인 보호 미들웨어: 있으나 미완

**구현 목록**:
```
src/app/(auth)/
├── login/page.tsx          (기존 — 회원가입 링크 + 성공 후 리다이렉트 추가)
├── signup/page.tsx         (신규 — 이메일 회원가입 + 약관 동의)
├── forgot-password/page.tsx (신규 — 이메일 입력 → Supabase 재설정 메일 발송)
└── reset-password/page.tsx  (신규 — 새 비밀번호 입력 콜백 처리)

src/middleware.ts            (수정 — 보호 경로 완성: /profile, /portfolio, /coach 등)
src/lib/auth/                (신규 — 인증 유틸리티)
├── getUser.ts              (서버 컴포넌트용 유저 조회)
└── redirectIfNotAuth.ts    (인증 필요 페이지 리다이렉트)
```

**개선 아이디어**:
- 소셜 로그인 성공 후 프로필 미설정 시 온보딩 페이지로 이동
- 이메일 인증 완료 후 환영 메시지
- 자동 로그인 유지 (Supabase 기본 지원)

---

### Module 3: Subscription System (요금제 + 잠금 UI)
**우선순위**: P0

**현재 상태**:
- `SubscriptionGate` 컴포넌트: 있음 (프리스텐딩, 연결 안 됨)
- `lib/plans.ts`: 있음
- 요금제 페이지: **없음**
- 실제 사용자 플랜 조회: **없음** (hardcoded 'free')
- 업그레이드 경로: **없음**

**구현 목록**:
```
src/app/pricing/page.tsx          (신규 — 3플랜 비교표 + 각 기능 체크)
src/app/upgrade/page.tsx          (신규 — 플랜 선택 → 결제 준비 페이지)
src/hooks/useSubscription.ts      (신규 — profiles.subscription_tier 조회)
src/components/common/PlanBadge.tsx (신규 — 플랜 뱃지 UI)

적용 대상 (SubscriptionGate 연결):
- /sector    → Pro 필요
- /dividend  → Pro 필요 (시뮬레이션)
- /coach     → Pro 필요 (AI 코치)
- /journal   → Pro 필요 (AI 피드백)
- 매매 신호등 → Premium 필요
- 음성 코치   → Premium 필요
```

**요금제 아이디어 개선**:
```
Free   (무료)  : 뉴스 요약 3건/일, 포트폴리오 1개, 모의투자 참여
Pro    (9,900) : 실시간 분석, 섹터맵, 배당 시뮬, AI 코치 기본
Premium(19,900): 매매 신호등, 음성 코치, AI 리포트, 세금 계산
```

---

### Module 4: Landing Page & Navigation 개편
**우선순위**: P1

**현재 상태**:
- 홈 페이지: Railway 없으면 차트 안 보임 (빈 화면)
- 헤더: 로그인 상태 연동 미완
- 네비게이션: 없음 (모바일 미지원)
- 랜딩 UX: 로그인 유도 버튼만 있음

**구현 목록**:
```
src/app/page.tsx                  (수정 — 항상 보이는 랜딩 섹션 + CTA)
src/components/common/Header.tsx  (수정 — 인증 상태 연동 + 모바일 메뉴)
src/components/common/BottomNav.tsx (신규 — 모바일 하단 네비게이션)
src/app/landing/                  (신규 — 서비스 소개 섹션들)
├── HeroSection.tsx               (핵심 가치 + CTA)
├── FeatureSection.tsx            (기능 소개 카드)
├── PricingPreview.tsx            (요금제 미리보기)
└── TestimonialSection.tsx        (사용 후기 / 소셜 증명)
```

**개선 아이디어**:
- 비로그인 시: 랜딩 페이지 (서비스 소개 + 가입 유도)
- 로그인 후: 대시보드 홈 (내 포트폴리오 요약 + 오늘의 뉴스)
- 시니어 모드: 글자 크기 120%, 고대비, 단순 레이아웃

---

### Module 5: Onboarding Flow
**우선순위**: P1

신규 사용자 가입 후 첫 경험 최적화.

```
src/app/onboarding/
├── page.tsx          (단계 선택 — 투자 경험 / 관심 종목 / UI 모드)
├── step1/page.tsx    (투자 경험 선택: 입문/중급/전문가)
├── step2/page.tsx    (관심 섹터 선택: IT/제조/금융/바이오 등)
└── step3/page.tsx    (UI 모드 선택: 일반인/전문가/시니어)
```

온보딩 완료 → 프로필 자동 설정 → 홈 대시보드로 이동

---

### Module 6: 기존 기능 개선
**우선순위**: P1

#### 6-1. 홈 대시보드 (로그인 후)
- 내 포트폴리오 수익률 요약 카드
- 오늘의 주요 뉴스 3건
- 관심 섹터 변화 신호
- 핀이 AI 데일리 한마디

#### 6-2. 뉴스 페이지 개선
- 필터: 섹터별 / 날짜별 / 영향도별
- 즐겨찾기 기능
- 뉴스 → 종목 링크 (차트 팝업)

#### 6-3. 포트폴리오 개선
- 수익률 차트 (기간별)
- 종목별 비중 파이 차트
- 매수 추천 AI 의견 (핀이)

#### 6-4. 모의투자 개선
- 실시간 가격 표시 (KRX 연동 후)
- 내 수익률 vs 시장 수익률 비교
- 랭킹 애니메이션

#### 6-5. AI 코치 핀이 개선
- 대화 히스토리 저장 (Supabase)
- 핀이 캐릭터 아바타 추가
- 음성 입력/출력 (Premium)

---

### Module 7: 신규 기능 (Pro/Premium)
**우선순위**: P2

#### 7-1. 매매 신호등 페이지 (Premium)
```
src/app/signal/page.tsx
src/features/signal/
├── TrafficLightDashboard.tsx
├── SignalCard.tsx
└── useSignal.ts
```

#### 7-2. AI 맞춤 리포트 (Premium)
```
src/app/report/page.tsx
src/features/ai-report/
├── ReportGenerator.tsx
├── ReportPreview.tsx
└── useAiReport.ts
```

#### 7-3. 세금 시뮬레이터 (Premium)
```
src/app/tax/page.tsx
src/features/tax-simulator/
├── TaxForm.tsx
├── TaxResult.tsx
└── useTaxSimulator.ts
```

#### 7-4. 알림 센터
```
src/app/notifications/page.tsx
src/features/notifications/
├── NotificationList.tsx
└── useNotifications.ts
```

---

### Module 8: Design System 강화
**우선순위**: P1

```
src/styles/
├── tokens.css        (색상/폰트/간격 CSS 변수)
└── senior.css        (시니어 모드 override)

src/components/
├── ui/               (shadcn/ui 기반 공통 컴포넌트)
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── Badge.tsx
│   ├── Skeleton.tsx  (로딩 상태)
│   └── Toast.tsx     (알림 토스트)
└── layout/
    ├── PageLayout.tsx     (공통 페이지 레이아웃)
    ├── DashboardLayout.tsx (대시보드 레이아웃)
    └── AuthLayout.tsx      (인증 페이지 레이아웃)
```

---

### Module 9: 배포 준비 (최종 단계)
**우선순위**: P3 — 모든 Module 완료 후

```
P0 (배포 전 필수):
├── supabase db push (마이그레이션)
├── 보안 키 재발급 (Supabase Anon Key, Redis 토큰)
├── .env.local.example 최신화
└── TypeScript 오류 0건 확인

Vercel:
├── 환경변수 주입
├── 빌드 최적화
└── 도메인 설정

Railway:
├── 서울 리전 확인
├── 환경변수 주입
└── cron 동작 확인

GitHub Actions:
└── npm run build + tsc --noEmit 자동 검증
```

---

## 3. CTO 팀 구성 (10명)

```
┌─────────────────────────────────────────────────────────┐
│               CTO Lead (Opus) — 전체 조율                │
└────────────────────┬────────────────────────────────────┘
                     │ 지시/조율
    ┌────────────────┼────────────────┐
    ▼                ▼                ▼
[설계팀]         [개발팀]          [품질팀]
Frontend       Auth Dev         QA Specialist
Architect      Mock Data Eng    Gap Detector
Design System  Subscription Dev Security Reviewer
               Feature Dev #1   Doc Manager
               Feature Dev #2
```

| # | 에이전트 역할 | 담당 Module | 도구 |
|---|------------|-----------|------|
| 1 | **CTO Lead** | 전체 조율 + 기술 결정 | 모든 도구 |
| 2 | **Frontend Architect** | M4 랜딩/네비 + M8 디자인시스템 | Write, Edit |
| 3 | **Auth Specialist** | M2 로그인/회원가입 완성 | Write, Edit |
| 4 | **Mock Data Engineer** | M1 Mock Data Layer | Write, Edit |
| 5 | **Subscription Dev** | M3 요금제/구독 시스템 | Write, Edit |
| 6 | **UX Developer** | M5 온보딩 + M4 홈 개선 | Write, Edit |
| 7 | **Feature Dev #1** | M6 뉴스/섹터/포트폴리오 개선 | Write, Edit |
| 8 | **Feature Dev #2** | M6 모의투자/코치/일지 개선 | Write, Edit |
| 9 | **Premium Feature Dev** | M7 신규 기능 (신호등/리포트/세금) | Write, Edit |
| 10 | **QA Specialist** | Gap 분석 + 품질 검증 | Read, Grep |
| 11 | **Security Reviewer** | RLS, CORS, 인증 보안 | Read, Grep |
| 12 | **Document Manager** | 문서 관리 + 아카이브 | Read, Write |

---

## 4. 스프린트 계획

### Sprint A — Mock Layer + Auth 완성
**목표**: 백엔드 없이 모든 페이지 작동
```
Week 1:
  [Module 1] Mock Data Infrastructure (M1)
  [Module 2] Auth 완성 (회원가입/비밀번호 재설정)
```

### Sprint B — Subscription + UX
**목표**: Pro/Premium 잠금 동작 + 개선된 UX
```
Week 2:
  [Module 3] Subscription System
  [Module 4] Landing Page & Navigation
  [Module 5] Onboarding Flow
```

### Sprint C — 기존 기능 개선
**목표**: 모든 기존 기능 UX 개선
```
Week 3:
  [Module 6] 기존 6개 기능 개선
  [Module 8] Design System
```

### Sprint D — 신규 기능
**목표**: Pro/Premium 신규 기능 구현
```
Week 4:
  [Module 7] 신호등 + AI 리포트 + 세금 시뮬 + 알림
```

### Sprint E — 백엔드 연동 + 배포 (최종)
**목표**: Mock → 실데이터 교체 + 프로덕션 배포
```
Week 5:
  Mock 데이터 → Railway/Supabase 실데이터 교체
  [Module 9] 배포 준비 + 실행
```

---

## 5. 파일 생성 목록 (전체)

### 신규 생성 (36개)
```
src/lib/mock/
├── index.ts
├── mockMarket.ts
├── mockNews.ts
├── mockSector.ts
├── mockPortfolio.ts
├── mockDividend.ts
├── mockTrading.ts
├── mockJournal.ts
└── mockCoach.ts

src/app/(auth)/
├── signup/page.tsx
├── forgot-password/page.tsx
└── reset-password/page.tsx

src/app/pricing/page.tsx
src/app/upgrade/page.tsx
src/app/onboarding/
├── page.tsx
├── step1/page.tsx
├── step2/page.tsx
└── step3/page.tsx

src/app/signal/page.tsx
src/app/report/page.tsx
src/app/tax/page.tsx
src/app/notifications/page.tsx

src/features/signal/
src/features/ai-report/
src/features/tax-simulator/
src/features/notifications/

src/hooks/useSubscription.ts
src/lib/auth/getUser.ts
src/lib/auth/redirectIfNotAuth.ts

src/components/ui/ (Button, Card, Modal, Badge, Skeleton, Toast)
src/components/layout/ (PageLayout, DashboardLayout, AuthLayout)
src/components/common/BottomNav.tsx
src/components/common/PlanBadge.tsx
```

### 수정 (12개)
```
src/app/page.tsx              (랜딩 + 대시보드 분기)
src/app/(auth)/login/page.tsx  (회원가입 링크 + 성공 리다이렉트)
src/app/layout.tsx             (BottomNav 추가)
src/components/common/Header.tsx (인증 상태 연동)
src/middleware.ts               (보호 경로 완성)
src/app/coach/page.tsx         (SubscriptionGate 연결)
src/app/sector/page.tsx        (SubscriptionGate 연결)
src/app/dividend/page.tsx      (SubscriptionGate 연결)
src/app/journal/page.tsx       (SubscriptionGate 연결)
src/app/mock-trading/page.tsx  (SubscriptionGate 연결)
src/app/portfolio/page.tsx     (대시보드 개선)
src/features/ai-coach/         (히스토리 저장)
```

---

## 6. 성공 기준

| 기준 | 측정 방법 |
|------|---------|
| Mock 모드에서 모든 페이지 에러 없이 렌더링 | `USE_MOCK=true npm run build` 성공 |
| 이메일 회원가입 → 로그인 → 홈 리다이렉트 | 수동 테스트 |
| Pro 기능 접근 시 SubscriptionGate 표시 | free 계정으로 /sector 접근 |
| TypeScript 오류 0건 | `tsc --noEmit` 통과 |
| 모바일 반응형 (375px) 정상 표시 | 브라우저 DevTools |

---

## 7. 아이디어 개선 사항 (추가 제안)

### 7.1 핀이 AI 캐릭터 강화
- 핀이 캐릭터 일러스트/아바타 (SVG)
- 말풍선 + 타이핑 애니메이션
- 데일리 한마디 (홈 화면 위젯)
- 감정 표현 (긍정/중립/경고)

### 7.2 투자 공부방 (신규 섹션)
- 용어 사전 (금융 용어 쉬운 설명)
- "오늘의 지식" 카드
- 초보자를 위한 투자 가이드

### 7.3 소셜 기능 (선택)
- 모의투자 랭킹 공유
- 투자 일지 공개/비공개 설정
- 커뮤니티 피드 (추후)

### 7.4 알림 시스템
- 뉴스 주요 속보 알림 (브라우저 Push)
- 보유 종목 급등/급락 알림
- 배당 지급일 D-7 알림

---

## 8. 팀 실행 명령

```bash
# CTO 팀 모드 활성화 (10명)
/pdca team fanen-v2-overhaul

# Sprint A 시작
/pdca do fanen-v2-overhaul --scope module-1,module-2

# Sprint B 시작
/pdca do fanen-v2-overhaul --scope module-3,module-4,module-5

# Sprint C 시작
/pdca do fanen-v2-overhaul --scope module-6,module-8

# Sprint D 시작
/pdca do fanen-v2-overhaul --scope module-7

# 최종 배포 (모든 Sprint 완료 후)
/pdca do fanen-v2-overhaul --scope module-9
```
