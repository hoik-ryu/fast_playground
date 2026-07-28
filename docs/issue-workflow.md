# Issue ↔ Branch ↔ Merge Request 연결 규칙

Sales.AX Boilerplate의 작업 추적 흐름입니다.  
GitLab을 기준으로 하되, GitHub(Issues / Pull Request)에서도 동일하게 적용할 수 있습니다.

관련 문서: [git-convention.md](./git-convention.md) · [code-review-checklist.md](./code-review-checklist.md) · [MR 템플릿](../.gitlab/merge_request_templates/Default.md)

---

## 1. 개발 흐름

```text
Issue 생성
    ↓
작업 브랜치 생성
    ↓
개발
    ↓
Commit
    ↓
Push
    ↓
Merge Request (또는 Pull Request)
    ↓
Code Review
    ↓
Merge
    ↓
Issue 종료
```

한 이슈는 **하나의 작업 브랜치 + 하나의 MR**로 닫는 것을 권장합니다.  
큰 이슈는 하위 이슈로 나눈 뒤 각각 MR을 만듭니다.

---

## 2. 브랜치와 Issue 연결

브랜치 이름 형식은 [git-convention.md](./git-convention.md)의 `<type>/<short-description>` 규칙을 따릅니다.  
이슈가 있으면 **끝에 이슈 번호**를 붙입니다.

### Issue 번호를 쓰는 경우 (권장)

추적·검색이 쉬워집니다.

```text
feature/auth-login-123
feature/opportunity-list-42
fix/login-error-18
```

| 부분 | 의미 |
|------|------|
| `feature` / `fix` / … | 브랜치 type |
| `auth-login` | kebab-case 짧은 설명 |
| `123` | Issue 번호 (`#123`) |

### Issue 번호를 쓰지 않는 경우

이슈가 없거나(아래 예외), 번호 전에 브랜치를 먼저 만든 경우:

```text
feature/auth-login
chore/eslint-config
docs/readme-update
```

나중에 이슈가 생기면 **브랜치명을 굳이 바꾸지 않아도 됩니다.**  
연결은 **MR Description의 `Closes #N`** 으로 합니다.

---

## 3. Commit과 Issue 연결

커밋 메시지는 Conventional Commits만 지킵니다.

```text
<type>(<scope>): <summary>

<body>
```

- Issue 번호를 커밋에 **강제하지 않습니다.**
- Commitlint도 이슈 번호를 검사하지 않습니다.
- 필요하면 body에 `#123`을 적어도 되지만, **이슈 종료는 MR에서** 처리합니다.

```text
feat(auth): 로그인 API 연동

- POST /auth/login 호출 및 토큰 저장
```

---

## 4. Merge Request와 Issue 연결

이슈와의 **공식 연결·자동 종료**는 MR(또는 PR) Description에서 합니다.

### Closing keywords

MR이 **기본 브랜치로 머지**되면 이슈가 자동으로 닫힙니다.

| 키워드 | 용도 |
|--------|------|
| `Closes #123` | 이슈를 이 변경으로 완료 (가장 흔함) |
| `Fixes #123` | 버그 이슈를 수정으로 완료 |
| `Resolves #123` | 동일 의미 (GitLab/GitHub 모두 지원) |

왜 쓰나

1. 이슈·MR이 양방향으로 연결된다
2. 머지 시 이슈가 **자동 Closed** 되어 수동 마감을 줄인다
3. 이력(어떤 MR이 어떤 이슈를 끝냈는지)이 남는다

### 자동 종료 흐름 예시

```text
Issue #25 「로그인 기능」 열림
    ↓
브랜치 feature/auth-login-25 에서 작업·커밋
    ↓
MR 본문에 Closes #25 작성
    ↓
리뷰 후 develop(또는 대상 브랜치)에 Merge
    ↓
#25 자동 Closed
```

이슈가 없으면 MR 템플릿대로 **「관련 이슈 없음」** 만 남깁니다.  
이슈를 참조만 하고 닫지 않을 때는 `Refs #123` / `Related to #123` 을 씁니다 (자동 종료 없음).

---

## 5. 권장 Workflow

```text
Issue
  ↓
feature/* (또는 fix/*) 브랜치
  ↓
여러 Commit  (type(scope)만 준수)
  ↓
Merge Request  (Closes #N)
  ↓
Code Review
  ↓
Merge
  ↓
Issue Closed
```

---

## 6. 전체 예시

```text
Issue
  #25 로그인 기능
        ↓
Branch
  feature/auth-login-25
        ↓
Commit
  feat(auth): 로그인 API 연동

  - POST /auth/login 호출 및 토큰 저장
  - GuestRoute에서 로그인 후 이동
        ↓
MR Description
  Closes #25
        ↓
Merge → Issue #25 Closed
```

---

## 7. 예외 (Issue 없이 가능한 경우)

| 경우 | 브랜치 | Issue | MR |
|------|--------|-------|-----|
| **hotfix** 긴급 장애 | `hotfix/…` (`main` 기준) | 사후 이슈 권장, 없어도 진행 가능 | 가능하면 `Closes #N` / 없으면 「관련 이슈 없음」 |
| **문서만** 수정 | `docs/…` | 작은 수정은 생략 가능 | 「관련 이슈 없음」 가능 |
| **chore** (설정·포맷·의존성 소규모) | `chore/…` | 생략 가능 | 「관련 이슈 없음」 가능 |
| 오타·1줄 수정 등 **초소규모** | `fix/…` 또는 `chore/…` | 생략 가능 | 「관련 이슈 없음」 가능 |

기능·버그·설계 변경은 **Issue를 먼저** 만드는 것을 기본으로 합니다.

---

## 8. 빠른 체크

- [ ] 기능/버그는 Issue를 만들었는가
- [ ] 브랜치명에 이슈 번호를 붙였는가 (있으면)
- [ ] 커밋은 `type(scope): summary` + body인가 (이슈 번호 강제 없음)
- [ ] MR에 `Closes #N` 또는 「관련 이슈 없음」이 있는가
- [ ] 머지 후 이슈가 닫혔는지 확인했는가
