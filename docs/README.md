# Sales.AX 문서

제품·개발 문서를 이 디렉터리에 모읍니다.

루트 [README](../README.md)는 저장소 소개와 빠른 시작을 담당하고,  
세부 가이드·설계·운영 문서는 이곳에 추가합니다.

## 문서 목록

| 문서 | 설명 |
|------|------|
| [git-convention.md](./git-convention.md) | 브랜치 전략·Conventional Commits·scope·언어 정책 |
| [code-review-checklist.md](./code-review-checklist.md) | MR 리뷰 기준 체크리스트 |
| [issue-workflow.md](./issue-workflow.md) | Issue ↔ Branch ↔ MR 연결 규칙 |
| [repository-policy.md](./repository-policy.md) | Protected Branch·Merge 권한·승인·CODEOWNERS |
| [frontend-architecture.md](./frontend-architecture.md) | FSD-lite 레이어·import·Query Key·네이밍 |
| [frontend-stack.md](./frontend-stack.md) | Frontend 기술 스택 표준·개발 규칙 |
| _(추가 예정)_ | API, 인증, 배포, MR 협업 등 |

## 작성 원칙

- 루트 README는 짧게 유지하고, 깊은 내용은 `docs/`로 분리합니다.
- Frontend / Backend 각각의 README는 해당 패키지 전용 메모만 남깁니다.
