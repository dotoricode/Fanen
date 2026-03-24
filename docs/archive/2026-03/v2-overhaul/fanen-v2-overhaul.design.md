# fanen-v2-overhaul Design Document

> 작성일: 2026-03-24
> Plan 참조: docs/01-plan/features/fanen-v2-overhaul.plan.md
> 아키텍처: Option C (Pragmatic Balance) — 기존 구조 최대 보존 + 최소 확장

---

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 프론트 UI가 백엔드 의존으로 개발 속도 제한 → Mock Data로 독립 개발 후 백엔드 교체 패턴 |
| **WHO** | 20~60대 일반 투자자 — 특히 시니어 UI 모드가 필요한 60대 은퇴자 |
| **RISK** | Mock→실데이터 교체 시 타입 불일치, OAuth 설정, 결제 미연동 |
| **SUCCESS** | 백엔드 없이 모든 페이지 렌더링 가능, 로그인 완전 동작, Pro 잠금 UI 정상 |
| **SCOPE** | Mock Layer + Auth + Subscription + UX + 신규기능 / 배포 최종 |

---

## 1. 아키텍처 Overview

### 1.1 선택한 아키텍처: Option C (Pragmatic Balance)

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                        │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  pages/      │  │  features/   │  │  components/     │  │
│  │  (라우팅)    │  │  (기능별)    │  │  (공통 UI)       │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │            │
│  ┌──────▼─────────────────▼────────────────────▼─────────┐  │
│  │                    lib/ (공통 로직)                    │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │  │
│  │  │  mock/   │  │  auth/   │  │  plans.ts│            │  │
│  │  │(Mock Data│  │(인증 유틸)│  │(구독 상수)│            │  │
│  │  └──────────┘  └──────────┘  └──────────┘            │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  hooks/ (공통 훅)                                    │    │
│  │  useSubscription.ts / useAuth.ts / useToast.ts      │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
         │                        │
         ▼                        ▼
  [Railway FastAPI]         [Supabase]
  (민감 데이터만)           (인증/DB)
```

### 1.2 Mock/Real 전환 전략

```typescript
// src/lib/mock/index.ts
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'
  || !process.env.NEXT_PUBLIC_SUPABASE_URL;

// 각 feature hook에서:
import { USE_MOCK } from '@/lib/mock';
import { mockNews } from '@/lib/mock/mockNews';

export function useNewsImpacts() {
  if (USE_MOCK) return { data: mockNews, loading: false, error: null };
  // 실제 Supabase 호출...
}
```

---

## 2. Module 1: Mock Data Infrastructure Layer

### 2.1 디렉토리 구조

```
src/lib/mock/
├── index.ts              (USE_MOCK 플래그 + 공통 타입)
├── mockMarket.ts         (코스피/코스닥 지수 + OHLCV)
├── mockNews.ts           (뉴스 임팩트 10건)
├── mockSector.ts         (섹터 인과관계 데이터)
├── mockPortfolio.ts      (포트폴리오 5개)
├── mockDividend.ts       (배당 캘린더 + 시뮬레이션)
├── mockTrading.ts        (모의투자 계좌 + 거래 + 랭킹)
├── mockJournal.ts        (투자 일지 5건)
└── mockCoach.ts          (AI 코치 대화 히스토리)
```

### 2.2 Mock 데이터 설계 (각 파일)

#### mockMarket.ts
```typescript
export const MOCK_KOSPI: StockIndexResponse = {
  market: 'KOSPI',
  value: 2687.44,
  change: 12.34,
  change_rate: 0.46,
  timestamp: new Date().toISOString(),
  chart_data: generateOHLCV(30), // 30일 OHLCV 생성 헬퍼
  cached: false,
  mock: true,
};
```

#### mockNews.ts
```typescript
export const MOCK_NEWS_IMPACTS: NewsImpact[] = [
  {
    id: '1',
    title: '삼성전자, 2분기 영업이익 10조 돌파 전망',
    summary: 'AI 반도체 수요 급증으로 HBM 출하량 확대...',
    impact_score: 8.5,
    affected_sectors: ['반도체', 'IT'],
    published_at: new Date(Date.now() - 3600000).toISOString(),
    source_url: null,
    mock: true,
  },
  // 9건 추가...
];
```

### 2.3 환경변수 설정

```bash
# .env.local (개발 시 mock 모드)
NEXT_PUBLIC_USE_MOCK=true

# .env.local (실서비스 연동 시)
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### 2.4 기존 훅 수정 패턴

```typescript
// 수정 전 (Railway 필수)
export function useNewsImpacts() {
  const [data, setData] = useState<NewsImpact[]>([]);
  useEffect(() => { fetchFromRailway().then(setData); }, []);
  return { data, loading, error };
}

// 수정 후 (Mock 지원)
import { USE_MOCK } from '@/lib/mock';
import { MOCK_NEWS_IMPACTS } from '@/lib/mock/mockNews';

export function useNewsImpacts() {
  if (USE_MOCK) {
    return { data: MOCK_NEWS_IMPACTS, loading: false, error: null };
  }
  // 기존 코드...
}
```

---

## 3. Module 2: Auth 완성

### 3.1 Auth 플로우 설계

```
[회원가입] → 이메일 인증 → [온보딩] → [홈 대시보드]
     ↓                          ↑
[로그인] → 성공 → /profile 설정 여부 확인 → 미설정이면 온보딩
     ↓
[비밀번호 재설정] → 이메일 → 재설정 링크 → 새 비밀번호
```

### 3.2 신규 파일 설계

#### `src/app/(auth)/signup/page.tsx`
```typescript
interface SignupForm {
  email: string;
  password: string;       // 최소 8자
  passwordConfirm: string;
  agreeTerms: boolean;
  agreePrivacy: boolean;
}
```

**UI 구성**:
- 이메일 입력 + 중복 확인
- 비밀번호 (8자 이상, 영문+숫자 필수)
- 비밀번호 확인
- 이용약관 동의 (필수)
- 개인정보처리방침 동의 (필수)
- "이미 계정이 있으신가요?" → /login 링크

**Supabase 호출**:
```typescript
await supabase.auth.signUp({
  email,
  password,
  options: { emailRedirectTo: `${origin}/api/auth/callback?next=/onboarding` }
});
```

#### `src/app/(auth)/forgot-password/page.tsx`
- 이메일 입력
- `supabase.auth.resetPasswordForEmail(email, { redirectTo: ... })`
- 성공 시: "메일을 확인하세요" 안내 화면

#### `src/app/(auth)/reset-password/page.tsx`
- 새 비밀번호 + 확인 입력
- `supabase.auth.updateUser({ password })`
- 완료 후 /login 리다이렉트

### 3.3 로그인 페이지 수정

```typescript
// 기존 handleEmailSignIn에 추가
if (!error) {
  router.push('/'); // 성공 후 홈으로 리다이렉트
}

// 하단에 링크 추가
<div className="mt-4 text-center text-sm">
  <Link href="/signup">계정이 없으신가요? 회원가입</Link>
  <span className="mx-2">·</span>
  <Link href="/forgot-password">비밀번호 찾기</Link>
</div>
```

### 3.4 Auth 유틸리티

#### `src/lib/auth/getUser.ts` (서버 컴포넌트용)
```typescript
import { createServerClient } from '@/lib/supabase/server';

export async function getUser() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
```

#### `src/middleware.ts` 수정
```typescript
// 보호 경로
const PROTECTED_ROUTES = ['/profile', '/portfolio', '/coach', '/journal', '/mock-trading'];
// 인증 후 접근 금지 경로
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];
```

---

## 4. Module 3: Subscription System

### 4.1 구독 상태 훅

#### `src/hooks/useSubscription.ts`
```typescript
export function useSubscription() {
  const [plan, setPlan] = useState<PlanTier>('free');

  useEffect(() => {
    if (USE_MOCK) { setPlan('free'); return; }
    // Supabase profiles.subscription_tier 조회
    supabase.from('profiles')
      .select('subscription_tier')
      .single()
      .then(({ data }) => {
        if (data?.subscription_tier) setPlan(data.subscription_tier as PlanTier);
      });
  }, []);

  return { plan, isPro: PLAN_PRIORITY[plan] >= 1, isPremium: PLAN_PRIORITY[plan] >= 2 };
}
```

### 4.2 요금제 페이지 설계

#### `src/app/pricing/page.tsx`

**레이아웃**:
```
┌──────────────────────────────────────────────────┐
│           요금제 비교                              │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Free    │  │  Pro     │  │  Premium     │   │
│  │  무료    │  │ 9,900원  │  │  19,900원    │   │
│  │          │  │  /월     │  │    /월       │   │
│  │ ✓ 기본  │  │ ✓ Free  │  │ ✓ Pro       │   │
│  │   뉴스  │  │   전체  │  │   전체       │   │
│  │ ✓ 모의 │  │ ✓ 실시간│  │ ✓ 매매신호등 │   │
│  │   투자  │  │   분석  │  │ ✓ 음성코치   │   │
│  │         │  │ ✓ 섹터맵│  │ ✓ AI리포트   │   │
│  │         │  │ ✓ 배당  │  │ ✓ 세금계산   │   │
│  │[현재플랜]│  │[업그레이드]│ │[업그레이드]  │   │
│  └──────────┘  └──────────┘  └──────────────┘   │
│                                                  │
│  * 결제는 준비 중입니다. 베타 기간 무료 제공      │
└──────────────────────────────────────────────────┘
```

### 4.3 SubscriptionGate 연결 (각 페이지)

```typescript
// src/app/sector/page.tsx 예시
'use client';
import { useSubscription } from '@/hooks/useSubscription';
import SubscriptionGate from '@/components/common/SubscriptionGate';

export default function SectorPage() {
  const { plan } = useSubscription();
  return (
    <SubscriptionGate requiredPlan="pro" currentPlan={plan}
      onUpgradeClick={() => router.push('/pricing')}>
      <SectorMapSection />
    </SubscriptionGate>
  );
}
```

**적용 대상**:
| 페이지 | 필요 플랜 |
|--------|---------|
| `/sector` | pro |
| `/dividend` (시뮬레이션) | pro |
| `/coach` | pro |
| `/journal` (AI 피드백) | pro |
| `/signal` | premium |
| `/report` (AI 리포트) | premium |
| `/tax` | premium |

### 4.4 PlanBadge 컴포넌트

```typescript
// src/components/common/PlanBadge.tsx
interface PlanBadgeProps {
  plan: PlanTier;
  size?: 'sm' | 'md';
}

// Free: 회색, Pro: 파랑, Premium: 금색
const BADGE_STYLES = {
  free: 'bg-gray-100 text-gray-600',
  pro: 'bg-blue-100 text-blue-700',
  premium: 'bg-yellow-100 text-yellow-700',
};
```

---

## 5. Module 4: Landing Page & Navigation

### 5.1 홈 페이지 분기 설계

```typescript
// src/app/page.tsx
export default async function HomePage() {
  const user = await getUser(); // 서버 컴포넌트

  if (user) {
    return <DashboardHome user={user} />;  // 로그인 후 대시보드
  }
  return <LandingPage />;  // 비로그인 랜딩
}
```

### 5.2 랜딩 페이지 섹션

```
┌─────────────────────────────────────────────────────────┐
│ [Hero Section]                                          │
│   파낸                                                  │
│   "세상이 움직이면, 파낸이 먼저 압니다"                  │
│   [무료로 시작하기] [서비스 둘러보기]                    │
│   배경: 코스피/코스닥 실시간 차트 (mock)                  │
├─────────────────────────────────────────────────────────┤
│ [Feature Cards]                                         │
│  📰 AI 뉴스 분석  │  📊 섹터 인과관계  │  💼 포트폴리오  │
│  🤖 AI 코치 핀이  │  📈 모의투자      │  📅 배당 캘린더  │
├─────────────────────────────────────────────────────────┤
│ [핀이 AI 소개]                                          │
│   핀이 캐릭터 일러스트 + 말풍선                          │
│   "오늘 삼성전자 어때요?" → 핀이 답변 예시               │
├─────────────────────────────────────────────────────────┤
│ [요금제 미리보기]                                        │
│   Free / Pro / Premium 간단 비교                         │
├─────────────────────────────────────────────────────────┤
│ [시작하기 CTA]                                          │
│   "지금 바로 무료로 시작하세요"                          │
│   [카카오로 시작하기] [Google로 시작하기] [이메일 가입]   │
└─────────────────────────────────────────────────────────┘
```

### 5.3 Header 컴포넌트 수정

```typescript
// src/components/common/Header.tsx
// 현재: 정적 UI
// 수정: 인증 상태 연동

interface HeaderProps {
  user?: User | null;
}

// 비로그인: [로그인] [회원가입] 버튼
// 로그인: [내 플랜 뱃지] [알림] [프로필 드롭다운]
```

**드롭다운 메뉴**:
```
┌─────────────────┐
│ user@email.com  │
│ [Free 플랜]      │
├─────────────────┤
│ 내 프로필        │
│ 요금제 변경      │
├─────────────────┤
│ 로그아웃         │
└─────────────────┘
```

### 5.4 모바일 BottomNav

```typescript
// src/components/common/BottomNav.tsx
const NAV_ITEMS = [
  { href: '/',           icon: HomeIcon,      label: '홈' },
  { href: '/news',       icon: NewspaperIcon, label: '뉴스' },
  { href: '/portfolio',  icon: BriefcaseIcon, label: '포트폴리오' },
  { href: '/coach',      icon: BotIcon,       label: '핀이' },
  { href: '/profile',    icon: UserIcon,      label: '내 정보' },
];
```

---

## 6. Module 5: Onboarding Flow

### 6.1 온보딩 단계 설계

```
step1: 투자 경험
  ─ 입문 (처음 시작하는 분)
  ─ 중급 (1~3년 투자 경험)
  ─ 전문가 (3년 이상)

step2: 관심 섹터 (복수 선택)
  ─ IT/반도체 / 바이오/헬스케어 / 금융/보험
  ─ 제조/화학 / 건설/부동산 / 에너지/유틸리티

step3: UI 모드 선택
  ─ 일반 모드 (기본)
  ─ 전문가 모드 (차트/지표 상세)
  ─ 시니어 모드 (큰 글자, 단순 UI)
```

### 6.2 온보딩 완료 처리

```typescript
// 완료 시 profiles 테이블 업데이트
await supabase.from('profiles').upsert({
  id: user.id,
  investment_level: selectedLevel,
  interested_sectors: selectedSectors,
  ui_mode: selectedMode,
  onboarding_completed: true,
});
router.push('/');
```

---

## 7. Module 6: 기존 기능 개선

### 7.1 로그인 후 대시보드 홈

```typescript
// src/features/dashboard/DashboardHome.tsx
// 구성:
// ① 핀이 데일리 한마디 (mock: "오늘 반도체 섹터 주목하세요!")
// ② 내 포트폴리오 수익률 카드 (mock: +3.2%)
// ③ 오늘의 주요 뉴스 3건
// ④ 관심 섹터 변화 신호
// ⑤ 빠른 메뉴 (모의투자, AI 코치, 배당 캘린더)
```

### 7.2 AI 코치 핀이 개선

**핀이 캐릭터 SVG 아바타**:
```
┌─────────────────────────────────────┐
│  [핀이 아바타]  안녕하세요! 저는    │
│   🤖 귀여운     AI 투자 코치 핀이   │
│   로봇 캐릭터   예요. 무엇이든      │
│               물어보세요! 😊        │
└─────────────────────────────────────┘
```

**대화 히스토리 저장**:
```typescript
// coach_history 테이블 (신규)
// id, user_id, messages (jsonb), created_at, updated_at
// RLS: user_id = auth.uid()
```

### 7.3 포트폴리오 개선

```
기존: 종목 목록만
개선:
  ─ 수익률 요약 카드 (총 평가금액, 수익률, 수익금)
  ─ 종목별 비중 도넛 차트
  ─ 기간별 수익률 라인 차트 (1주/1개월/3개월)
  ─ 핀이의 포트폴리오 분석 의견
```

---

## 8. Module 7: 신규 Pro/Premium 기능

### 8.1 매매 신호등 페이지 (Premium)

```typescript
// src/features/signal/TrafficLightDashboard.tsx

interface SignalItem {
  stockCode: string;
  stockName: string;
  signal: 'buy' | 'hold' | 'sell';
  reason: string;
  confidence: number; // 0~100
  analyzedAt: string;
}

// 레이아웃:
// ─ 상단: 내 포트폴리오 종목 신호 요약
// ─ 본문: 신호등 카드 목록 (TrafficLightSignal 컴포넌트 재사용)
// ─ DisclaimerBanner 필수
```

### 8.2 AI 맞춤 리포트 (Premium)

```typescript
// src/features/ai-report/ReportGenerator.tsx
// 사용자 포트폴리오 + 보유 기간 + 목표 수익률 입력
// → AI 분석 리포트 생성
// → PDF 다운로드 (추후)
// AiBadge + 출처 URL 필수
```

### 8.3 세금 시뮬레이터 (Premium)

```typescript
// src/features/tax-simulator/TaxForm.tsx
interface TaxInput {
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  holdingDays: number;
  isLargeHolder: boolean; // 대주주 여부
}

interface TaxResult {
  capitalGain: number;         // 양도차익
  taxRate: number;             // 세율
  estimatedTax: number;        // 예상 세금
  netProfit: number;           // 세후 수익
  disclaimer: string;          // 면책 고지
}
```

**세금 계산 규칙** (2026년 기준):
- 일반 투자자: 양도차익 × 22% (지방세 포함)
- 대주주: 양도차익 × 27.5%
- DisclaimerBanner variant="tax" 필수

### 8.4 알림 센터

```typescript
// src/features/notifications/NotificationList.tsx
interface Notification {
  id: string;
  type: 'news' | 'price' | 'dividend' | 'system';
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}
// Header에 알림 아이콘 + 뱃지 (읽지 않은 개수)
```

---

## 9. Module 8: Design System

### 9.1 공통 UI 컴포넌트

#### `src/components/ui/`

**Button.tsx**:
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
}
```

**Card.tsx**:
```typescript
interface CardProps {
  variant?: 'default' | 'highlighted' | 'bordered';
  padding?: 'sm' | 'md' | 'lg';
}
```

**Skeleton.tsx** (로딩 상태):
```typescript
// 사용: 데이터 로딩 중 플레이스홀더
<Skeleton width="100%" height={48} />
<Skeleton.Card />    // 카드 형태
<Skeleton.Text rows={3} />  // 텍스트 형태
```

**Toast.tsx** (알림):
```typescript
// 사용: 성공/실패 알림
toast.success('저장되었습니다');
toast.error('오류가 발생했습니다');
toast.info('새 뉴스가 있습니다');
```

### 9.2 레이아웃 컴포넌트

#### `src/components/layout/PageLayout.tsx`
```typescript
// 모든 페이지 공통 래퍼
interface PageLayoutProps {
  title?: string;
  showDisclaimerBanner?: boolean;
  requireAuth?: boolean;
  children: ReactNode;
}
```

#### `src/components/layout/AuthLayout.tsx`
```typescript
// 로그인/회원가입 페이지 전용 레이아웃
// 배경: 그라데이션 + 파낸 로고
```

### 9.3 시니어 모드 CSS

```css
/* src/styles/senior.css */
.senior {
  font-size: 120%;
  line-height: 1.8;
}

.senior button { min-height: 52px; font-size: 1.1rem; }
.senior input { min-height: 52px; font-size: 1.1rem; }
.senior .card { padding: 24px; }
```

---

## 10. 구현 순서 (Session Guide)

### Module Map (CTO 팀 분업)

| 모듈 | 담당 에이전트 | 우선순위 | 의존성 |
|------|------------|--------|-------|
| M1: Mock Layer | Mock Data Engineer | P0 | 없음 |
| M2: Auth | Auth Specialist | P0 | M1 |
| M3: Subscription | Subscription Dev | P0 | M1 |
| M4: Landing/Nav | Frontend Architect | P1 | M1, M2, M3 |
| M5: Onboarding | UX Developer | P1 | M2 |
| M6-뉴스/섹터 | Feature Dev #1 | P1 | M1 |
| M6-포트폴리오/모의투자 | Feature Dev #2 | P1 | M1 |
| M6-코치/일지 | Feature Dev #2 | P1 | M1 |
| M7: 신규 기능 | Premium Feature Dev | P2 | M1, M3 |
| M8: Design System | Design System Dev | P1 | M1 |

### 병렬 실행 그룹

```
Phase 1 (병렬): M1(Mock Layer)
                    ↓
Phase 2 (병렬): M2(Auth) + M3(Subscription) + M8(Design System)
                    ↓
Phase 3 (병렬): M4(Landing) + M5(Onboarding) + M6(기능개선 전체)
                    ↓
Phase 4 (병렬): M7(신규 기능) + QA 검증
                    ↓
Phase 5: Gap Analysis + Iterate (90% 미만 시)
```

---

## 11. 파일 변경 목록

### 신규 생성 (38개)

```
src/lib/mock/index.ts
src/lib/mock/mockMarket.ts
src/lib/mock/mockNews.ts
src/lib/mock/mockSector.ts
src/lib/mock/mockPortfolio.ts
src/lib/mock/mockDividend.ts
src/lib/mock/mockTrading.ts
src/lib/mock/mockJournal.ts
src/lib/mock/mockCoach.ts

src/app/(auth)/signup/page.tsx
src/app/(auth)/forgot-password/page.tsx
src/app/(auth)/reset-password/page.tsx

src/app/pricing/page.tsx
src/app/onboarding/page.tsx
src/app/onboarding/step1/page.tsx
src/app/onboarding/step2/page.tsx
src/app/onboarding/step3/page.tsx
src/app/signal/page.tsx
src/app/report/page.tsx
src/app/tax/page.tsx
src/app/notifications/page.tsx

src/features/dashboard/DashboardHome.tsx
src/features/signal/components/TrafficLightDashboard.tsx
src/features/signal/components/SignalCard.tsx
src/features/signal/hooks/useSignal.ts
src/features/signal/index.ts
src/features/ai-report/components/ReportGenerator.tsx
src/features/ai-report/hooks/useAiReport.ts
src/features/tax-simulator/components/TaxForm.tsx
src/features/tax-simulator/components/TaxResult.tsx
src/features/tax-simulator/hooks/useTaxSimulator.ts
src/features/notifications/components/NotificationList.tsx
src/features/notifications/hooks/useNotifications.ts

src/hooks/useSubscription.ts
src/lib/auth/getUser.ts

src/components/common/BottomNav.tsx
src/components/common/PlanBadge.tsx
src/components/ui/Button.tsx
src/components/ui/Card.tsx
src/components/ui/Skeleton.tsx
src/components/ui/Toast.tsx
src/components/layout/PageLayout.tsx
src/components/layout/AuthLayout.tsx
```

### 수정 (13개)

```
src/app/page.tsx                     (랜딩/대시보드 분기)
src/app/(auth)/login/page.tsx        (회원가입 링크 + 성공 리다이렉트)
src/app/layout.tsx                   (BottomNav + Toast Provider)
src/app/sector/page.tsx              (SubscriptionGate)
src/app/dividend/page.tsx            (SubscriptionGate)
src/app/coach/page.tsx               (SubscriptionGate)
src/app/journal/page.tsx             (SubscriptionGate)
src/components/common/Header.tsx     (인증 상태 연동)
src/middleware.ts                    (보호 경로 완성)
src/features/ai-coach/hooks/useAiCoach.ts   (히스토리 저장)
src/features/news-impact/hooks/useNewsImpacts.ts (Mock 지원)
src/features/portfolio/hooks/usePortfolios.ts    (Mock 지원)
src/features/mock-trading/hooks/useMockAccount.ts (Mock 지원)
```

---

## 12. 성공 기준

| # | 기준 | 검증 방법 |
|---|------|---------|
| 1 | `USE_MOCK=true`에서 전체 페이지 에러 없음 | `npm run build` 성공 |
| 2 | 회원가입 → 이메일 인증 → 온보딩 → 홈 플로우 | 수동 테스트 |
| 3 | Free 계정으로 /sector 접근 시 SubscriptionGate 표시 | 수동 테스트 |
| 4 | 모바일 375px에서 BottomNav 표시 | DevTools |
| 5 | TypeScript 오류 0건 | `tsc --noEmit` |
| 6 | CLAUDE.md 원칙 100% 준수 | gap-detector |
