# Frontend Architecture (FSD-lite)

Sales.AX 프론트엔드는 Feature-Sliced Design을 단순화한 **FSD-lite** 구조를 사용합니다.  
새 코드를 어디에 둘지 이 문서 기준으로 판단하세요.

## 레이어 역할

| 레이어 | 경로 | 역할 |
|--------|------|------|
| **app** | `src/app/` | 앱 부트스트랩, Provider 조립, 라우터, 루트 레이아웃, 전역 스타일 |
| **pages** | `src/pages/` | 라우트 단위 화면 조립. features/entities/shared를 조합 |
| **features** | `src/features/` | 사용자 행동 단위 (로그인, 프로필 수정, Item 생성 등) |
| **entities** | `src/entities/` | 도메인 모델, 조회 API, Query Key, 조회용 훅 |
| **shared** | `src/shared/` | 도메인 무관 인프라·UI·유틸 |

```
src/
  app/           # 진입점·라우팅·레이아웃
  pages/         # 화면
  features/      # 행동(유스케이스)
  entities/      # 도메인 엔티티
  shared/        # 공용
```

## 의존 방향

```
app → pages → features → entities → shared
                ↘──────────↗
```

- **허용:** 상위 → 하위만 import
- **금지:**
  - `shared` → `entities` / `features` / `pages` / `app`
  - `entities` → `features` / `pages` / `app`
  - `features` → `pages` / `app`
  - `pages` → `app`
  - page ↔ page 직접 import

`app`은 모든 하위 레이어를 import할 수 있습니다.

## Import alias

| Alias | 대상 |
|-------|------|
| `@app/*` | `src/app/*` |
| `@pages/*` | `src/pages/*` |
| `@features/*` | `src/features/*` |
| `@entities/*` | `src/entities/*` |
| `@shared/*` | `src/shared/*` |

`@/*` 루트 alias는 사용하지 않습니다.

예시:

```ts
import { LoginPage } from "@pages/login";
import { useCurrentUser } from "@entities/user";
import { useAuth } from "@features/auth";
import { FormInput } from "@shared/ui/form";
```

## Barrel export (public API)

- **각 slice 루트의 `index.ts`만** 외부 public API입니다.
- 다른 레이어/슬라이스는 **public API만** import합니다.
- `api/`, `model/`, `ui/` 내부 파일 deep import 금지  
  (예: `@features/auth/model/AuthContext` ❌)
- 같은 slice 안에서는 상대경로(`../api/...`) 허용
- `index.ts`는 **자기 slice 내부만** re-export
- barrel끼리 서로를 끌어 순환이 생기면 barrel을 줄이고 상대경로를 사용

## 페이지 전용 컴포넌트 위치

- 한 페이지에서만 쓰는 UI → 해당 page slice 안  
  (`pages/<name>/ui/...`)
- page끼리 공유하지만 제품 기능이 아닌 조립용 UI → 우선 page에 두고, 재사용이 확실해지면 승격

## 공통 컴포넌트 승격 기준

| 조건 | 위치 |
|------|------|
| 도메인 무관, 여러 feature/page에서 재사용 | `shared/ui/*` |
| 특정 도메인 표시에만 쓰임 | `entities/<name>/ui` (필요 시) |
| 특정 사용자 행동에 묶임 | `features/<name>/ui` |

승격 전 질문: “브랜드/도메인 이름을 지워도 의미가 남나?” → 남으면 `shared`.

## API 코드 위치

| 종류 | 위치 |
|------|------|
| Axios 인스턴스, refresh HTTP, 공통 에러 메시지 | `shared/api/` |
| 토큰 저장·세션 이벤트 | `shared/lib/session/` |
| 엔티티 **조회** (GET) | `entities/<name>/api/` |
| 로그인·회원가입·로그아웃 등 행동 | `features/<name>/api/` |
| 생성·수정·삭제 mutation | `features/<name>/api/` |

`shared`는 login/logout React Context나 User 타입을 갖지 않습니다.

## Query Key 관리 규칙

- 도메인별 factory만 사용: `entities/<name>/api/queryKeys.ts`
- `shared`에 도메인 Query Key를 두지 않음
- 문자열 키를 페이지에서 직접 쓰지 않음
- feature는 entity의 key를 import해 `invalidate` / `setQueryData` / `removeQueries`
- 예:

```ts
userKeys.me()
itemKeys.list(name?)
itemKeys.lists() // list 계열 일괄 invalidate
```

## 타입·상수·Enum 위치

| 종류 | 위치 |
|------|------|
| 엔티티 응답/도메인 타입 | `entities/<name>/model/types.ts` |
| 폼 스키마·요청 DTO | 해당 `features/<name>/model/` |
| HTTP 공통 응답 (`ApiResponse`) | `shared/api/types.ts` |
| 앱 전역 상수 | `shared/config/` (필요 시) |

백엔드 스키마와 맞추되, FE에서만 쓰는 폼 필드는 feature schema에 둡니다.

## 파일·폴더 네이밍

- slice 폴더: `kebab-case` (`change-password`, `manage-item`)
- 컴포넌트 파일: `PascalCase.tsx`
- 훅: `useXxx.ts`
- API 모듈: `camelCase.ts` (`userApi.ts`, `itemMutations.ts`)
- page 기본 구조:

```
pages/<slice>/
  index.ts          # public API
  ui/<Page>.tsx
  model/            # 페이지 전용 mock·로컬 타입 (필요 시)
```

- feature / entity 기본 구조:

```
features|entities/<slice>/
  index.ts
  api/
  model/
  ui/               # 있을 때만
```

## 순환 참조 방지

1. 의존 방향을 어기지 않는다.
2. public API(`index.ts`)가 서로를 끌어당기지 않게 한다.
3. entity는 feature/AuthContext를 import하지 않는다.
4. shared는 상위 레이어를 import하지 않는다.
5. 의심되면 deep import 대신 public API와 단방향 상대경로로 분리한다.

## 새 기능 추가 예시

### 예: “공지사항 목록 + 읽음 처리”

1. **entity** `entities/notice/`  
   - 타입, `noticeApi`(목록·상세 GET), `noticeKeys`, `useNotices`
2. **feature** `features/mark-notice-read/`  
   - 읽음 mutation + invalidate
3. **page** `pages/notices/`  
   - `useNotices` + feature 조립
4. **app** `App.tsx`에 ProtectedRoute 하위 라우트 추가
5. 공통 배지가 여러 도메인에서 필요하면 나중에 `shared/ui`로 승격

### 예: “로그인만 수정”

- `features/auth`만 수정. page는 public API import 유지.

## /dev/ui-showcase

- 위치: `pages/dev-ui-showcase`
- `import.meta.env.DEV`일 때만 `App.tsx`에 라우트 등록
- 사이드바/네비에 노출하지 않음
- production 빌드에서는 번들에서 제외·미등록

## 후속 과제 (미도입)

- ESLint `boundaries` 또는 `dependency-cruiser`로 레이어 의존 자동 검증
- 403 / 404 전용 페이지
- 경로 상수 모듈 공통화 (필요해질 때)

이 도구들은 현재 설치하지 않습니다. 도입 시 이 문서와 `frontend/README.md`를 함께 갱신하세요.
