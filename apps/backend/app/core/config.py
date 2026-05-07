from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    environment: str = Field(default="development", alias="BACKEND_ENV")
    host: str = Field(default="0.0.0.0", alias="BACKEND_HOST")
    port: int = Field(default=8000, alias="BACKEND_PORT")
    cors_origins_raw: str = Field(default="http://localhost:3000", alias="BACKEND_CORS_ORIGINS")
    cors_origin_regex: str = Field(
        default=r"^(chrome-extension://.*|https://.*|http://localhost(:\d+)?)$",
        alias="BACKEND_CORS_ORIGIN_REGEX",
    )
    database_url: str = Field(
        default="postgresql+asyncpg://careeros:careeros@localhost:5432/careeros",
        alias="DATABASE_URL",
    )
    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")
    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")
    openai_model_default: str = Field(default="gpt-5.4-mini", alias="OPENAI_MODEL_DEFAULT")
    openai_model_advanced: str = Field(default="gpt-5.5", alias="OPENAI_MODEL_ADVANCED")
    secret_key: str = Field(default="change-me", alias="SECRET_KEY")
    access_token_expire_minutes: int = Field(default=60, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    refresh_token_expire_days: int = Field(default=30, alias="REFRESH_TOKEN_EXPIRE_DAYS")
    rate_limit_requests: int = Field(default=120, alias="RATE_LIMIT_REQUESTS")
    rate_limit_window_seconds: int = Field(default=60, alias="RATE_LIMIT_WINDOW_SECONDS")
    analytics_cache_ttl_seconds: int = Field(default=120, alias="ANALYTICS_CACHE_TTL_SECONDS")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    enable_db_auto_create: bool = Field(default=True, alias="ENABLE_DB_AUTO_CREATE")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins_raw.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
