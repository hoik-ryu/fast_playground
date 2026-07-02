import os

from dotenv import load_dotenv

load_dotenv()

# .env 예시: CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
_DEFAULT_CORS_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173"

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", _DEFAULT_CORS_ORIGINS).split(",")
    if origin.strip()
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ["*"]
CORS_ALLOW_HEADERS = ["*"]
