# 파낸 Sprint 4 — 인증 완성 + 레이아웃 Design

> 작성일: 2026-03-24
> 버전: 1.0
> Plan 참조: docs/01-plan/features/fanen.plan.md
> 선택 아키텍처: Option C (실용적 균형)

---

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 실 사용자 로그인 가능 상태를 만들어, Beachhead(60대 은퇴자) 타깃 배당 시뮬레이터 기능(Sprint 5)의 토대를 마련한다 |
| **WHO** | 구글 계정을 보유한 모든 타깃 사용자 (60대 은퇴자 포함, OAuth 1클릭으로 진입 장벽 최소화) |
| **RISK** | Supabase OAuth 설정 미완(구글 콘솔 redirect URI 등록) 시 로그인 실패, 미들웨어 쿠키 검증 오류 시 무한 리다이렉트 |
| **SUCCESS** | 구글 로그인 → 홈 리다이렉트 정상 동작, 미인증 사용자 /login 리다이렉트, 프로필 저장/조회 |
| **SCOPE** | OAuth 콜백 + 미들웨어 + 공통 헤더 + 프로필 페이지. 카카오 OAuth, 결제 시스템 제외 |

---

## 1. 개요

### 1.1 현재 상태

| 항목 | 상태 | 비고 |
|------|------|------|
| 로그인 UI | 완성 | 구글/카카오/이메일 버튼 있음 |
| OAuth 콜백 라우트 | **없음** | 로그인 후 무한 대기 상태 |
| 공통 헤더 | **없음** | layout.tsx가 빈 래퍼 |
| 인증 미들웨어 | **없음** | 보호 라우트 없음 |
| 프로필 | **없음** | profiles 테이블은 있음 |

### 1.2 목표 상태

```
[/login] → [구글 OAuth] → [Supabase] → [/api/auth/callback]
               → [쿠키 세션 저장] → [/ 홈 리다이렉트]

[/portfolio, /profile 등 보호 라우트]
    → [middleware.ts 쿠키 검증]
    → 미인증: [/login 리다이렉트]
    → 인증됨: [정상 접근]

[모든 페이지] → [공통 헤더 표시] → [로그인 상태 + 내비게이션]
```

---

## 2. 아키텍처 — Option C (실용적 균형)

### 2.1 세션 관리 방식

**Supabase SSR 패턴** (Next.js 14 App Router 표준):
- 서버 컴포넌트: `createServerClient()` — 쿠키에서 세션 읽기 (읽기 전용)
- 클라이언트 컴포넌트: `createBrowserClient()` — 로그인/로그아웃 액션
- 미들웨어: `createServerClient()` — 쿠키 갱신 (쓰기 가능)
- OAuth 콜백: `exchangeCodeForSession()` — 인증 코드 → 세션 쿠키 교환

```
브라우저 쿠키 (sb-xxx-auth-token)
    ↕
미들웨어 (모든 요청마다 쿠키 갱신 — 세션 만료 방지)
    ↕
서버 컴포넌트 (getUser() — DB 조회 없이 JWT 검증)
    ↕
클라이언트 컴포넌트 (signOut() — 쿠키 삭제)
```

### 2.2 보호 라우트 정의

| 경로 | 보호 여부 | 비고 |
|------|----------|------|
| `/` | 공개 | 뉴스/섹터 미리보기 가능 |
| `/news` | 공개 | Free 기능 |
| `/sector` | 공개 | Free 기능 |
| `/profile` | **보호** | 로그인 필요 |
| `/portfolio` | **보호** | 로그인 필요 |
| `/dividend` | **보호** | 로그인 필요 |
| `/mock-trading` | **보호** | 로그인 필요 |
| `/journal` | **보호** | 로그인 필요 |
| `/api/auth/callback` | 공개 | OAuth 콜백 처리 |

---

## 3. 파일별 설계

### 3.1 `src/app/api/auth/callback/route.ts` (신규)

```typescript
// GET /api/auth/callback?code=xxx
// Supabase OAuth 인증 코드를 세션 쿠키로 교환
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = cookies()
    // 코드 교환 → 세션 쿠키 저장
    await supabase.auth.exchangeCodeForSession(code)
    return NextResponse.redirect(`${origin}${next}`)
  }

  // 코드 없음 — 로그인 페이지로
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
```

**에러 케이스**:
- `code` 파라미터 없음 → `/login?error=auth_callback_error` 리다이렉트
- 코드 교환 실패 → `/login?error=exchange_failed` 리다이렉트

---

### 3.2 `src/middleware.ts` (신규)

```typescript
// 모든 요청에 실행 — 쿠키 세션 갱신 + 보호 라우트 가드
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 보호 라우트 목록
const PROTECTED_ROUTES = ['/profile', '/portfolio', '/dividend', '/mock-trading', '/journal']

export async function middleware(request: NextRequest) {
  // 1. 세션 쿠키 갱신 (만료 방지)
  // 2. 보호 라우트 접근 시 인증 확인
  // 3. 미인증 → /login?next=<현재경로> 리다이렉트
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

**주의**: 미들웨어에서 `getUser()`가 아닌 `getSession()`을 사용 — DB 조회 없이 JWT만 검증 (성능)

---

### 3.3 `src/components/common/Header.tsx` (신규)

**서버 컴포넌트** — 세션을 서버에서 읽어 렌더링

```typescript
// 구조
<header>
  <Logo />           ← "파낸" 텍스트 + 홈 링크
  <Nav>              ← 뉴스 / 섹터 / 포트폴리오 / 배당 / 모의투자
  <UserSection>
    {user ? <UserMenu user={user} /> : <LoginButton />}
```

**`UserMenu`** (클라이언트 컴포넌트 — signOut 필요):
- 사용자 이메일/아바타 표시
- "내 프로필" 링크
- "로그아웃" 버튼 → `supabase.auth.signOut()` → `/login` 리다이렉트

**반응형**:
- 모바일: 햄버거 메뉴 (내비 숨김 + 토글)
- 데스크톱: 수평 내비

---

### 3.4 `src/app/layout.tsx` (수정)

```typescript
// 변경 전: 빈 body만 있음
// 변경 후: Header 추가

import { Header } from '@/components/common/Header'

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <Header />           {/* 추가 */}
        <main>{children}</main>
      </body>
    </html>
  )
}
```

---

### 3.5 `src/features/profile/hooks/useProfile.ts` (신규)

```typescript
'use client'
// profiles 테이블 조회/업데이트 훅

interface Profile {
  id: string            // auth.uid() 매칭
  ui_mode: 'standard' | 'senior'
  language_level: 'general' | 'expert'
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
  plan_tier: 'free' | 'pro' | 'premium'
}

export function useProfile() {
  // 1. 현재 사용자 세션 확인
  // 2. profiles 테이블에서 조회
  // 3. 없으면 기본값으로 INSERT (첫 로그인)
  // 4. 업데이트 함수 반환
  return { profile, loading, error, updateProfile }
}
```

**첫 로그인 처리**: profiles 레코드 없으면 upsert로 기본 프로필 생성

---

### 3.6 `src/app/profile/page.tsx` (신규)

```typescript
// 보호 라우트 — 미들웨어가 미인증 차단
// 서버 컴포넌트로 초기 데이터 로드

export default async function ProfilePage() {
  const supabase = createServerClient(...)
  const { data: { user } } = await supabase.auth.getUser()
  // user는 미들웨어가 보장하므로 null 체크 최소화

  return (
    <div>
      <ProfileForm />   {/* 클라이언트 컴포넌트 */}
    </div>
  )
}
```

**ProfileForm 항목**:
- UI 모드: Standard / 시니어 (큰 글씨)
- 언어 수준: 일반인 / 전문가
- 투자 성향: 안정형 / 균형형 / 공격형
- 저장 버튼 → `useProfile().updateProfile()` 호출

---

## 4. Supabase 설정 확인 사항

### 4.1 구글 OAuth 설정 (Supabase Dashboard)

```
Authentication → Providers → Google
  - Client ID: [구글 콘솔에서 발급]
  - Client Secret: [구글 콘솔에서 발급]
  - Redirect URL: https://prynzbofjuiptsjzunby.supabase.co/auth/v1/callback
```

**구글 콘솔 설정**:
```
APIs & Services → Credentials → OAuth 2.0 Client IDs
  - 승인된 리다이렉션 URI:
    https://prynzbofjuiptsjzunby.supabase.co/auth/v1/callback
    http://localhost:3000/api/auth/callback  (로컬 개발)
```

### 4.2 RLS 확인

`profiles` 테이블 기존 정책:
```sql
-- 본인 프로필만 조회/수정 가능
SELECT: auth.uid() = id
INSERT: auth.uid() = id
UPDATE: auth.uid() = id
```

---

## 5. 패키지 의존성

```bash
# Supabase SSR 패키지 (Next.js 14 App Router용)
npm install @supabase/ssr
# 이미 설치 여부 확인 필요
```

> `@supabase/supabase-js`는 이미 설치되어 있으나, 미들웨어용 `@supabase/ssr` 별도 필요

---

## 6. 에러 처리

| 시나리오 | 처리 방식 |
|---------|----------|
| OAuth 콜백 code 없음 | `/login?error=auth_callback_error` 리다이렉트 |
| 세션 만료 | 미들웨어가 자동 갱신 (Refresh Token 사용) |
| 프로필 로드 실패 | 기본값으로 폴백, 에러 토스트 표시 |
| 로그아웃 실패 | 로컬 세션 클리어 후 `/login` 리다이렉트 |
| 미인증 보호 라우트 접근 | `/login?next=<경로>` 리다이렉트, 로그인 후 원래 경로 복귀 |

---

## 7. 절대 원칙 체크리스트

- [x] 개인정보(프로필) 처리: Supabase DB 직접 (Vercel API Routes 경유 불필요 — 개인 식별 정보이나 금융 민감 정보 아님)
- [x] RLS: profiles 테이블 기존 RLS 정책 유지
- [x] 구독 플랜: `lib/plans.ts` 참조 (프로필에 `plan_tier` 저장)
- [ ] DisclaimerBanner: 프로필 페이지는 금융 분석 화면 아니므로 불필요

---

## 8. 테스트 시나리오

| # | 시나리오 | 기대 결과 |
|---|---------|----------|
| T1 | 구글 로그인 버튼 클릭 | 구글 OAuth 화면 이동 |
| T2 | 구글 인증 완료 | `/api/auth/callback` → `/` 홈 리다이렉트 |
| T3 | 로그인 상태에서 헤더 확인 | 사용자 이메일 + 로그아웃 버튼 표시 |
| T4 | 미인증 상태에서 `/profile` 접근 | `/login?next=/profile` 리다이렉트 |
| T5 | 로그인 후 `/profile` 접근 | 프로필 설정 화면 표시 |
| T6 | 프로필 저장 | Supabase profiles 테이블 업데이트 |
| T7 | 로그아웃 | 세션 삭제 + `/login` 리다이렉트 |
| T8 | 세션 만료 후 페이지 접근 | 미들웨어가 자동 갱신 or `/login` 리다이렉트 |

---

## 9. Session Guide (모듈 맵)

| 모듈 | 파일 | 예상 소요 |
|------|------|---------|
| M1 — OAuth 콜백 | `src/app/api/auth/callback/route.ts` | 30분 |
| M2 — 미들웨어 | `src/middleware.ts` | 30분 |
| M3 — 공통 헤더 | `src/components/common/Header.tsx` + layout.tsx 수정 | 1시간 |
| M4 — 프로필 | `src/features/profile/hooks/useProfile.ts` + `src/app/profile/page.tsx` | 1시간 |

**권장 세션 분할**:
- 세션 A: M1 + M2 (핵심 인증 플로우 완성 — 로그인 동작 확인)
- 세션 B: M3 + M4 (헤더 + 프로필 UI)

```bash
# 세션 A 시작
/pdca do fanen-sprint4 --scope M1,M2

# 세션 B 시작
/pdca do fanen-sprint4 --scope M3,M4
```

---

## 10. 구현 우선순위

```
M1 (OAuth 콜백) → M2 (미들웨어) → M3 (헤더) → M4 (프로필)

반드시 이 순서로 구현:
M1 없으면 로그인이 아예 안 됨
M2 없으면 보호 라우트가 열려 있음
M3은 UX 완성, M4는 개인화 기반
```
