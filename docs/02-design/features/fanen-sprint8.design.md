# fanen-sprint8 Design Document

## Context Anchor

| 항목 | 내용 |
|------|------|
| **WHY** | KRX·DART 실 데이터 파이프라인으로 AI 환각 방지 완성, TradingView 차트로 시각화 |
| **WHO** | 전체 사용자 (차트), 60대 은퇴자 (배당 종목), 40대 직장인 (시장 지수) |
| **RISK** | TradingView SSR 충돌(dynamic import 필수), KRX API 미승인(mock fallback), DART 요청한도 |
| **SUCCESS** | 홈·뉴스 차트 렌더링, `/api/krx/index` 정상 응답, Redis cached:true 확인, 빌드 성공 |
| **SCOPE** | 8-1(차트) + 8-2(KRX) + 8-3(DART) + 8-4(Redis 캐시) + 8-5(cron) |

---

## 선택된 아키텍처: Option C — Pragmatic Balance

### 판단 근거
- Option A (Minimal): TradingView SSR 위험 처리 미흡
- Option B (Clean): 파일 과다, 현재 팀 규모에 비해 과도한 추상화
- **Option C (Pragmatic)**: 기존 `railway.ts` 패턴 유지 + dynamic import 래퍼 패턴으로 SSR 안전

---

## 1. 디렉토리 구조

```
railway-api/app/
├── routes/
│   ├── krx.py              # GET /api/krx/index, /api/krx/stock (신규)
│   └── dart.py             # GET /api/dart/disclosure (신규)
├── services/
│   ├── krx_client.py       # KRX API httpx 클라이언트 + mock fallback (신규)
│   └── dart_client.py      # DART OpenAPI 클라이언트 (신규)
├── models/
│   └── market.py           # OHLCV, StockPrice, Disclosure Pydantic 모델 (신규)
└── main.py                 # krx/dart 라우터 등록 (수정)

railway-api/
├── cron.json               # 섹터 갱신 cron 추가 (수정)
└── requirements.txt        # 변경 없음 (httpx 이미 포함)

src/
├── types/
│   └── market.types.ts     # OHLCV, StockPrice TS 타입 (신규)
├── lib/
│   └── railway.ts          # getKrxIndex(), getKrxStock() 추가 (수정)
├── components/common/
│   ├── StockChartInner.tsx  # TradingView 실제 차트 (신규, 'use client')
│   └── StockChart.tsx       # dynamic import 래퍼 (신규)
└── app/
    └── page.tsx            # 홈 코스피/코스닥 차트 섹션 (수정)

src/features/news/components/
└── NewsImpactList.tsx       # 종목 차트 연동 (수정)
```

---

## 2. Railway FastAPI 설계

### 2.1 Pydantic 모델 (market.py)

```python
from pydantic import BaseModel
from typing import Optional, List

class OHLCVPoint(BaseModel):
    time: str        # 'YYYY-MM-DD' 형식
    open: float
    high: float
    low: float
    close: float
    volume: int

class StockIndexResponse(BaseModel):
    market: str      # 'KOSPI' | 'KOSDAQ'
    value: float
    change: float
    change_rate: float
    timestamp: str
    chart_data: List[OHLCVPoint]
    cached: bool
    mock: bool = False   # KRX 미연동 시 True

class StockPriceResponse(BaseModel):
    code: str
    name: str
    price: float
    change: float
    change_rate: float
    volume: int
    timestamp: str
    chart_data: List[OHLCVPoint]
    cached: bool
    mock: bool = False

class DisclosureItem(BaseModel):
    title: str
    date: str
    url: str
    type: str        # '실적', '공시', '기타'

class DisclosureResponse(BaseModel):
    code: str
    disclosures: List[DisclosureItem]
    cached: bool
```

### 2.2 KRX 클라이언트 (krx_client.py)

```python
import httpx
from app.core.config import settings

KRX_API_URL = "https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService"

async def get_index_data(market: str) -> dict:
    """KRX 지수 데이터 조회. API 키 미설정 시 mock 반환."""
    if not settings.KRX_API_KEY:
        return _mock_index(market)
    # httpx 실제 호출
    ...

def _mock_index(market: str) -> dict:
    """KRX 미연동 시 mock OHLCV 30일치 반환"""
    base = 2650.0 if market == "KOSPI" else 850.0
    # 30일 mock 데이터 생성
    ...
```

### 2.3 KRX 라우터 (krx.py)

```python
GET /api/krx/index?market=KOSPI        # 공개 엔드포인트 (인증 불필요)
GET /api/krx/stock?code=005930         # 공개 엔드포인트
```

- Redis 캐시 키: `krx:index:{market}`, `krx:stock:{code}`
- TTL: 장중(09:00~15:30 KST) 60초, 장외 86400초

### 2.4 DART 라우터 (dart.py)

```python
GET /api/dart/disclosure?code=005930&limit=5   # 공개 엔드포인트
```

- DART OpenAPI URL: `https://opendart.fss.or.kr/api/list.json`
- Redis 캐시 키: `dart:disclosure:{code}`
- TTL: 86400초 (1일)
- API 키 미설정 시: 빈 배열 반환

### 2.5 cron.json 수정

```json
{
  "jobs": [
    {
      "name": "sector-refresh",
      "schedule": "0 8 * * 1-5",
      "command": "python -m cron sector_refresh"
    }
  ]
}
```

---

## 3. Frontend 설계

### 3.1 TypeScript 타입 (market.types.ts)

```typescript
export interface OHLCVPoint {
  time: string;   // 'YYYY-MM-DD'
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockIndexResponse {
  market: string;
  value: number;
  change: number;
  change_rate: number;
  timestamp: string;
  chart_data: OHLCVPoint[];
  cached: boolean;
  mock: boolean;
}

export interface StockPriceResponse {
  code: string;
  name: string;
  price: number;
  change: number;
  change_rate: number;
  volume: number;
  timestamp: string;
  chart_data: OHLCVPoint[];
  cached: boolean;
  mock: boolean;
}
```

### 3.2 railway.ts 확장

```typescript
export async function getKrxIndex(
  market: 'KOSPI' | 'KOSDAQ'
): Promise<StockIndexResponse>

export async function getKrxStock(
  code: string
): Promise<StockPriceResponse>
```

- 인증 헤더 불필요 (공개 엔드포인트)

### 3.3 StockChartInner.tsx (실제 TradingView 차트)

```typescript
'use client';
import { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, LineSeries } from 'lightweight-charts';

interface StockChartInnerProps {
  data: OHLCVPoint[];
  type?: 'candlestick' | 'line';
  height?: number;
  title?: string;
  isMock?: boolean;  // mock 데이터 시 배지 표시
}
```

### 3.4 StockChart.tsx (dynamic import 래퍼)

```typescript
// SSR 방지: dynamic import + ssr: false
import dynamic from 'next/dynamic';

const StockChartInner = dynamic(
  () => import('./StockChartInner'),
  {
    ssr: false,
    loading: () => <div className="h-[300px] animate-pulse bg-gray-100 rounded-lg" />,
  }
);

export default function StockChart(props: StockChartInnerProps) {
  return <StockChartInner {...props} />;
}
```

### 3.5 홈 페이지 차트 섹션

```tsx
// src/app/page.tsx 에 추가
<section>
  <h2>시장 현황</h2>
  <div className="grid grid-cols-2 gap-4">
    <StockChart data={kospiData} title="코스피" type="line" />
    <StockChart data={kosdaqData} title="코스닥" type="line" />
  </div>
</section>
```

- 데이터 fetch: 서버 컴포넌트에서 `getKrxIndex()` 호출
- mock 시 "데이터 업데이트 중" 안내 배지 표시

### 3.6 뉴스 페이지 차트

- `NewsImpactList.tsx`에서 종목 코드가 있는 뉴스 아이템에 차트 버튼 추가
- 클릭 시 `StockChart` 펼침(accordion) — `useState`로 관리

---

## 4. 절대 원칙 준수

- `StockChart`는 `ssr: false` — 위반 시 빌드 오류 발생
- mock 데이터 표시 시 반드시 `mock: true` 배지로 사용자에게 안내
- DART 공시 URL은 AI 생성 금지 — opendart.fss.or.kr에서 직접 가져옴
- DisclaimerBanner: 홈 차트 섹션에도 추가

