# Frontend (Sales.AX)

React + Vite 기반 Sales.AX 웹 클라이언트입니다.

아키텍처(레이어·import·Query Key) 상세는  
[`docs/frontend-architecture.md`](../docs/frontend-architecture.md)를 보세요.

## 확정 기술 스택

| 영역              | 표준                                          |
| ----------------- | --------------------------------------------- |
| UI                | React 19                                      |
| 언어              | TypeScript                                    |
| 번들러            | Vite                                          |
| 라우팅            | React Router                                  |
| 서버 상태         | TanStack Query                                |
| HTTP              | Axios (`@shared/api`)                         |
| 폼                | React Hook Form + Zod (`@hookform/resolvers`) |
| 날짜              | Day.js (`@shared/lib/date`)                   |
| 아이콘            | Lucide React (`@shared/ui/icon`)              |
| 차트              | Recharts (`@shared/ui/chart`)                 |
| 칸반 DnD          | `@dnd-kit/*` (`@shared/ui/kanban`)            |
| 인증 UI 상태      | AuthContext (토큰만, `@features/auth`)        |
| 단순 UI 전역 상태 | React Context (필요 시)                       |
| 스타일            | Tailwind CSS 4                                |

**설치하지 않음:** Zustand, Formik, Yup, `@hello-pangea/dnd`

## 디렉터리 (FSD-lite)

```
src/
  app/        # main, App, providers, layouts, router, styles
  pages/      # 라우트 화면 (login, items, me, …)
  features/   # auth, update-profile, change-password, manage-item
  entities/   # user, item
  shared/     # api, lib, ui, config
```

Import는 `@app` / `@pages` / `@features` / `@entities` / `@shared` alias만 사용합니다.

## 코드 스타일

| 도구         | 역할                                             |
| ------------ | ------------------------------------------------ |
| EditorConfig | 인덴트·줄끝·UTF-8 (저장소 루트 `.editorconfig`)  |
| Prettier     | 코드 포맷                                        |
| Oxlint       | 빠른 기본 린트                                   |
| ESLint       | React / TypeScript / Import 품질 + Prettier 연동 |

### 명령

```bash
pnpm format         # Prettier 포맷 적용
pnpm format:check   # 포맷만 검사
pnpm lint           # oxlint + eslint
pnpm lint:fix      # 자동 수정 가능한 린트 이슈 수정
pnpm typecheck      # tsc -b
pnpm check          # lint → typecheck → build
```

### 포맷 규칙 (Prettier)

- `semi: true`
- `singleQuote: true`
- `trailingComma: all`
- `printWidth: 100`
- `tabWidth: 2`

### TypeScript (즉시 적용)

- `strict`
- `noUncheckedIndexedAccess`
- `noImplicitOverride`
- `noFallthroughCasesInSwitch`

`exactOptionalPropertyTypes`는 기존 optional props 패턴과 충돌하여 **추후 적용** 예정입니다.

## Git Hook · Commit 규칙

루트 Node 프로젝트 없이, **Frontend(`pnpm`)에 Husky를 설치**하고 저장소 루트 `.husky/`를 사용합니다.  
`frontend`에서 `pnpm install` 시 `prepare`가 `cd .. && husky`를 실행해 Hook을 활성화합니다.

| Hook         | 역할                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| `pre-commit` | **staged 파일만** 검사·자동 수정 (전체 `lint`/`typecheck`/`build` 금지) |
| `commit-msg` | Conventional Commit + **body 필수** (Commitlint)                        |

### pre-commit에서 하는 일

1. **Frontend** (`lint-staged`, cwd=`frontend/`)
   - `*.{js,jsx,ts,tsx}` → `eslint --fix` + `prettier --write`
   - `*.{json,css,scss,md,yml,yaml,html}` → `prettier --write`
2. **Backend** (staged `backend/**/*.py`가 있을 때만)
   - `uv run ruff check --fix`
   - `uv run ruff format`

실패 시 commit이 차단됩니다. 수정된 파일은 다시 stage한 뒤 커밋하세요.

### Commit Message 규칙

전체 브랜치·type·scope·언어 정책: [`docs/git-convention.md`](../docs/git-convention.md)

```text
feat(auth): 로그인 기능 구현

- JWT 로그인 API 추가
- Refresh Token 적용
```

- `type` · `scope` · `summary` 필수 (`type(scope): summary`)
- header 최대 100자
- **body 필수** (한 줄 커밋 금지)
- body와 header 사이 빈 줄 필수
- subject 대소문자 제한 없음 (`subject-case` off)

로컬에서 메시지만 검사:

```bash
cd frontend
echo "feat(auth): ok

body line" | pnpm exec commitlint
```

### 수동 전체 검사

`pnpm check`(lint → typecheck → build)는 **개발자가 수동으로** 실행하는 전체 검사입니다.  
pre-commit에서는 실행하지 않습니다.

## 실행

```bash
nvm use            # .nvmrc → 24.18.0
pnpm install
pnpm install --frozen-lockfile   # CI
pnpm dev
pnpm build
pnpm lint
pnpm check
```

## Form 작성 규칙

1. 스키마는 해당 **feature**의 `model/schema.ts`에 Zod로 정의하고 타입은 `z.infer<typeof schema>`만 사용합니다.
2. 페이지에서는 `useForm` + `zodResolver` + `FormProvider` + 네이티브 `<form>`을 사용합니다.
3. 필드는 `@shared/ui/form`의 `FormField` + `FormInput` / `PasswordInput` / `NumberInput` / `Select` / `Checkbox` / `TextArea`만 사용합니다.
4. 클라이언트 검증 오류는 필드 하단에 표시합니다. toast는 네트워크·권한·비필드 서버 오류에만 사용합니다.
5. 서버 필드 오류는 `mapServerErrors(error, form.setError)`로 연결합니다.
6. 새 입력 UI가 필요하면 `@shared/ui/form`에 얇은 래퍼를 추가하고, 과도한 범용 Form 추상화는 만들지 않습니다.

## 날짜 유틸 사용 규칙

- `@shared/lib/date`의 `formatDate`, `formatDateTime`, `formatRelativeTime`, `startOfDay`, `endOfDay`, `isValidDate`를 사용합니다.
- 화면에서 `new Date(...).toLocaleDateString` 등으로 직접 포맷하지 않습니다.
- 한국어 locale이 적용되어 있으며, 임의 UTC/timezone 변환은 하지 않습니다.
- 유효하지 않은 입력: format* → `"-"`, `isValidDate` → `false`, `startOfDay`/`endOfDay` → `null`.

## Lucide 아이콘 추가 절차

1. `src/shared/ui/icon/iconMap.ts`에 Lucide 아이콘을 **명시적으로** import·등록합니다.
2. `AppIcon`의 `name`으로만 사용합니다. Lucide 전체를 동적 로딩하지 않습니다.
3. 장식용은 `decorative`(기본 true), 의미 있는 아이콘은 `decorative={false}` + `title`을 사용합니다.
4. 브랜드 로고는 Lucide로 대체하지 않습니다.

## 차트 컴포넌트 사용 규칙

- `SalesBarChart` / `SalesLineChart` / `SalesPieChart`를 우선 사용합니다.
- 색상은 `CHART_COLORS`(CSS 변수 폴백)를 쓰고 페이지에서 임의 hex를 남발하지 않습니다.
- `status`: loading / empty / error / idle.
- 차트 컴포넌트 내부에서 API를 호출하지 않습니다. 데이터는 props로 전달합니다.
- `prefers-reduced-motion`이면 애니메이션이 꺼집니다.

## 칸반 저장 책임

- `KanbanBoard`는 UI 드래그 상태와 `onChange` 결과만 담당합니다.
- API 호출·TanStack Query mutation은 **사용하는 페이지/feature**에서 처리합니다.
- 드래그 취소 시 보드가 스냅샷으로 복구됩니다.

## /dev/ui-showcase

개발 환경에서만 라우트가 등록됩니다.

1. 로그인 후 `http://localhost:5173/dev/ui-showcase` 접속
2. production 빌드(`pnpm build` / `pnpm preview`)에서는 해당 경로가 등록되지 않으며 `*` → `/items`로 이동합니다.
3. Sidebar 메뉴에는 노출하지 않습니다.

## 라이브러리 추가 원칙

새 UI 라이브러리를 임의로 추가하기 전에 **기존 공통 컴포넌트**(`@shared/ui` form / chart / kanban / icon, `@shared/lib/date`)를 먼저 사용하세요.  
예외가 필요하면 `docs/frontend-stack.md`, `docs/frontend-architecture.md`와 이 README를 함께 갱신합니다.
