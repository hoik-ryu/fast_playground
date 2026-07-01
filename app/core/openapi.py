"""
OpenAPI(Swagger) 전역 설정.

이 파일의 title, description, tags 등을 수정하면 /docs 에 반영됩니다.
각 API의 summary/description은 endpoints 파일, 필드 설명은 schemas 파일에서 수정하세요.
"""

API_METADATA = {
    "title": "FastAPI Playground",
    "description": "개인 학습용 FastAPI 보일러플레이트",
    "version": "0.1.0",
}

OPENAPI_TAGS = [
    {
        "name": "Items",
        "description": "상품 CRUD API",
    },
]
