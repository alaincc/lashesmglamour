import json
from typing import List, Union, Optional
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Lashes & MGlamour API"
    SECRET_KEY: str = "luxe_super_secure_secret_key_change_me_in_production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:4321",  # Default Astro dev port
        "https://lashesmglamour.com",
        "https://www.lashesmglamour.com",
        "http://lashesmglamour.com",
        "http://www.lashesmglamour.com",
    ]


    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Databases configurations
    DATABASE_URL: str = "postgresql://admin:luxe_secure_pass@localhost:5432/lashes_db"
    REDIS_URL: str = "redis://localhost:6379/0"

    # Square configurations
    SQUARE_ACCESS_TOKEN: str = "sandbox-sq0atb-XXXXXXXXXXXX"
    SQUARE_APPLICATION_ID: str = "sandbox-sq0idp-XXXXXXXXXXXX"
    SQUARE_LOCATION_ID: str = "L-XXXXXXXXXXXX"
    SQUARE_ENVIRONMENT: str = "sandbox"  # sandbox or production
    SQUARE_WEBHOOK_SIGNATURE: str = "webhook_sig_XXXXXXXXXXXX"

    # Admin portal login configuration
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD_HASH: str = "$2b$12$EixZaYVK1fsYi1FnQsOgleJ9o.Edf0w7nI96W5E.1/U2d2z2c.W4W"  # default: 'admin123'

    # SMTP configurations
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: str = "Lashes & MGlamour"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
