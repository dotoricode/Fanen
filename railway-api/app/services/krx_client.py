"""
KRX API 클라이언트
공공데이터포털 KRX 주가정보 API 연동
API 키 미설정 시 mock OHLCV 30일치 반환
"""
import random
import httpx
from datetime import datetime, timedelta
from typing import Dict

from app.core.config import settings


async def get_index_data(market: str) -> Dict:
    """
    KRX 지수 데이터 조회
    - market: 'KOSPI' | 'KOSDAQ'
    - KRX_API_KEY 미설정 시 mock 반환 (mock=True)
    """
    if not settings.KRX_API_KEY:
        return _mock_index(market)

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # 공공데이터포털 KRX API 호출 (실제 URL은 승인 후 확인)
            # 현재는 mock 반환
            return _mock_index(market)
    except Exception:
        return _mock_index(market)


async def get_stock_data(code: str) -> Dict:
    """종목 코드로 주가 조회. KRX_API_KEY 미설정 시 mock 반환."""
    if not settings.KRX_API_KEY:
        return _mock_stock(code)

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            return _mock_stock(code)
    except Exception:
        return _mock_stock(code)


def _generate_mock_ohlcv(base_price: float, days: int = 30):
    """mock OHLCV 데이터 30일치 생성"""
    data = []
    price = base_price
    today = datetime.now()

    for i in range(days, 0, -1):
        date = today - timedelta(days=i)
        # 주말 제외
        if date.weekday() >= 5:
            continue
        change_pct = random.uniform(-0.02, 0.02)
        open_p = price
        close_p = round(price * (1 + change_pct), 2)
        high_p = round(max(open_p, close_p) * random.uniform(1.0, 1.01), 2)
        low_p = round(min(open_p, close_p) * random.uniform(0.99, 1.0), 2)
        data.append({
            "time": date.strftime("%Y-%m-%d"),
            "open": open_p,
            "high": high_p,
            "low": low_p,
            "close": close_p,
            "volume": random.randint(100000, 5000000),
        })
        price = close_p
    return data


def _mock_index(market: str) -> Dict:
    """KOSPI/KOSDAQ mock 지수 데이터"""
    base = 2650.0 if market == "KOSPI" else 870.0
    ohlcv = _generate_mock_ohlcv(base)
    last = ohlcv[-1] if ohlcv else {"close": base}
    prev = ohlcv[-2] if len(ohlcv) >= 2 else {"close": base}
    change = round(last["close"] - prev["close"], 2)

    return {
        "market": market,
        "value": last["close"],
        "change": change,
        "change_rate": round(change / prev["close"] * 100, 2),
        "timestamp": datetime.now().isoformat(),
        "chart_data": ohlcv,
        "cached": False,
        "mock": True,
    }


def _mock_stock(code: str) -> Dict:
    """종목 코드 mock 주가 데이터"""
    stock_map = {
        "005930": ("삼성전자", 75000.0),
        "000660": ("SK하이닉스", 185000.0),
        "035720": ("카카오", 42000.0),
    }
    name, base = stock_map.get(code, ("알 수 없음", 50000.0))
    ohlcv = _generate_mock_ohlcv(base)
    last = ohlcv[-1] if ohlcv else {"close": base}
    prev = ohlcv[-2] if len(ohlcv) >= 2 else {"close": base}
    change = round(last["close"] - prev["close"], 2)

    return {
        "code": code,
        "name": name,
        "price": last["close"],
        "change": change,
        "change_rate": round(change / prev["close"] * 100, 2),
        "volume": 1000000,
        "timestamp": datetime.now().isoformat(),
        "chart_data": ohlcv,
        "cached": False,
        "mock": True,
    }
