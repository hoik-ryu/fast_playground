# Git 전략 및 Commit 규칙

Sales.AX Boilerplate의 Git 브랜치·커밋 표준입니다.  
2~5명 규모 팀에서 바로 쓸 수 있도록, Git Flow를 그대로 쓰지 않고 **Main + Develop Strategy (Lightweight Git Flow)** 를 채택합니다.

현재 자동 검사:

- `pre-commit`: lint-staged (Frontend ESLint/Prettier) + staged Backend Ruff
- `commit-msg`: Commitlint (`frontend/commitlint.config.js`)

이 문서는 **규칙을 설명**합니다. Git 서버 설정·보호 브랜치·CI는 다음 단계에서 다룹니다.

---

## 1. 브랜치 전략 (Main + Develop Strategy)

Git Flow를 그대로 쓰는 것이 아니라, 소규모 팀에 맞게 단순화한 **Lightweight Git Flow**입니다.  
장기 브랜치는 `main`/`develop` 둘뿐이고, `release`처럼 무거운 브랜치는 기본 전략에서 제외합니다.

### 선택 이유

| 후보 | 판단 |
|------|------|
| Trunk-based (`main` + 단기 feature만) | 단순하지만 통합 안정선이 약함 |
| 완전한 Git Flow (`release`·상시 다중 브랜치) | 2~5명 팀에 절차가 과함 |
| **Main + Develop Strategy** | `main`/`develop`으로 안정·통합만 분리해 가장 무난 |

GitLab MR 기반 협업을 전제로 하며, CI/CD가 없어도 브랜치 역할이 분명합니다.

### 장기 브랜치

| 브랜치 | 역할 | 직접 push |
|--------|------|-----------|
| `main` | 배포 가능(또는 배포 예정) 상태 | 원칙적으로 금지. MR만 |
| `develop` | 다음 배포를 모으는 통합 브랜치. **일상 작업의 기준** | 원칙적으로 금지. MR만 |

### 브랜치 흐름

평상시 — 작업 브랜치는 `develop`에서 분기하고 `develop`으로 머지:

```text
feature/* → develop
fix/*     → develop
docs/*    → develop
chore/*   → develop
```

배포 — `develop`을 `main`으로:

```text
develop → main
```

긴급 수정 — `main`에서 분기해 `main`에 반영 후 `develop`에도 반영:

```text
main → hotfix/* → main → develop
```

### 단기 브랜치

| 종류 | 사용 | 분기 기준 | 머지 대상 |
|------|------|-----------|-----------|
| `feature/*` | 신규 기능 | `develop` | `develop` |
| `fix/*` | 버그 수정 (비긴급) | `develop` | `develop` |
| `docs/*` | 문서만 | `develop` | `develop` |
| `chore/*` | 설정·의존성·잡무 | `develop` | `develop` |
| `hotfix/*` | 배포본 긴급 수정 | `main` | `main` + `develop` |

### 하지 않는 것

- 개인별 장기 `dev-이름` 브랜치 유지
- `feature`에서 `main`으로 바로 머지 (hotfix 제외)
- 로컬에서만 쌓고 MR 없이 `develop`/`main`에 push

### 참고: release 브랜치는 언제 도입하나

지금은 `release/*`를 쓰지 않습니다. 다만 다음이 필요해지면 그때 release 전략을 **추가 도입**할 수 있습니다.

- QA Freeze(배포 전 동결) 기간이 필요할 때
- 장기 Release·핫픽스 라인 관리가 필요할 때
- 여러 버전을 동시에 운영(다중 버전)해야 할 때

---

## 2. 브랜치 이름 규칙

### 형식

```text
<type>/<short-description>
```

- `type`: `feature` | `fix` | `docs` | `chore` | `hotfix`
- `short-description`: **kebab-case**, 영문, 짧게 (이슈 번호가 있으면 뒤에 붙여도 됨)

### 예시

```text
feature/opportunity-list
feature/auth-login
fix/pursuit-card-duplicate
fix/refresh-token-401
docs/readme-update
docs/git-convention
chore/eslint-config
chore/bump-axios
hotfix/login-crash
```

### 피하기

```text
Feature/AuthLogin      # 대문자·PascalCase
feature/로그인          # 한글 브랜치명
feature/auth_login     # snake_case
my-work                # type 없음
```

---

## 3. Conventional Commits (Commitlint와 일치)

### 형식

```text
<type>(<scope>): <summary>

<body>
```

Commitlint 강제 사항 (`frontend/commitlint.config.js`):

| 규칙 | 내용 |
|------|------|
| type | 필수 |
| scope | **필수** |
| summary (subject) | 필수, header 전체 **최대 100자** |
| body | **필수** (한 줄 커밋 금지) |
| body 앞 | header와 body 사이 **빈 줄** 필수 |
| subject-case | **검사 안 함** (FSD, JWT, API 등 대문자 허용) |

### 올바른 예

```text
feat(auth): 로그인 API 연동

- POST /auth/login 호출 및 토큰 저장
- GuestRoute에서 로그인 후 /items 이동
```

```text
fix(frontend): Items 목록 새로고침 시 로딩 표시 누락 수정

- useItems의 isFetching 상태를 새로고침 버튼에 연결
```

### 잘못된 예

```text
feat: 로그인 추가
# scope 없음, body 없음

feat(auth): 로그인 추가
# body 없음

FE 작업
# type/scope/형식 없음
```

로컬 검사:

```bash
cd frontend
printf '%s\n' 'feat(auth): 요약' '' '- 본문' | pnpm exec commitlint
```

---

## 4. type 목록

`@commitlint/config-conventional` 기본 type을 사용합니다.  
소규모 팀에서 **제외할 type은 없습니다.** 다만 의미가 겹치면 아래 가이드를 따릅니다.

| type | 언제 쓰나 | 예시 summary |
|------|-----------|--------------|
| `feat` | 사용자·API에 보이는 **새 기능** | `로그인 화면 추가` |
| `fix` | **버그** 수정 | `401 무한 재시도 수정` |
| `refactor` | 동작 유지한 채 구조·가독성 개선 | `FSD-lite 레이어로 이동` |
| `perf` | 성능만 개선 | `Items 목록 쿼리 staleTime 조정` |
| `style` | **코드 포맷/세미콜론 등** (UI CSS가 아님) | `Prettier 재적용` |
| `docs` | 문서만 | `git-convention 추가` |
| `test` | 테스트 추가·수정 | `authApi 단위 테스트 추가` |
| `build` | 빌드·번들 설정 | `Vite alias 정리` |
| `ci` | CI 설정 (GitLab CI 등) | `.gitlab-ci.yml 초안` |
| `chore` | 잡무·도구·의존성 (위 type에 안 들어갈 때) | `pnpm lockfile 갱신` |
| `revert` | 이전 커밋 되돌림 | `feat(auth): … 되돌림` |

### 선택 가이드

- UI 스타일(Tailwind) 변경 → 보통 `feat` / `fix` / `refactor` (CSS “디자인” ≠ `style`)
- Husky·ESLint 규칙만 → `chore` 또는 `ci`/`build`에 가깝면 해당 type
- 기능 없이 폴더만 이동 → `refactor`
- 장애 핫픽스 → 커밋 type은 `fix`, 브랜치는 `hotfix/*`

---

## 5. scope 규칙

**scope는 필수**입니다. “어디를 건드렸는지”를 한 단어로 적습니다.

### 원칙

1. **영향 범위**를 적는다. 파일명·컴포넌트명 복붙을 피한다.
2. 모노레포에서는 영역이 분명하면 `frontend` / `backend`를 써도 된다.
3. 도메인이 분명하면 도메인을 우선한다 (`auth`, `items`, `user`).
4. 여러 영역을 건드리면 **대표 하나**만 쓰거나, 커밋을 나눈다.
5. **kebab-case** (예: `change-password`).
6. 영문 소문자를 기본으로 한다.

### 권장 scope

업무 도메인·영역 단위로 씁니다. (프로젝트가 커지면 도메인 scope를 계속 추가)

| scope | 용도 |
|-------|------|
| `auth` | 로그인·토큰·세션·AuthContext |
| `user` | 사용자·프로필·권한 조회 |
| `account` | 거래처/계정 도메인 |
| `contact` | 담당자/연락처 도메인 |
| `opportunity` | 수주 기회 도메인 |
| `pursuit` | 영업 추진(단계·파이프라인) 도메인 |
| `dashboard` | 대시보드·집계 화면 |
| `notification` | 알림 |
| `form` | 공통 폼 계층 |
| `api` | HTTP 클라이언트·엔드포인트 계약 |
| `shared` | shared UI/lib/api |
| `storybook` | Storybook·컴포넌트 문서화 |
| `deps` | 의존성 |
| `repo` | 루트·모노레포 공통 |
| `ci` | CI/Hook 설정 |
| `docs` | 문서 |

### 예시

```text
feat(opportunity): 수주기회 목록 조회 기능 추가

- 수주 기회 List 테이블 추가
- 수주 기회 API 연동
- 필터 기능 추가
```

```text
fix(pursuit): 단계 이동 후 카드 중복 노출 수정

- 캐시 갱신 로직 수정
- 중복 렌더링 제거
```

```text
chore(storybook): 접근성 애드온 설정

- addon-a11y 등록
- Storybook 접근성 패널 활성화
```

### 너무 좁은 scope (비권장)

```text
feat(button): …     # 컴포넌트 단위는 보통 과함 → form / shared / 도메인
fix(FormInput): …  # PascalCase·파일명 지양
```

컴포넌트 단위(`Button`, `FormInput` 등)는 scope로 권장하지 않습니다. UI 조각만 고칠 때도 `form` / `shared` 또는 해당 도메인 scope를 씁니다.

---

## 6. 커밋 메시지 언어

### 정책

| 부분 | 언어 |
|------|------|
| `type`, `scope` | **영어** (도구·Conventional 표준) |
| `summary`, `body` | **한국어** |

### 이유

- 팀 커뮤니케이션·MR 설명이 한국어 중심이다.
- `type`/`scope`는 Commitlint·변경 로그 도구와 맞추기 위해 영어를 유지한다.
- summary에 약어(FSD, JWT, API)는 그대로 써도 된다 (`subject-case` 미적용).

### 예

```text
feat(auth): JWT 로그인 및 Refresh Token 저장

- loginUser 호출 후 saveTokens
- 세션 만료 시 /login 이동
```

영문 only 커밋은 강제하지 않습니다. 외부 기여·영문 이슈를 인용할 때만 예외적으로 영어 summary를 허용합니다.

---

## 7. 일상 워크플로 요약

```bash
# 1. develop 최신화
git checkout develop
git pull

# 2. 작업 브랜치
git checkout -b feature/auth-login

# 3. 커밋 (Hook이 staged 검사 + 메시지 검사)
git add …
git commit
# type(scope): summary
#
# - body 필수

# 4. push 후 GitLab MR → develop
git push -u origin feature/auth-login
# MR 본문: .gitlab/merge_request_templates/Default.md
```

릴리스 시: `develop` → `main` MR.

긴급 장애: `main`에서 `hotfix/…` → `main` 머지 후 `develop`에도 머지.

---

## 8. 관련 파일

| 경로 | 역할 |
|------|------|
| `.husky/pre-commit` | staged 린트·포맷 |
| `.husky/commit-msg` | Commitlint |
| `frontend/commitlint.config.js` | 커밋 메시지 규칙 |
| `frontend/lint-staged.config.js` | staged 파일 검사 대상 |
| `frontend/README.md` | Hook 실행 방법 요약 |
| [`.gitlab/merge_request_templates/Default.md`](../.gitlab/merge_request_templates/Default.md) | GitLab MR 기본 템플릿 |
| [`docs/code-review-checklist.md`](./code-review-checklist.md) | 코드 리뷰 체크리스트 |
| [`docs/issue-workflow.md`](./issue-workflow.md) | Issue ↔ Branch ↔ MR 연결 규칙 |
| [`docs/repository-policy.md`](./repository-policy.md) | Protected Branch·권한·승인·CODEOWNERS |
| [`CODEOWNERS`](../CODEOWNERS) | 영역별 코드 소유자 (placeholder) |

전체 품질 검사(`pnpm check`)는 Hook이 아니라 **수동/CI**에서 실행합니다.

---

## 9. 다음 단계 (7단계 후속)

이 문서는 **브랜치·커밋 규칙**만 다룹니다. MR 기본 템플릿은 [`.gitlab/merge_request_templates/Default.md`](../.gitlab/merge_request_templates/Default.md)를 사용합니다.  
권한·보호 브랜치·CODEOWNERS는 [`repository-policy.md`](./repository-policy.md)를 참고하세요. 이어서 작성할 항목 예:

- 릴리스·태그 규칙 (필요 시 `release/*` 전략 도입 검토)
- GitLab CI에서 `pnpm check` / Ruff 실행
