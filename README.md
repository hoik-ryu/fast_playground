# Sales.AX Boilerplate

Sales.AX 제품 개발을 위한 풀스택 보일러플레이트입니다.

인증, 역할(Role), Refresh Token, PostgreSQL, Alembic이 포함된 FastAPI 백엔드와  
React 기반 프론트엔드를 한 저장소에서 시작할 수 있습니다.

## 저장소 구조

```text
sales-ax/
├── frontend/
├── backend/
├── docs/
├── docker-compose.dev.yml
├── README.md
└── .gitignore
```

| 경로 | 역할 |
|------|------|
| `frontend/` | React + Vite 웹 클라이언트 |
| `backend/` | FastAPI 예제 서버 (Mock이 아님) |
| `docs/` | 제품·개발 문서 |
| `docker-compose.dev.yml` | 개발용 PostgreSQL + Backend |

## 기술 스택

- **Frontend:** React 19, TypeScript, Vite, React Router, TanStack Query, Axios, React Hook Form, Zod, Day.js, lucide-react, Recharts, @dnd-kit, Tailwind CSS 4
- **Backend:** FastAPI, SQLAlchemy, Alembic, PostgreSQL, JWT, pwdlib (argon2)
- **패키지 매니저:** pnpm (Frontend), uv (Backend)

프론트엔드 상세 규칙: [`docs/frontend-stack.md`](./docs/frontend-stack.md)  
아키텍처: [`docs/frontend-architecture.md`](./docs/frontend-architecture.md)

## Git Hook

루트 Node 프로젝트 없이 `frontend` Husky가 저장소 루트 `.husky/`를 구성합니다.

- `pre-commit`: staged Frontend(ESLint/Prettier) + staged Backend Python(Ruff)
- `commit-msg`: Conventional Commit (`type(scope): summary` + body 필수)

세부 규칙: [`docs/git-convention.md`](./docs/git-convention.md) · Hook 요약: [`frontend/README.md`](./frontend/README.md)  
`pnpm check`는 Hook이 아니라 수동/CI용 전체 검사입니다.

## 요구 버전

| 도구 | 버전 |
|------|------|
| Node.js | 24.18.0 |
| pnpm | 10.34.5+ |
| Python | 3.12.x |
| uv | 0.11.27+ |

## 포트

| 서비스 | 포트 |
|--------|------|
| Frontend | 5173 |
| Backend | 8000 |
| PostgreSQL | 5432 |

## 빠른 시작

### 1. Database + Backend

```bash
docker compose -f docker-compose.dev.yml up
```

- API: http://localhost:8000  
- Swagger: http://localhost:8000/docs  

### 2. Frontend

```bash
cd frontend
cp .env.example .env
pnpm install
pnpm dev
```

- App: http://localhost:5173  

### Backend만 호스트에서 실행

```bash
cd backend
cp .env.example .env
uv sync
uv run alembic upgrade head
uv run fastapi dev app/main.py
```

`DATABASE_URL`은 로컬 PostgreSQL에 맞게 설정합니다.  
Compose로 Backend를 띄운 경우 포트 `8000` 중복 실행에 주의하세요.

## 환경 변수

| 파일 | 용도 |
|------|------|
| `frontend/.env.example` | `VITE_API_BASE_URL` |
| `backend/.env.example` | DB, CORS, JWT, 회원가입 정책 등 |

실제 값은 `.env`에 두고 git에 커밋하지 않습니다.

## 문서

상세 가이드는 [`docs/`](./docs/)를 참고하세요.
