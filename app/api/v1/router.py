from fastapi import APIRouter
from app.api.v1.endpoints.items import router as item_router

api_router = APIRouter()
api_router.include_router(item_router)
