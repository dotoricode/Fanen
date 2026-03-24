"""
KRX 시장 데이터 라우터
GET /api/krx/index — 지수 조회 (공개 엔드포인트)
GET /api/krx/stock — 종목 시세 조회 (공개 엔드포인트)
"""
import logging

from fastapi import APIRouter, HTTPException

from app.models.market import StockIndexResponse, StockPriceResponse
from app.services.cache import get_cached, set_cached
from app.services.krx_client import krx_client

logger = logging.getLogger(__name__)

# KRX 라우터 — 인증 불필요 (공개 시장 데이터)
router = APIRouter(prefix="/api/krx", tags=["krx"])

# Redis 캐시 TTL: 60초 (실시간 시세 데이터)
KRX_INDEX_TTL = 60
KRX_STOCK_TTL = 60


@router.get("/index", response_model=StockIndexResponse)
async def get_index(market: str = "KOSPI") -> StockIndexResponse:
    """
    KRX 시장 지수를 조회합니다.

    - 인증 불필요 (공개 엔드포인트)
    - Redis 캐시 TTL: 60초
    - KRX 공식 API에서 실시간 지수 데이터 반환
    - 캐시 히트 시 cached: true 반환

    Args:
        market: 시장 구분 ('KOSPI', 'KOSDAQ', 'KOSPI200' 등, 기본값: 'KOSPI')
    """
    # 캐시 키 구성
    cache_key = f"krx:index:{market}"

    # Redis 캐시 확인
    cached_data = get_cached(cache_key)
    if cached_data is not None:
        logger.info("KRX 지수 캐시 히트 — market: %s", market)
        return StockIndexResponse(**{**cached_data, "cached": True})

    # KRX 클라이언트로 실시간 데이터 조회
    try:
        data = await krx_client.get_index_data(market)
    except Exception as e:
        logger.error("KRX 지수 조회 실패 — market: %s, 오류: %s", market, e)
        raise HTTPException(
            status_code=502,
            detail=f"KRX 지수 데이터 조회에 실패했습니다: {e}",
        )

    # Redis에 캐시 저장
    set_cached(cache_key, data.model_dump(), ttl=KRX_INDEX_TTL)

    logger.info("KRX 지수 조회 완료 — market: %s, 값: %s", market, data.value)
    return StockIndexResponse(**data.model_dump(), cached=False)


@router.get("/stock", response_model=StockPriceResponse)
async def get_stock(code: str) -> StockPriceResponse:
    """
    KRX 종목 시세를 조회합니다.

    - 인증 불필요 (공개 엔드포인트)
    - Redis 캐시 TTL: 60초
    - KRX 공식 API에서 실시간 종목 데이터 반환
    - 캐시 히트 시 cached: true 반환

    Args:
        code: 종목 코드 (예: '005930' for 삼성전자)
    """
    if not code:
        raise HTTPException(status_code=400, detail="종목 코드를 입력해주세요.")

    # 캐시 키 구성
    cache_key = f"krx:stock:{code}"

    # Redis 캐시 확인
    cached_data = get_cached(cache_key)
    if cached_data is not None:
        logger.info("KRX 종목 캐시 히트 — code: %s", code)
        return StockPriceResponse(**{**cached_data, "cached": True})

    # KRX 클라이언트로 실시간 데이터 조회
    try:
        data = await krx_client.get_stock_data(code)
    except Exception as e:
        logger.error("KRX 종목 조회 실패 — code: %s, 오류: %s", code, e)
        raise HTTPException(
            status_code=502,
            detail=f"KRX 종목 데이터 조회에 실패했습니다: {e}",
        )

    # Redis에 캐시 저장
    set_cached(cache_key, data.model_dump(), ttl=KRX_STOCK_TTL)

    logger.info("KRX 종목 조회 완료 — code: %s, 종목명: %s", code, data.name)
    return StockPriceResponse(**data.model_dump(), cached=False)
