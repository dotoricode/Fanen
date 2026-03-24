"""
Cron 작업 라우터 (내부 전용)
POST /api/cron/collect-news — X-Cron-Secret 헤더 인증 (JWT 미적용)
"""
import logging

from fastapi import APIRouter, Header, HTTPException, status

from app.core.config import settings
from app.services.news_analyzer import analyze_news_impact

logger = logging.getLogger(__name__)

# Cron 라우터 (내부 전용, JWT 미적용)
router = APIRouter(prefix="/api/cron", tags=["cron"])

# Sprint 3에서 실제 연결할 샘플 뉴스 헤드라인 (placeholder)
SAMPLE_NEWS_HEADLINES = [
    {"headline": "코스피 장중 2% 급락 — 외국인 대규모 순매도", "source": None},
    {"headline": "원/달러 환율 1450원 돌파 — 10년 만에 최고치", "source": None},
]


@router.post("/collect-news")
async def collect_news(
    x_cron_secret: str | None = Header(None),
) -> dict:
    """
    뉴스 수집 Cron 작업 엔드포인트 (내부 전용)

    - X-Cron-Secret 헤더로 인증 (JWT 미적용)
    - cron_secret 미설정 또는 불일치 시 403 반환
    - 뉴스 수집은 Sprint 3에서 실제 뉴스 소스 연결 예정 (현재 placeholder)
    - 수집된 헤드라인을 news_analyzer로 분석하는 흐름 완성
    """
    # cron_secret 인증 (빈 문자열이면 403)
    if not settings.cron_secret:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cron 시크릿이 설정되지 않았습니다",
        )

    if x_cron_secret != settings.cron_secret:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="유효하지 않은 Cron 시크릿입니다",
        )

    logger.info("Cron 뉴스 수집 작업 시작")

    # Sprint 3에서 실제 뉴스 소스(KRX/DART/네이버뉴스) 연결 예정
    # 현재는 샘플 헤드라인으로 분석 흐름 검증
    collected_count = 0
    analyzed_results = []

    for news_item in SAMPLE_NEWS_HEADLINES:
        try:
            result = await analyze_news_impact(
                headline=news_item["headline"],
                source=news_item.get("source"),
            )
            analyzed_results.append({
                "headline": result.headline,
                "impact_score": result.impact_score,
                "sentiment": result.sentiment,
            })
            collected_count += 1
        except Exception as e:
            logger.error("뉴스 분석 실패 (headline=%s): %s", news_item["headline"], e)

    logger.info("Cron 뉴스 수집 완료 — 분석 수: %d", collected_count)

    return {
        "status": "completed",
        "collected_count": collected_count,
        "analyzed_results": analyzed_results,
        "note": "Sprint 3에서 실제 뉴스 소스(KRX/DART) 연결 예정",
    }


@router.post("/sector-refresh")
async def sector_refresh(
    x_cron_secret: str | None = Header(None),
) -> dict:
    """
    섹터 인과관계 맵 일별 갱신 트리거 (내부 전용)

    - 평일 오전 8시(KST) 실행 예정 (schedule: 0 8 * * 1-5)
    - X-Cron-Secret 헤더로 인증
    - 실제 갱신 로직은 sector_analyzer 서비스 호출
    """
    # cron_secret 인증 (빈 문자열이면 403)
    if not settings.cron_secret:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cron 시크릿이 설정되지 않았습니다",
        )

    if x_cron_secret != settings.cron_secret:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="유효하지 않은 Cron 시크릿입니다",
        )

    logger.info("Cron 섹터 갱신 작업 시작")

    # TODO: sector_analyzer 서비스 연결 (Sprint 8에서 구현 예정)
    # from app.services.sector_analyzer import refresh_sector_map
    # result = await refresh_sector_map()

    logger.info("Cron 섹터 갱신 트리거 완료")

    return {"status": "triggered", "job": "sector-refresh"}
