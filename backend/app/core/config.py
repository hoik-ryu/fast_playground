from typing import Annotated, Literal

from app.core.enums import RegistrationMode
from pydantic import BeforeValidator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


def parse_comma_separated_list(value: str | list[str]) -> list[str]:
    if isinstance(value, str):
        return [item.strip() for item in value.split(",") if item.strip()]
    return value


class Settings(BaseSettings):
    DATABASE_URL: str

    SECRET_KEY: str = "change-this-secret-key"
    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14

    # open: 가입 즉시 로그인 가능 / admin_approval: is_active=False 로 대기
    REGISTRATION_MODE: Literal["open", "admin_approval"] = "open"

    @property
    def requires_admin_approval(self) -> bool:
        return self.REGISTRATION_MODE == RegistrationMode.ADMIN_APPROVAL.value

    CORS_ORIGINS: Annotated[
        list[str],
        NoDecode,
        BeforeValidator(parse_comma_separated_list),
    ] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list[str] = ["*"]
    CORS_ALLOW_HEADERS: list[str] = ["*"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
