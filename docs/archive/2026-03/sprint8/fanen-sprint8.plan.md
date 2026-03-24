# fanen-sprint8 Plan Document

> 작성일: 2026-03-24
> PRD 참조: docs/00-pm/fanen.prd.md
> 이전 스프린트: Sprint 4(인증) + Sprint 5(배당/포트폴리오) + Sprint 6(모의투자/일지) + Sprint 7(AI 코치 핀이)

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | Sprint 7까지 KRX/DART 실 데이터 없이 mock 응답만 사용 중. TradingView 차트 미구현으로 홈·뉴스 페이지가 시각적으로 빈약. Redis 캐시도 news/sector 외 미연동. |
| **Solution** | Railway FastAPI에 KRX·DART API 연동 엔드포인트 추가 + TradingView Lightweight Charts 컴포넌트 구현 + Redis 캐시 레이어 + Railway cron 일별 섹터 갱신 |
| **Function UX** | 홈(`/`) 코스피/코스닥 지수 차트 → `/news` 관련 종목 차트 → 차트 클릭 시 DART 공시 링크. KRX 미연동 시 graceful fallback(mock 데이터) |
| **Core Value** | "AI 환각 방지" 원칙의 마지막 퍼즐 완성 — KRX·DART 실 데이터를 파이프라인으로 공급해 AI 생성 수치를 완전 바인딩 |

---

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | 실 금융 데이터 없이는 AI 코치 핀이가 "환각"에 의존 — KRX·DART 연동으로 데이터 신뢰도 확보 |
| **WHO** | 전체 사용자 (차트), 특히 60대 은퇴자(배당 종목 차트), 40대 직장인(시장 지수 파악) |
| **RISK** | KRX API 공공데이터포털 승인 지연, DART API 요청한도(일 10,000건), TradingView SSR 충돌 |
| **SUCCESS** | 홈·뉴스 차트 렌더링, Railway `/api/krx/stock` 정상 응답, Redis 캐시 hit 확인 |
| **SCOPE** | Sprint 8: 8-1(TradingView 차트) + 8-2(KRX API) + 8-3(DART API) + 8-4(Redis 캐시) + 8-5(cron 갱신) |

---

## 1. 요구사항

### 1.1 기능 목록

| # | 기능 | 경로/위치 | 우선도 |
|---|------|----------|--------|
| 8-1 | TradingView Lightweight Charts 컴포넌트 | `src/components/common/StockChart.tsx` | P0 |
| 8-1a | 홈 페이지 지수 차트 (코스피/코스닥) | `src/app/page.tsx` 수정 | P0 |
| 8-1b | 뉴스 페이지 종목 차트 | `src/features/news/` 수정 | P0 |
| 8-2 | KRX API 연동 엔드포인트 | `railway-api/app/routes/krx.py` | P0 |
| 8-3 | DART API 연동 엔드포인트 | `railway-api/app/routes/dart.py` | P1 |
| 8-4 | Redis 캐시 레이어 (주가/재무) | `railway-api/app/services/cache.py` | P0 |
| 8-5 | Railway cron 섹터 맵 일별 갱신 | `railway-api/cron.json` 수정 | P1 |

### 1.2 KRX API 엔드포인트 설계

```
GET /api/krx/stock?code={종목코드}
Response: { code, name, price, change, change_rate, volume, timestamp, cached: bool }

GET /api/krx/index?market={KOSPI|KOSDAQ}
Response: { market, value, change, change_rate, timestamp, chart_data: OHLCV[], cached: bool }
```

- **Redis TTL**: 1분 (장중), 1일 (장외/주말)
- **KRX 미설정 시 fallback**: mock OHLCV 데이터 반환 + `mock: true` 플래그

### 1.3 DART API 엔드포인트 설계

```
GET /api/dart/disclosure?code={종목코드}&limit=5
Response: { disclosures: [{ title, date, url, type }], cached: bool }
```

- **Redis TTL**: 1일
- **DART 미설정 시**: 빈 배열 반환 (graceful degradation)

### 1.4 TradingView StockChart 설계

```typescript
// src/components/common/StockChart.tsx
interface StockChartProps {
  data: OHLCV[];          // { time, open, high, low, close, volume }
  height?: number;        // 기본 300px
  type?: 'candlestick' | 'line';
  title?: string;
}
```

- **SSR 비활성화 필수**: `dynamic(() => import(...), { ssr: false })`
- TradingView Lightweight Charts는 `window` 참조로 SSR 불가
- Wrapper 컴포넌트 패턴: `StockChart.tsx` (래퍼) + `StockChartInner.tsx` (실제 차트)

### 1.5 환경변수 추가

```bash
# railway-api/.env (Railway 환경변수 설정 필요)
KRX_API_KEY=공공데이터포털_인증키
DART_API_KEY=DART_OpenAPI_인증키
```

---

## 2. 기술 제약

### 2.1 TradingView SSR 충돌 방지

```typescript
// 잘못된 방법 — SSR에서 window 참조 오류
import { createChart } from 'lightweight-charts';

// 올바른 방법 — dynamic import + ssr: false
const StockChart = dynamic(() => import('./StockChartInner'), { ssr: false });
```

### 2.2 KRX API 공공데이터포털

- 기관코드: KRX (한국거래소)
- 공공데이터포털(data.go.kr) 활용 신청 필요
- 사전 승인 전 mock 데이터로 개발 진행

### 2.3 DART OpenAPI

- 금융감독원 DART OpenAPI (opendart.fss.or.kr)
- API 키 발급 즉시 사용 가능 (자동 승인)
- 일 요청한도: 10,000건

### 2.4 Redis 캐시 전략

```python
# 주가 데이터: 장중(09:00~15:30) 1분, 장외 1일
TTL_STOCK_INTRADAY = 60       # 1분
TTL_STOCK_CLOSED = 86400      # 1일

# 재무/공시: 1일
TTL_FINANCIAL = 86400         # 1일
TTL_DISCLOSURE = 86400        # 1일
```

---

## 3. 성공 기준

| 항목 | 기준 |
|------|------|
| 홈 페이지 차트 | 코스피/코스닥 라인 차트 렌더링 (mock 또는 실 데이터) |
| 뉴스 페이지 차트 | 뉴스 관련 종목 코드로 캔들 차트 표시 |
| KRX 엔드포인트 | `GET /api/krx/index?market=KOSPI` → 200 응답 (mock 포함) |
| DART 엔드포인트 | `GET /api/dart/disclosure?code=005930` → 빈 배열 이상 응답 |
| Redis 캐시 | 동일 요청 2회 시 `cached: true` 반환 |
| cron | `cron.json` 일별 섹터 갱신 job 등록 |
| 빌드 | `npm run build` 14+ 페이지 성공 |

---

## 4. 리스크 및 대응

| 리스크 | 가능성 | 대응 |
|--------|--------|------|
| KRX API 미승인 | 높음 | mock OHLCV로 개발 진행 → 승인 후 env만 교체 |
| TradingView SSR 오류 | 중간 | dynamic import + ssr:false 패턴 엄수 |
| DART 요청한도 초과 | 낮음 | Redis TTL 1일로 캐시, 재요청 방지 |
| Railway cron 미동작 | 중간 | 수동 trigger 엔드포인트 추가로 검증 가능 |

---

## 5. 구현 순서 (Do Phase 가이드)

### M1: Railway FastAPI (백엔드 우선)
1. `railway-api/app/services/krx_client.py` — KRX API 클라이언트 (httpx + mock fallback)
2. `railway-api/app/services/dart_client.py` — DART API 클라이언트
3. `railway-api/app/models/market.py` — OHLCV, StockPrice Pydantic 모델
4. `railway-api/app/routes/krx.py` — KRX 라우터
5. `railway-api/app/routes/dart.py` — DART 라우터
6. `railway-api/app/main.py` 수정 — 신규 라우터 등록
7. `railway-api/cron.json` 수정 — 섹터 갱신 cron 추가
8. `requirements.txt` 업데이트 (추가 패키지 없음, httpx 기존 포함)

### M2: Frontend (차트 컴포넌트)
1. `npm install lightweight-charts` 설치
2. `src/lib/railway.ts` 수정 — `getKrxIndex()`, `getKrxStock()` 함수 추가
3. `src/types/market.types.ts` — OHLCV 타입 정의
4. `src/components/common/StockChartInner.tsx` — 실제 TradingView 차트
5. `src/components/common/StockChart.tsx` — dynamic import 래퍼
6. `src/app/page.tsx` 수정 — 홈 코스피/코스닥 차트 섹션 추가
7. `src/features/news/components/NewsImpactList.tsx` 수정 — 종목 차트 연동

