"""
환경변수 설정 — Pydantic Settings 기반
Railway 배포 및 로컬 개발 환경 모두 지원
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """파낸 AI API 환경변수 설정"""

    # Supabase 연결 정보
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""

    # Google Gemini API 키
    gemini_api_key: str = ""

    # Upstash Redis REST API 연결 정보
    upstash_redis_rest_url: str = ""
    upstash_redis_rest_token: str = ""

    # KRX (한국거래소) API 키 — 공공데이터포털에서 발급
    KRX_API_KEY: str = ""

    # DART (전자공시시스템) API 키 — opendart.fss.or.kr에서 발급
    DART_API_KEY: str = ""

    # Cron 작업 인증 시크릿
    cron_secret: str = ""

    # Railway 환경 (development / production)
    railway_environment: str = "development"

    # CORS 허용 오리진 (쉼표 구분 문자열, 예: "http://localhost:3000,http://localhost:3001")
    allowed_origins: str = "http://localhost:3000"

    @property
    def cors_origins(self) -> list[str]:
        """CORS 오리진 리스트 반환"""
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


# 싱글톤 인스턴스 — 앱 전역에서 사용
settings = Settings()  # type: ignore[call-arg]
