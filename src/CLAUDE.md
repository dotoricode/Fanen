# src/ CLAUDE.md

## 디렉토리 구조
- `app/` — Next.js App Router 페이지 및 레이아웃
- `components/common/` — 공통 UI 컴포넌트 (DisclaimerBanner, AiBadge, LanguageToggle, UiModeSwitch, TrafficLightSignal, SubscriptionGate)
- `features/` — 기능별 컴포넌트 모음 (feature 단위 분리)
- `lib/supabase/` — Supabase 클라이언트 (client.ts, server.ts)
- `lib/` — 유틸리티, API 클라이언트, 상수 (plans.ts 등)
- `types/` — TypeScript 타입 정의 (database.types.ts 등)

## 컴포넌트 명명 규칙
- 컴포넌트 파일명: **PascalCase** (예: DisclaimerBanner.tsx)
- 유틸리티/훅 파일명: **camelCase** (예: useProfile.ts)
- 타입 파일명: **camelCase** (예: database.types.ts)

## Import Alias
`@/*` → `./src/*` 로 매핑됨 (tsconfig.json paths 설정)

```typescript
// 올바른 import 예시
import { DisclaimerBanner } from '@/components/common';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';
```

## 'use client' 지시어 사용 기준
- 브라우저 API (localStorage, window 등)를 사용할 때
- 이벤트 핸들러 (onClick, onChange 등)가 필요할 때
- React 훅 (useState, useEffect 등)을 사용할 때
- 위 조건에 해당하지 않으면 서버 컴포넌트로 유지
