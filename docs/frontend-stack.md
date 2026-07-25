# Frontend 기술 스택 표준

Sales.AX 프론트엔드에서 모든 프로젝트가 따르는 표준입니다.

레이어·폴더·import 규칙은 [frontend-architecture.md](./frontend-architecture.md)를 따릅니다.

## 기술 스택

| 영역 | 표준 | 비고 |
|------|------|------|
| UI 라이브러리 | React 19 | |
| 언어 | TypeScript | |
| 번들러 | Vite | |
| 라우팅 | React Router | `src/app` |
| 서버 상태 | TanStack Query | entity Query Key factory |
| HTTP | Axios | `@shared/api` |
| 폼 | React Hook Form + Zod | `@hookform/resolvers` |
| 전역 UI 상태 | React Context | 필요 시에만 |
| 인증 상태 | AuthContext | `@features/auth`, 토큰만 / 프로필은 Query |
| 날짜 | Day.js | `@shared/lib/date` |
| 아이콘 | lucide-react | `@shared/ui/icon` |
| 차트 | Recharts | `@shared/ui/chart`, `/dev/ui-showcase` |
| 칸반 DnD | `@dnd-kit/*` | `@shared/ui/kanban` |
| 스타일 | Tailwind CSS 4 | `src/app/styles` |

## 사용하지 않는 것

| 항목 | 이유 |
|------|------|
| Formik / Yup | RHF + Zod로 통일 |
| Zustand | UI 상태가 복잡해질 때만 검토 |
| Recoil | 제거됨 |
| MSW와 FastAPI 혼용 충돌 | MSW는 FE 테스트용, 실API는 Backend |

## 개발 규칙

### 상태 관리

1. **서버 데이터** → TanStack Query (`entities/*/api/queryKeys.ts`)
2. **Access Token / 로그인 여부** → `AuthContext` (`@features/auth`)
3. **테마·사이드바 등 UI** → 필요 시 React Context (미리 만들지 않음)
4. 사용자 프로필을 AuthContext에 중복 저장하지 않음

### Form

1. 스키마: 해당 `features/<name>/model/schema.ts` + `z.infer<typeof schema>`
2. UI: `@shared/ui/form`
3. 필드 에러는 인라인, toast는 전역 오류만
4. 서버 필드 오류: `@shared/lib/form/mapServerErrors`

### 날짜 / 아이콘

1. 날짜 표시·계산은 `@shared/lib/date` 사용 (직접 `new Date` 포맷 지양)
2. 아이콘은 `lucide-react` + `AppIcon`만 사용

### 차트 / 칸반

1. 차트: `@shared/ui/chart`
2. 칸반: `@shared/ui/kanban` (저장/mutation은 feature·페이지 책임)
