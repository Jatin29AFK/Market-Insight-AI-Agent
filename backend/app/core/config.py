from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv()


LOCAL_DEV_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


def get_allowed_origins() -> list[str]:
    origins = os.getenv(
        "ALLOWED_ORIGINS",
        ",".join(LOCAL_DEV_ORIGINS)
    )

    configured_origins = [
        origin.strip()
        for origin in origins.split(",")
        if origin.strip()
    ]

    return list(dict.fromkeys([*configured_origins, *LOCAL_DEV_ORIGINS]))


class Settings(BaseModel):
    APP_NAME: str = "Market Insight AI"
    APP_VERSION: str = "1.0.0"

    ALLOWED_ORIGINS: list[str] = get_allowed_origins()

    GROQ_API_KEY: str | None = os.getenv("GROQ_API_KEY")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")


settings = Settings()
