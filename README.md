# fast

FastAPI 연습용 개인 플레이그라운드 프로젝트입니다.

DB 연결, Pydantic 모델, API 라우팅 같은 것들을 가볍게 붙여보면서 익혀보는 용도입니다.  
실서비스나 배포를 목적으로 한 프로젝트는 아닙니다.

## 현재 상태

- FastAPI 기본 세팅
- Pydantic `BaseModel` 예제 (`Item`)
- 샘플 API: `GET /`, `GET /items/{item_id}`, `PUT /items/{item_id}`
- Swagger UI: http://127.0.0.1:8000/docs

## 실행 방법

```bash
cd fast
source .venv/bin/activate
fastapi dev main.py --host 127.0.0.1 --port 8000
```

가상환경 없이 실행하려면:

```bash
.venv/bin/fastapi dev main.py --host 127.0.0.1 --port 8000
```

## 기술 스택

- Python 3.11
- FastAPI
- Pydantic
- Uvicorn

## 메모

- `.venv/`는 git에 포함하지 않음
- 필요하면 `requirements.txt` 추가 예정
