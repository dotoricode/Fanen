"""
DART 공시 데이터 라우터
GET /api/dart/disclosure — 공시 목록 조회 (공개 엔드포인트)
"""
import logging

from fastapi import APIRouter, HTTPException

from app.models.market import DisclosureResponse
from app.services.cache import get_cached, set_cached
from app.services.dart_client import dart_client

logger = logging.getLogger(__name__)

# DART 라우터 — 인증 불필요 (공개 공시 데이터)
router = APIRouter(prefix="/api/dart", tags=["dart"])

# Redis 캐시 TTL: 86400초 (24시간, 공시는 하루 단위 갱신)
DART_DISCLOSURE_TTL = 86400


@router.get("/disclosure", response_model=DisclosureResponse)
async def get_disclosure(code: str, limit: int = 5) -> DisclosureResponse:
    """
    DART 전자공시 목록을 조회합니다.

    - 인증 불필요 (공개 엔드포인트)
    - Redis 캐시 TTL: 86400초 (24시간)
    - DART 공식 API에서 종목 공시 데이터 반환
    - 캐시 히트 시 cached: true 반환

    Args:
        code: 종목 코드 (예: '005930' for 삼성전자)
        limit: 최대 공시 건수 (기본값: 5)
    """
    if not code:
        raise HTTPException(status_code=400, detail="종목 코드를 입력해주세요.")

    # 캐시 키 구성 (limit은 캐시 키에 포함하지 않고 최대치로 저장 후 슬라이싱)
    cache_key = f"dart:disclosure:{code}"

    # Redis 캐시 확인
    cached_data = get_cached(cache_key)
    if cached_data is not None:
        logger.info("DART 공시 캐시 히트 — code: %s", code)
        # limit 적용하여 반환
        cached_data["disclosures"] = cached_data["disclosures"][:limit]
        return DisclosureResponse(**{**cached_data, "cached": True})

    # DART 클라이언트로 공시 데이터 조회
    try:
        data = await dart_client.get_disclosure(code, limit)
    except Exception as e:
        logger.error("DART 공시 조회 실패 — code: %s, 오류: %s", code, e)
        raise HTTPException(
            status_code=502,
            detail=f"DART 공시 데이터 조회에 실패했습니다: {e}",
        )

    # Redis에 캐시 저장
    set_cached(cache_key, data.model_dump(), ttl=DART_DISCLOSURE_TTL)

    logger.info(
        "DART 공시 조회 완료 — code: %s, 공시 건수: %d", code, len(data.disclosures)
    )
    return DisclosureResponse(**data.model_dump(), cached=False)
