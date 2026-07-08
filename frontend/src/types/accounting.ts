// 백엔드 app/schemas/accounting_ocr.py 의 AccountingTransaction 과 형태를 맞춘 타입.

export type AccountingTransaction = {
  date: string;
  year: number;
  month: number;
  description: string;
  income?: number | null;
  expense?: number | null;
  note?: string;
  sourcePage: number;
  category: string;
};

// 표가 아닌 메모 페이지(대부분 마지막 장)의 자유 텍스트.
export type AccountingMemo = {
  sourcePage: number;
  text: string;
};

// 장부 합계 행(계/총 합계)을 거래내역 합산값과 대조한 검증 결과.
// - kind="monthly": stated=장부 총계, computed=거래내역 합산
// - kind="grand":   stated_net=running, computed_net=이월잔액+월순액
export type AccountingSummary = {
  sourcePage: number;
  kind: "monthly" | "grand";
  year: number;
  month: number;
  label: string;
  statedIncome?: number | null;
  statedExpense?: number | null;
  statedNet?: number | null;
  computedIncome?: number | null;
  computedExpense?: number | null;
  computedNet?: number | null;
  incomeDiff?: number | null;
  expenseDiff?: number | null;
  netDiff?: number | null;
  matched: boolean;
};

// /accounting-ocr/upload 응답 형태.
export type UploadResult = {
  transactions: AccountingTransaction[];
  memos: AccountingMemo[];
  summaries: AccountingSummary[];
};

// 분류 select 에서 사용할 옵션. (백엔드 rule-based 분류 결과와 동일 집합)
export const ACCOUNTING_CATEGORIES = [
  "월세수입",
  "공과금",
  "대출이자",
  "세금",
  "보험",
  "안전관리",
  "유지보수",
  "보안비용",
  "통신비",
  "가족지출",
  "생활비",
  "선지급",
  "관리자 월급",
  "관리비",
  "미분류",
] as const;
