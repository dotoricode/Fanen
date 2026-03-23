# src/components/common/ CLAUDE.md

## 공통 컴포넌트 사용 규칙

### DisclaimerBanner
- **모든 분석 화면에 필수 사용**
- variant: 'default' | 'pack' | 'tax' | 'signal'
- 면책 고지 문구를 variant에 따라 표시

### AiBadge
- **AI 생성 콘텐츠에만 사용**
- source prop이 있으면 출처 URL 링크 포함
- "AI 분석" 뱃지 표시

### TrafficLightSignal
- **DisclaimerBanner와 반드시 함께 사용**
- signal: 'buy' | 'hold' | 'sell'
- reason: AI 분석 근거 텍스트
- buy(초록), hold(노랑), sell(빨강) 신호등 UI

### SubscriptionGate
- **profiles.subscription_tier 기반으로 판단**
- requiredPlan: 'free' | 'pro' | 'premium'
- 미달 시 업그레이드 유도 모달 표시

### LanguageToggle
- localStorage 상태 관리 ('fanen-lang')
- 전문가 모드 ↔ 일반인 모드 토글

### UiModeSwitch
- localStorage 상태 관리 ('fanen-ui-mode')
- Standard ↔ Senior 모드 전환
- document.documentElement.classList 'senior' 클래스 토글

## Import 방법
```typescript
import { DisclaimerBanner, AiBadge, TrafficLightSignal } from '@/components/common';
```
