# fast

FastAPI를 학습하고 다양한 기능을 실험하기 위한 개인 Playground 프로젝트입니다.

초기에는 FastAPI의 기본 개념(DB 연결, Pydantic, API 라우팅 등)을 익히는 목적으로 시작했으며,
향후에는 인증, 실시간 통신, MQTT, Docker, Admin 기능 등을 포함한
공용 FastAPI Boilerplate로 발전시키는 것을 목표로 합니다.

## 프로젝트 구조

fast/
├── app/
│ ├── main.py # FastAPI 앱 실행 및 Router 등록
│ ├── api/ # API 라우터
│ │ └── v1/
│ │ ├── router.py
│ │ └── endpoints/
│ ├── core/ # 설정 및 공통 기능
│ │ └── config.py
│ ├── db/ # DB 연결 및 세션 관리
│ │ ├── database.py
│ │ └── base.py
│ ├── models/ # SQLAlchemy ORM 모델
│ ├── schemas/ # Pydantic 요청/응답 모델
│ └── services/ # 비즈니스 로직
│
├── alembic/ # DB 마이그레이션 관리
├── .env # 환경 변수
├── alembic.ini
├── requirements.txt
└── README.md

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
