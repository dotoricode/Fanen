# fanen-sprint7 Design Document

## Context Anchor

| Axis | Content |
|------|---------|
| **WHY** | 경쟁사 최고 차별화 기능 — 음성 AI 투자 코치 "핀이" 출시 |
| **WHO** | 60대 은퇴자 (시니어 모드 + 음성), 40대 직장인 (일일 브리핑), 전체 사용자 (채팅) |
| **RISK** | Railway FastAPI 미연동 시 mock 응답, Whisper/Clova 미설정 시 텍스트 전용 |
| **SUCCESS** | 핀이 채팅 UI 렌더링, Railway API 연동, AiBadge + 출처 URL 병기 |
| **SCOPE** | Sprint 7: 핀이 채팅 UI(7-1) + Gemini 연동(7-2) + 시니어 모드 완성(7-5) |

---

## 1. Railway FastAPI 엔드포인트 (기존 `src/lib/railway.ts` 확인 필요)

```
POST /api/coach/ask
Body: { question: string; user_context?: { portfolio?, language_level? } }
Response: { answer: string; source_urls: string[]; disclaimer: string }
```

## 2. 디렉토리 구조

```
src/
├── features/
│   └── ai-coach/
│       ├── components/
│       │   ├── AiCoachChat.tsx      # 채팅 UI (말풍선 + 핀이 아이콘)
│       │   ├── ChatMessage.tsx      # 개별 메시지 말풍선
│       │   └── ChatInput.tsx        # 텍스트 입력 + 전송
│       ├── hooks/
│       │   └── useAiCoach.ts        # Railway API 호출 훅
│       ├── types.ts
│       └── index.ts
├── app/
│   └── coach/
│       └── page.tsx                 # /coach 페이지
```

## 3. 컴포넌트 설계

### AiCoachChat
- 메시지 히스토리 (스크롤 가능, 최대 높이 600px)
- 핀이 아이콘: 파란 원형 배경 + "핀" 텍스트
- 각 AI 응답에 AiBadge + source_urls 링크
- DisclaimerBanner 필수

### ChatMessage
- role: 'user' | 'assistant'
- user: 오른쪽 정렬, 파란 배경
- assistant: 왼쪽 정렬, 흰 배경 + 핀이 아이콘
- loading: 세 점 애니메이션 (...)

### useAiCoach
```typescript
interface ChatMessage { role: 'user' | 'assistant'; content: string; sources?: string[] }
interface UseAiCoachReturn {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (question: string) => Promise<void>;
  clearHistory: () => void;
}
```
- Railway API 호출 실패 시 fallback: "현재 AI 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요."
- messages는 useState로 관리 (세션 내 유지)

## 4. Railway 연동

`src/lib/railway.ts` 파일 확인 후 `analyzeCoach` 또는 신규 함수 추가.

```typescript
export async function askCoach(params: {
  question: string;
  language_level?: 'general' | 'expert';
}): Promise<{ answer: string; source_urls: string[]; disclaimer: string }> {
  const railwayUrl = process.env.NEXT_PUBLIC_RAILWAY_URL;
  if (!railwayUrl) {
    return {
      answer: '현재 AI 서비스가 설정되지 않았습니다.',
      source_urls: [],
      disclaimer: 'AI 분석 결과는 투자 참고자료입니다.',
    };
  }
  // POST /api/coach/ask
}
```

## 5. 절대 원칙
- AI 응답마다 AiBadge + source_urls 병기 필수
- DisclaimerBanner 필수 (AI 투자 분석이므로)
- KRX/DART 수치 직접 생성 금지 (Railway에서만 처리)
- 훅에 `'use client'` 없음, 배럴에서 훅 export 금지
