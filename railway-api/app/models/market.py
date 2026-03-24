"""시장 데이터 Pydantic 모델"""
from typing import List
from pydantic import BaseModel


class OHLCVPoint(BaseModel):
    time: str        # 'YYYY-MM-DD'
    open: float
    high: float
    low: float
    close: float
    volume: int


class StockIndexResponse(BaseModel):
    market: str
    value: float
    change: float
    change_rate: float
    timestamp: str
    chart_data: List[OHLCVPoint]
    cached: bool
    mock: bool = False


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
    type: str


class DisclosureResponse(BaseModel):
    code: str
    disclosures: List[DisclosureItem]
    cached: bool
