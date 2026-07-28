# Repository 협업 정책

Sales.AX Boilerplate의 브랜치 보호·권한·승인·CODEOWNERS 정책입니다.  
**2~5명 규모** 팀을 기준으로 하며, Enterprise급 절차는 두지 않습니다.

GitLab을 기준으로 설명하고, GitHub에서도 같은 원칙을 적용할 수 있습니다.

관련 문서: [git-convention.md](./git-convention.md) · [issue-workflow.md](./issue-workflow.md) · [code-review-checklist.md](./code-review-checklist.md)

---

## 1. Protected Branch 정책

| 브랜치 | 직접 Push | 머지 방식 | 최소 승인 |
|--------|-----------|-----------|-----------|
| `main` | **금지** | MR만 | **1명** |
| `develop` | **금지** | MR만 | **1명** |
| `feature/*` · `fix/*` · `docs/*` · `chore/*` · `hotfix/*` | 개발자 Push **허용** | MR 생성 대상 | 보호하지 않음 |

### 의미

- `main` / `develop`에는 로컬에서 바로 push하지 않습니다.
- 모든 변경은 작업 브랜치 → MR → 승인 → Merge 순서를 따릅니다.
- 작업 브랜치는 본인이 push하고, 대상은 보통 `develop`(hotfix는 `main`)입니다.

### GitLab에서 설정할 항목

경로 예: **Settings → Repository → Protected branches**

| 설정 | `main` / `develop` 권장 값 |
|------|---------------------------|
| Branch | `main`, `develop` (각각) |
| Allowed to merge | Maintainers (또는 팀 정책에 맞는 역할) |
| Allowed to push and merge | **No one** (직접 push 차단) |
| Allowed to force push | **No** |
| Code owner approval | 사용 시 ON (선택) |

경로 예: **Settings → Merge requests**

| 설정 | 권장 값 |
|------|---------|
| Approvals required | **1** |
| Prevent approval by author | ON (가능하면) |
| Remove all approvals when new commits are added | ON (권장) |

GitHub 대응: **Settings → Branches → Branch protection rules**  
(`Require a pull request before merging`, `Require approvals: 1`, `Do not allow bypassing`, force push 금지)

---

## 2. Merge 권한 (GitLab 역할)

| 역할 | 할 일 | 하지 않는 것 |
|------|--------|--------------|
| **Developer** | 작업 브랜치 push, MR 생성, 리뷰 반영, 리뷰 승인(정책에 따라) | `main`/`develop` 직접 push, 보호 설정 변경 |
| **Maintainer** | MR Merge, Protected Branch·승인 규칙 관리, 저장소 설정 | Owner 전용(멤버 최고 권한·삭제 등)은 최소화 |
| **Owner** | 멤버·권한·저장소 생명주기 관리 | 일상 개발·일상 Merge에 의존하지 않음 |

### 권장 운영 (2~5명)

- 전원(또는 대부분)을 **Developer**로 두고 일상 작업·리뷰를 수행합니다.
- 1~2명을 **Maintainer**로 두어 Merge와 보호 규칙을 관리합니다.
- 소규모에서는 Maintainer가 리뷰 후 본인이 Merge해도 됩니다. (자기 MR 단독 승인만은 가급적 피함)

GitHub 대응: `Write` ≈ Developer 작업, `Maintain`/`Admin` ≈ Maintainer·Owner 역할 분담.

---

## 3. 승인 정책

### 기본

- **최소 1명 승인** 후 Merge
- **필수 2인 승인**은 쓰지 않습니다 (인원이 적어 병목이 됨)

### 추가 승인 권장 (필수는 아님)

아래 변경은 리뷰어를 한 명 더 부르거나, Maintainer가 꼭 보도록 권장합니다.

| 영역 | 예시 |
|------|------|
| 공통 UI / shared | `frontend/src/shared/**` |
| 인증(Auth) | 로그인·토큰·세션·권한 가드 |
| API 계약 | 요청/응답 스키마, 엔드포인트 시그니처 |
| Database Schema | Alembic 마이그레이션, 모델 변경 |
| Build / CI / Hook | Vite·ESLint·Husky·`.gitlab-ci.yml` 등 |

리뷰 기준은 [code-review-checklist.md](./code-review-checklist.md)를 따릅니다.

---

## 4. CODEOWNERS

루트 [`CODEOWNERS`](../CODEOWNERS)에 영역별 담당(placeholder)을 둡니다.

- **프로젝트에 맞게** `@username` / `@group` / `@org/team` 으로 바꾸세요.
- 실제 계정·그룹이 없으면 CODEOWNERS 강제 승인은 켜지 마세요.
- GitLab: CODEOWNERS + (선택) Code owner approval  
  GitHub: CODEOWNERS + Require review from Code Owners

자세한 패턴은 `CODEOWNERS` 파일 주석을 참고합니다.

---

## 5. 일상 흐름 요약

```text
Developer: feature/* 작업 → push → MR → 리뷰 반영
Reviewer:  최소 1명 Approve  (+ 민감 영역은 추가 리뷰 권장)
Maintainer: develop 또는 main 에 Merge
```

- `develop` ← 일상 MR  
- `main` ← 배포용 (`develop`→`main` 또는 `hotfix/*`→`main`)

---

## 6. GitLab 설정 체크리스트

문서만으로는 보호가 적용되지 않습니다. 원격 저장소에서 아래를 확인하세요.

- [ ] `main` Protected branch
- [ ] `develop` Protected branch
- [ ] Allowed to push: No one (`main` / `develop`)
- [ ] Allowed to merge: Maintainers (팀 정책에 맞게)
- [ ] Force push 비활성
- [ ] MR Approvals required = 1
- [ ] (선택) Prevent author approval
- [ ] (선택) CODEOWNERS + Code owner approval
- [ ] 멤버 역할: Developer / Maintainer 구분

---

## 7. 이번 문서에서 다루지 않는 것

- GitLab CI 파이프라인
- Release / 태그 전략
- 테스트 환경·스테이징 배포
