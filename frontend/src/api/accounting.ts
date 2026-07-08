import { apiClient } from "./client";
import type { ApiResponse } from "../types/api";
import type {
  AccountingMemo,
  AccountingSummary,
  AccountingTransaction,
  UploadResult,
} from "../types/accounting";

// 회계장부 OCR 엔드포인트 (app/api/v1/endpoints/accounting_ocr.py) 매핑.

export async function uploadAccountingPdf(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiClient.post<ApiResponse<UploadResult>>(
    "/accounting-ocr/upload",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data.data;
}

export async function exportAccountingCsv(
  transactions: AccountingTransaction[],
): Promise<Blob> {
  const res = await apiClient.post(
    "/accounting-ocr/export-csv",
    { transactions },
    { responseType: "blob" },
  );
  return res.data as Blob;
}

export async function exportMemoCsv(memos: AccountingMemo[]): Promise<Blob> {
  const res = await apiClient.post(
    "/accounting-ocr/export-memo-csv",
    { memos },
    { responseType: "blob" },
  );
  return res.data as Blob;
}

export async function exportSummaryCsv(
  summaries: AccountingSummary[],
): Promise<Blob> {
  const res = await apiClient.post(
    "/accounting-ocr/export-summary-csv",
    { summaries },
    { responseType: "blob" },
  );
  return res.data as Blob;
}
