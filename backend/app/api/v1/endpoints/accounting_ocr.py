"""
회계장부 OCR 엔드포인트.

- POST /accounting-ocr/upload         : PDF 업로드 -> OCR -> 거래내역 + 메모 JSON
- POST /accounting-ocr/export-csv     : 거래내역 JSON -> CSV (UTF-8 BOM)
- POST /accounting-ocr/export-memo-csv: 메모 JSON -> CSV (UTF-8 BOM)

전역 /api/v1 prefix 가 없어 실제 경로는 /accounting-ocr/... 입니다.
"""

import os
import tempfile

from app.core.exceptions import AppException
from app.core.responses import success_response
from app.schemas.accounting_ocr import (
  AccountingMemo,
  ExportCsvRequest,
  ExportMemoCsvRequest,
  ExportSummaryCsvRequest,
  UploadResult,
)
from app.schemas.common import ApiResponse
from app.services import (
  accounting_parser_service,
  accounting_reconcile_service,
  csv_export_service,
  ocr_service,
)
from fastapi import APIRouter, File, UploadFile
from fastapi.responses import Response

router = APIRouter(prefix="/accounting-ocr", tags=["Accounting OCR"])


@router.post(
  "/upload",
  response_model=ApiResponse,
  summary="회계장부 PDF 업로드 및 OCR 파싱",
  description=(
    "스캔 PDF 를 업로드하면 OCR 후 표(거래내역)와 메모를 구분해 반환합니다. "
    "10페이지를 넘으면 자동으로 분할해 처리합니다."
  ),
)
async def upload_pdf(file: UploadFile = File(...)):
  if file.content_type not in ("application/pdf", "application/octet-stream"):
    raise AppException(
      message="PDF 파일만 업로드할 수 있습니다.",
      error_code="INVALID_FILE_TYPE",
      status_code=400,
    )

  contents = await file.read()

  # OCR provider 에 넘길 수 있도록 임시 파일로 저장.
  tmp_path: str | None = None
  try:
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
      tmp.write(contents)
      tmp_path = tmp.name

    ocr_result = ocr_service.extract(tmp_path)
    transactions = accounting_parser_service.parse_rows(ocr_result["rows"])
    memos = [
      AccountingMemo(source_page=memo["page"], text=memo["text"])
      for memo in ocr_result["memos"]
    ]
    # 장부 합계 행(계/총 합계)을 거래내역 합산값과 대조해 검증.
    summaries = accounting_reconcile_service.reconcile(
      transactions, ocr_result["summaries"]
    )
  finally:
    if tmp_path and os.path.exists(tmp_path):
      os.remove(tmp_path)

  return success_response(
    message="OCR 파싱이 완료되었습니다.",
    data=UploadResult(
      transactions=transactions,
      memos=memos,
      summaries=summaries,
    ),
  )


@router.post(
  "/export-csv",
  summary="거래내역 CSV 다운로드",
  description="거래내역 JSON 을 받아 고정 컬럼 CSV(UTF-8 BOM)로 반환합니다.",
)
def export_csv(request: ExportCsvRequest):
  csv_bytes = csv_export_service.build_csv_bytes(request.transactions)

  return Response(
    content=csv_bytes,
    media_type="text/csv; charset=utf-8",
    headers={
      "Content-Disposition": 'attachment; filename="accounting.csv"',
    },
  )


@router.post(
  "/export-memo-csv",
  summary="메모 CSV 다운로드",
  description="메모 JSON 을 받아 CSV(UTF-8 BOM)로 반환합니다.",
)
def export_memo_csv(request: ExportMemoCsvRequest):
  csv_bytes = csv_export_service.build_memo_csv_bytes(request.memos)

  return Response(
    content=csv_bytes,
    media_type="text/csv; charset=utf-8",
    headers={
      "Content-Disposition": 'attachment; filename="accounting_memo.csv"',
    },
  )


@router.post(
  "/export-summary-csv",
  summary="합계 검증 CSV 다운로드",
  description=(
    "월 계/총 합계 검증 결과(장부값 vs 계산값, 차이, 일치여부)를 "
    "CSV(UTF-8 BOM)로 반환합니다."
  ),
)
def export_summary_csv(request: ExportSummaryCsvRequest):
  csv_bytes = csv_export_service.build_summary_csv_bytes(request.summaries)

  return Response(
    content=csv_bytes,
    media_type="text/csv; charset=utf-8",
    headers={
      "Content-Disposition": 'attachment; filename="accounting_summary.csv"',
    },
  )
