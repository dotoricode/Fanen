# fanen-sprint6 Design Document

## Context Anchor

| Axis | Content |
|------|---------|
| **WHY** | 20~30대 초보 투자자 유입 + 소셜 바이럴 성장 엔진 구축 (Growth Loop) |
| **WHO** | 20~30대 초보 투자자, 투자 경험을 쌓고 싶은 직장인 |
| **RISK** | 실제 주가 API 미연동 시 mock 가격 사용, 시즌제 정산 로직 단순화 |
| **SUCCESS** | 모의투자 거래 실행 가능, 랭킹 표시, 투자 일지 CRUD 완성 |
| **SCOPE** | Sprint 6: 모의투자 게임(6-1) + 랭킹(6-2) + 투자 일지(6-5) |

---

## 1. DB Schema

### mock_seasons
```typescript
{ id, name, start_date, end_date, is_active, created_at }
```

### mock_accounts
```typescript
{ id, user_id, season_id, initial_balance, current_balance, created_at }
```
- initial_balance: 기본 1,000만원 시드머니

### mock_trades
```typescript
{ id, account_id, user_id, stock_code, stock_name, trade_type: 'buy'|'sell', quantity, price, traded_at }
```

### mock_rankings
```typescript
{ id, season_id, user_id, nickname, rank, profit_rate, updated_at }
```

### trade_journals
```typescript
{ id, user_id, trade_id, stock_code, stock_name, note, emotion, ai_feedback, created_at }
```

---

## 2. 디렉토리 구조

```
src/
├── features/
│   ├── mock-trading/
│   │   ├── components/
│   │   │   ├── MockTradingDashboard.tsx  # 잔고 + 수익률 요약
│   │   │   ├── MockTradeForm.tsx         # 매수/매도 폼
│   │   │   ├── MockTradeHistory.tsx      # 거래 내역 목록
│   │   │   └── MockRankingBoard.tsx      # 시즌 랭킹 테이블
│   │   ├── hooks/
│   │   │   ├── useMockAccount.ts         # 계좌 조회/생성
│   │   │   ├── useMockTrades.ts          # 거래 내역 + 매수/매도 실행
│   │   │   └── useMockRanking.ts         # 랭킹 조회
│   │   ├── types.ts
│   │   └── index.ts
│   ├── journal/
│   │   ├── components/
│   │   │   ├── JournalList.tsx           # 투자 일지 목록
│   │   │   ├── JournalCard.tsx           # 개별 일지 카드
│   │   │   └── JournalForm.tsx           # 작성/수정 모달
│   │   ├── hooks/
│   │   │   └── useJournals.ts            # CRUD 훅
│   │   ├── types.ts
│   │   └── index.ts
├── app/
│   ├── mock-trading/
│   │   └── page.tsx
│   └── journal/
│       └── page.tsx
```

---

## 3. 모의투자 설계

### MockTradingDashboard
- 현재 시즌 정보 (시즌명, 기간)
- 잔고: initial_balance, current_balance, 수익률 계산
- 수익률 = (current_balance - initial_balance) / initial_balance * 100

### MockTradeForm
- 입력: 종목코드, 종목명, 매수/매도 선택, 수량, 가격
- 가격: mock 입력 (KRX 미연동 단계)
- 매수 시: current_balance 차감 검증 (잔고 부족 체크)
- 거래 후: mock_trades insert + mock_accounts current_balance 업데이트

### MockRankingBoard
- 현재 활성 시즌의 랭킹 목록
- 컬럼: 순위, 닉네임, 수익률(%)
- 내 랭킹 하이라이트

---

## 4. 투자 일지 설계

### JournalForm
- stock_code, stock_name (선택)
- note: 자유 텍스트 메모
- emotion: 감정 선택 (😊 흥분 / 😐 보통 / 😰 불안 / 😢 후회)
- ai_feedback: 저장 시 Railway FastAPI 호출 예정 (MVP에서는 빈 문자열)

### JournalCard
- 종목명, 날짜, 감정 이모지, 노트 내용
- ai_feedback 있으면 AiBadge와 함께 표시

---

## 5. 절대 원칙
- DisclaimerBanner 필수 (모의투자는 시뮬레이션임을 명시)
- 모의투자는 실제 투자가 아님을 명확히 표시
- 포트폴리오 민감 데이터 → Railway 처리 (MVP에서는 Supabase 직접 처리, 추후 이관)
- 훅에 `'use client'` 미포함, 배럴에서 훅 export 금지
