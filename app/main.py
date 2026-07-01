from fastapi import FastAPI

from app.api.v1.router import api_router
from app.core.openapi import API_METADATA, OPENAPI_TAGS

app = FastAPI(**API_METADATA, openapi_tags=OPENAPI_TAGS)
app.include_router(api_router)

