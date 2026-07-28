<!-- 리뷰어·작성자 공통 기준: docs/code-review-checklist.md -->

## 변경 목적

<!-- 이 MR을 만든 이유, 해결하려는 문제 또는 추가 기능을 1~3문장으로 적어 주세요. -->

-

## 주요 변경 사항

<!-- 핵심만 bullet로. 영역이 나뉘면 Frontend / Backend / 공통으로 구분해도 됩니다. -->

- Frontend:
  -
- Backend:
  -
- 공통/기타:
  -

## 관련 이슈

상세 규칙: [Issue ↔ Branch ↔ MR](../../docs/issue-workflow.md)

<!-- 이슈가 있으면 아래처럼 연결하세요. 없으면 「관련 이슈 없음」만 남기세요. -->
<!-- 예: Closes #123 -->

- 관련 이슈 없음

## 변경 유형

- [ ] 신규 기능
- [ ] 버그 수정
- [ ] 리팩터링
- [ ] 성능 개선
- [ ] UI/스타일
- [ ] 테스트
- [ ] 문서
- [ ] 설정/의존성
- [ ] CI/CD
- [ ] 기타

## 영향 범위

- [ ] Frontend
- [ ] Backend
- [ ] API 계약
- [ ] Database
- [ ] 공통 설정
- [ ] 배포/인프라
- [ ] 영향 없음

## 테스트 및 검증

### 현재 실행 가능

<!-- 해당되는 항목만 체크. Frontend는 `frontend/`에서, Backend는 `backend/`에서 실행. -->

**Frontend** (`cd frontend`)

- [ ] `pnpm lint` 통과
- [ ] `pnpm typecheck` 통과
- [ ] `pnpm build` 통과
- [ ] `pnpm check` 통과 (lint + typecheck + build)
- [ ] 로컬 동작 확인 (`pnpm dev`)

**Backend** (`cd backend`)

- [ ] `uv run ruff check` 통과
- [ ] `uv run ruff format --check` 통과 (또는 format 적용)
- [ ] API 동작 확인 (로컬 서버)

### 공통

- [ ] 로컬 통합 동작 확인 (FE ↔ BE)
- [ ] 테스트하지 못한 항목 있음 → 아래에 명시

### 향후 예정 (아직 저장소에 미구축)

- [ ] Frontend unit/e2e test (`pnpm test` 등 — 미도입)
- [ ] Backend pytest 등 — 미도입

**미검증 / 특이사항:**

-

## 화면 변경

<!-- UI 변경이 없으면 「해당 없음」만 남기세요. 있으면 변경 전/후와 스크린샷·영상을 첨부하세요. -->

- [ ] 해당 없음
- [ ] UI 변경 있음

| 변경 전 | 변경 후 |
| -------- | -------- |
| <!-- 이미지 또는 설명 --> | <!-- 이미지 또는 설명 --> |

스크린샷 / 영상:

-

## 리뷰 요청 사항

리뷰 기준: [코드 리뷰 체크리스트](../../docs/code-review-checklist.md)

<!-- 리뷰어가 특히 봐 줬으면 하는 포인트를 적어 주세요. 없으면 「특별히 없음」. -->

- [ ] API 응답 타입 설계
- [ ] 상태 관리 방식
- [ ] 예외 처리
- [ ] 성능 영향
- [ ] 보안 영향
- [ ] 특별히 없음

기타:

-

## 배포 및 주의 사항

<!-- 해당 없으면 「없음」. Breaking Change가 있으면 Rollback 방법을 반드시 적으세요. -->

- 환경변수 변경: 없음 /
- DB Migration: 없음 /
- 의존성 추가: 없음 /
- 배포 순서: 없음 /
- Breaking Change: 없음 /
- Rollback 방법: 없음 /
