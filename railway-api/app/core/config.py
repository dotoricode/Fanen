"""
환경변수 설정 — Pydantic Settings 기반
Railway 배포 및 로컬 개발 환경 모두 지원
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """파낸 AI API 환경변수 설정"""

    # Supabase 연결 정보
    supabase_url: str
    supabase_service_role_key: str
    supabase_jwt_secret: str

    # Anthropic Claude API 키
    anthropic_api_key: str

    # Railway 환경 (development / production)
    railway_environment: str = "development"

    # CORS 허용 오리진 목록
    allowed_origins: list[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


# 싱글톤 인스턴스 — 앱 전역에서 사용
settings = Settings()  # type: ignore[call-arg]
