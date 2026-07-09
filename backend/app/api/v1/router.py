from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.items import router as item_router
from app.api.v1.endpoints.users import router as user_router
from fastapi import APIRouter

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(item_router)
api_router.include_router(user_router)
