"""
CLOVA General OCR (표 추출) 클라이언트.

흐름:
  PDF bytes
    -> 10페이지 단위로 분할 (CLOVA 는 호출당 PDF 최대 10페이지)
    -> 각 청크를 base64 로 인코딩해 CLOVA 호출 (enableTableDetection=true)
    -> 페이지별로 표(거래내역)인지 메모인지 구분
       - 표가 인식되면: tables[].cells[] 를 grid 로 재구성
         -> 일반 행은 거래 row, '계'/'총 합계' 행은 summaries 로 분리
       - 표가 없으면: fields[] 의 자유 텍스트를 메모로 수집
    -> {"rows": [...], "memos": [...], "summaries": [...]} 반환

주의:
  장부 표는 열 순서가 고정(날짜|내역|입금|출금|비고)이라 columnIndex 로 매핑한다.
  헤더 入/出 OCR 실패해도 2·3열이 입금/출금이다.
"""

from __future__ import annotations

import base64
import io
import re
import time
import uuid
from typing import TYPE_CHECKING, Any

import httpx
from app.core.config import settings
from app.core.exceptions import AppException
from pypdf import PdfReader, PdfWriter

if TYPE_CHECKING:
  from app.services.ocr_service import OcrResult

# 같은 줄로 묶을 y 좌표 허용 오차(px). fields -> 메모 텍스트 재구성에 사용.
_LINE_Y_THRESHOLD = 15

# CLOVA PDF 호출당 최대 페이지 수.
_MAX_PAGES_PER_CALL = 10

# 종이 장부 표준 5열: 날짜 | 내역 | 입금(入) | 출금(出) | 비고
# 헤더 OCR 이 실패해도 columnIndex 순서로 매핑한다.
_FIXED_LEDGER_COL_MAP: dict[int, str] = {
  0: "date",
  1: "description",
  2: "income",
  3: "expense",
  4: "note",
}

# 표 맨 아래 합계/계 행 — 거래내역에서 제외
_SUMMARY_KEYWORDS = ["합계", "총계", "合計", "小計", "計", "계", "합 계"]

# 표 헤더(th) 셀 — 거래내역에서 제외
_HEADER_DATE_LABELS = frozenset({"날짜", "일자", "年月日", "日"})
_HEADER_DESC_LABELS = frozenset({"내역", "내용", "적요", "항목", "구분"})
_HEADER_NOTE_LABELS = frozenset({"비고", "메모"})
_HEADER_INCOME_LABELS = frozenset({"입금", "入", "入金", "수입", "차변"})
_HEADER_EXPENSE_LABELS = frozenset({"출금", "出", "出金", "지출", "대변"})

# PDF 상단 헤더에서 연/월 추출용 (2017년 1월, 2017年1月 등)
_PAGE_YM_PATTERNS: list[re.Pattern[str]] = [
  re.compile(r"(20\d{2})\s*년\s*(\d{1,2})\s*월"),
  re.compile(r"(20\d{2})\s*年\s*(\d{1,2})\s*月"),
  re.compile(r"(20\d{2})[^\d]{0,3}(\d{1,2})\s*월"),
  re.compile(r"(20\d{2})\.(\d{1,2})(?:\.|$|\s)"),
  re.compile(r"(20\d{2})\s*/\s*(\d{1,2})"),
]


def _split_pdf(pdf_bytes: bytes, max_pages: int = _MAX_PAGES_PER_CALL) -> list[bytes]:
  """PDF 를 max_pages 단위로 나눠 여러 개의 PDF bytes 로 반환."""
  reader = PdfReader(io.BytesIO(pdf_bytes))
  total = len(reader.pages)
  chunks: list[bytes] = []

  for start in range(0, total, max_pages):
    writer = PdfWriter()
    for page in reader.pages[start : start + max_pages]:
      writer.add_page(page)
    buffer = io.BytesIO()
    writer.write(buffer)
    chunks.append(buffer.getvalue())

  return chunks


def _call_clova(pdf_bytes: bytes) -> dict[str, Any]:
  """CLOVA General OCR 호출 (단일 청크, 최대 10페이지)."""
  request_json = {
    "version": "V2",
    "requestId": str(uuid.uuid4()),
    "timestamp": int(time.time() * 1000),
    "enableTableDetection": True,
    "images": [
      {
        "format": "pdf",
        "name": "ledger",
        "data": base64.b64encode(pdf_bytes).decode("utf-8"),
      }
    ],
  }

  headers = {
    "X-OCR-SECRET": settings.CLOVA_OCR_SECRET_KEY,
    "Content-Type": "application/json",
  }

  try:
    resp = httpx.post(
      settings.CLOVA_OCR_API_URL,
      json=request_json,
      headers=headers,
      timeout=60.0,
    )
    resp.raise_for_status()
  except httpx.HTTPError as err:
    raise AppException(
      message=f"CLOVA OCR 호출에 실패했습니다: {err}",
      error_code="OCR_CALL_FAILED",
      status_code=502,
    ) from err

  return resp.json()


def _cell_text(cell: dict[str, Any]) -> str:
  """하나의 셀에서 텍스트를 추출. (줄=cellWords 공백결합, 셀=줄 개행결합)"""
  lines: list[str] = []
  for line in cell.get("cellTextLines", []):
    words = [w.get("inferText", "") for w in line.get("cellWords", [])]
    lines.append(" ".join(words))
  return "\n".join(lines).strip()


def _build_grid(
  cells: list[dict[str, Any]],
) -> tuple[dict[tuple[int, int], str], int, int]:
  """cells -> {(row, col): text} grid + 최대 행/열 인덱스."""
  grid: dict[tuple[int, int], str] = {}
  max_row = 0
  max_col = 0

  for cell in cells:
    row = int(cell.get("rowIndex", 0))
    col = int(cell.get("columnIndex", 0))
    grid[(row, col)] = _cell_text(cell)
    max_row = max(max_row, row)
    max_col = max(max_col, col)

  return grid, max_row, max_col


def _field_center(field: dict[str, Any]) -> tuple[float, float]:
  """field 의 boundingPoly 중심 (y, x) 를 구한다. 정렬/줄묶음용."""
  vertices = field.get("boundingPoly", {}).get("vertices", [])
  if not vertices:
    return (0.0, 0.0)
  ys = [v.get("y", 0.0) for v in vertices]
  xs = [v.get("x", 0.0) for v in vertices]
  return (sum(ys) / len(ys), sum(xs) / len(xs))


def _extract_page_year_month(fields: list[dict[str, Any]]) -> tuple[int, int]:
  """PDF 페이지 상단 fields 에서 '2017년 1월' 같은 연/월을 추출."""
  if not fields:
    return 0, 0

  ys = [
    _field_center(f)[0]
    for f in fields
    if f.get("inferText", "").strip()
  ]
  if not ys:
    return 0, 0

  top_threshold = max(ys) * 0.25
  header_parts: list[str] = []
  for field in fields:
    text = field.get("inferText", "").strip()
    if not text:
      continue
    y, _ = _field_center(field)
    if y <= top_threshold:
      header_parts.append(text)

  combined = " ".join(header_parts)
  for pattern in _PAGE_YM_PATTERNS:
    match = pattern.search(combined)
    if match:
      return int(match.group(1)), int(match.group(2))

  return 0, 0


def _row_data_from_grid(
  grid: dict[tuple[int, int], str],
  row: int,
  col_map: dict[int, str],
) -> dict[str, str]:
  row_data: dict[str, str] = {
    "date": "",
    "description": "",
    "income": "",
    "expense": "",
    "note": "",
  }
  for col, field in col_map.items():
    row_data[field] = grid.get((row, col), "").replace("\n", " ").strip()
  return row_data


def _compact(text: str) -> str:
  return text.strip().replace(" ", "")


def _is_header_row(row_data: dict[str, str]) -> bool:
  """표 th 행(날짜|내역|入|出|비고)이면 True — 거래내역이 아님."""
  date = _compact(row_data.get("date", ""))
  desc = _compact(row_data.get("description", ""))
  income = _compact(row_data.get("income", ""))
  expense = _compact(row_data.get("expense", ""))
  note = _compact(row_data.get("note", ""))

  # 가장 흔한 패턴: col0=날짜, col1=내역 (사용자 장부 스크린샷 케이스)
  if date in _HEADER_DATE_LABELS and desc in _HEADER_DESC_LABELS:
    return True

  # col0=날짜 + col4=비고 만 있어도 헤더
  if date in _HEADER_DATE_LABELS and note in _HEADER_NOTE_LABELS:
    return True

  # 입금/출금 칸에 한자 入/出 만 있는 헤더 행
  if income in _HEADER_INCOME_LABELS and expense in _HEADER_EXPENSE_LABELS:
    return True

  # 여러 열이 동시에 헤더 라벨이면 th 행
  label_sets = (
    _HEADER_DATE_LABELS,
    _HEADER_DESC_LABELS,
    _HEADER_INCOME_LABELS,
    _HEADER_EXPENSE_LABELS,
    _HEADER_NOTE_LABELS,
  )
  cells = (date, desc, income, expense, note)
  header_hits = sum(
    1 for text, labels in zip(cells, label_sets, strict=True) if text in labels
  )
  if header_hits >= 2:
    return True

  # 금액 없이 첫 열이 '날짜' 텍스트인 경우
  if date in _HEADER_DATE_LABELS and not income and not expense:
    if not re.search(r"\d", desc):
      return True

  return False


def _looks_like_data_row(grid: dict[tuple[int, int], str], row: int) -> bool:
  """첫 열이 '01', '3', '01월 01일' 같은 실제 날짜면 데이터 행."""
  date_text = grid.get((row, 0), "").strip()
  if not date_text:
    return False
  if _compact(date_text) in _HEADER_DATE_LABELS:
    return False
  if re.fullmatch(r"\d{1,2}", date_text):
    return True
  parts = [p for p in re.split(r"[^\d]+", date_text) if p]
  if len(parts) >= 2:
    return True
  return False


def _find_header_row(
  grid: dict[tuple[int, int], str],
  max_row: int,
  col_map: dict[int, str],
) -> int:
  """헤더 행 인덱스. 상단 몇 행을 스캔해 '날짜|내역' th 를 찾는다.

  PDF 상단에 '2017년 1월' 제목 행이 있으면 th 가 1행이 될 수 있어
  0행만 보면 th 를 거래내역으로 잘못 넣는다.
  """
  if max_row < 0:
    return -1

  scan_until = min(max_row, 4)
  for row in range(scan_until + 1):
    if _is_header_row(_row_data_from_grid(grid, row, col_map)):
      return row

  if not _looks_like_data_row(grid, 0):
    return 0

  return -1


def _fixed_col_map(max_col: int) -> dict[int, str]:
  """장부 표준 열 순서: 0=날짜, 1=내역, 2=입금, 3=출금, 4=비고."""
  return {
    col: field
    for col, field in _FIXED_LEDGER_COL_MAP.items()
    if col <= max_col
  }


def _summary_kind(row_data: dict[str, str]) -> str | None:
  """합계 행이면 종류('grand'|'monthly'), 아니면 None.

  - 'total' 라벨에 '총'+'합/계'가 있으면 총 합계(grand)
  - '계' / '합계' 등 합산 라벨이면 월 계(monthly)
  """
  label = (
    row_data.get("date", "") + row_data.get("description", "")
  ).replace(" ", "")
  if not label:
    return None
  if "총합" in label:  # "총 합계", "총합계"
    return "grand"
  if any(kw in label for kw in _SUMMARY_KEYWORDS):
    return "monthly"
  return None


def _is_amounts_only_tail(
  row_data: dict[str, str], row: int, max_row: int
) -> bool:
  """마지막 행이 날짜·내역 없이 금액만 있는 경우(라벨 OCR 실패한 합계로 추정)."""
  if row != max_row:
    return False
  has_amount = bool(row_data.get("income") or row_data.get("expense"))
  no_detail = (
    not row_data.get("date", "").strip()
    and not row_data.get("description", "").strip()
  )
  return has_amount and no_detail


def _table_to_rows(
  cells: list[dict[str, Any]],
  page_no: int,
  page_year: int = 0,
  page_month: int = 0,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
  """표 셀 -> (거래내역 rows, 합계 summaries)."""
  grid, max_row, max_col = _build_grid(cells)
  if max_row < 0 or max_col < 2:
    return [], []

  # 入/出 헤더 OCR 실패 시에도 columnIndex 0~4 고정 순서로 매핑
  col_map = _fixed_col_map(max_col)
  header_row = _find_header_row(grid, max_row, col_map)
  start_row = header_row + 1 if header_row >= 0 else 0

  rows: list[dict[str, Any]] = []
  summaries: list[dict[str, Any]] = []

  for row in range(start_row, max_row + 1):
    row_data = _row_data_from_grid(grid, row, col_map)

    if not any(
      [
        row_data["date"],
        row_data["description"],
        row_data["income"],
        row_data["expense"],
      ]
    ):
      continue

    # th 행이 데이터로 섞이는 경우 2차 방어 (제목 행 아래 헤더 등)
    if _is_header_row(row_data):
      continue

    # 합계 행이면 거래내역이 아닌 summaries 로 따로 기록(나중에 검증).
    kind = _summary_kind(row_data)
    if kind is not None:
      summaries.append(
        {
          "page": page_no,
          "kind": kind,
          "label": row_data["description"] or row_data["date"],
          # 고정 열: col2=입금(잔액), col3=출금(월순액), col4=비고(순액/running)
          "amount_col2": row_data["income"],
          "amount_col3": row_data["expense"],
          "amount_col4": row_data["note"],
          "page_year": page_year,
          "page_month": page_month,
        }
      )
      continue

    # 라벨 OCR 이 실패해 금액만 남은 꼬리 행은 거래내역에서 제외.
    if _is_amounts_only_tail(row_data, row, max_row):
      continue

    rows.append(
      {
        "page": page_no,
        "date": row_data["date"],
        "description": row_data["description"],
        "income": row_data["income"],
        "expense": row_data["expense"],
        "note": row_data["note"],
        "page_year": page_year,
        "page_month": page_month,
      }
    )

  return rows, summaries


def _fields_to_text(fields: list[dict[str, Any]]) -> str:
  """fields[] 의 단어들을 좌표 기준으로 줄 단위로 묶어 메모 텍스트로 만든다."""
  items: list[tuple[float, float, str]] = []
  for field in fields:
    text = field.get("inferText", "")
    if not text:
      continue
    y, x = _field_center(field)
    items.append((y, x, text))

  if not items:
    return ""

  items.sort(key=lambda t: (t[0], t[1]))

  lines: list[str] = []
  current: list[tuple[float, str]] = []
  current_y: float | None = None

  for y, x, text in items:
    if current_y is None or abs(y - current_y) <= _LINE_Y_THRESHOLD:
      current.append((x, text))
      if current_y is None:
        current_y = y
    else:
      lines.append(" ".join(t for _, t in sorted(current)))
      current = [(x, text)]
      current_y = y

  if current:
    lines.append(" ".join(t for _, t in sorted(current)))

  return "\n".join(lines).strip()


def extract_from_pdf(pdf_bytes: bytes) -> OcrResult:
  chunks = _split_pdf(pdf_bytes)
  rows: list[dict[str, Any]] = []
  memos: list[dict[str, Any]] = []
  summaries: list[dict[str, Any]] = []
  page_offset = 0

  for chunk in chunks:
    response = _call_clova(chunk)
    images = response.get("images", [])

    for local_index, image in enumerate(images):
      page_no = page_offset + local_index + 1
      if image.get("inferResult") != "SUCCESS":
        continue

      page_year, page_month = _extract_page_year_month(image.get("fields", []))

      # 1) 표 우선 시도. (거래내역 + 합계 행 동시 수집)
      page_rows: list[dict[str, Any]] = []
      page_summaries: list[dict[str, Any]] = []
      for table in image.get("tables", []):
        table_rows, table_summaries = _table_to_rows(
          table.get("cells", []),
          page_no,
          page_year=page_year,
          page_month=page_month,
        )
        page_rows.extend(table_rows)
        page_summaries.extend(table_summaries)

      if page_rows or page_summaries:
        rows.extend(page_rows)
        summaries.extend(page_summaries)
        continue

      # 2) 표가 없으면 메모 페이지로 보고 자유 텍스트를 수집.
      memo_text = _fields_to_text(image.get("fields", []))
      if memo_text:
        memos.append({"page": page_no, "text": memo_text})

    page_offset += len(images)

  return {  # type: ignore[return-value]
    "rows": rows,
    "memos": memos,
    "summaries": summaries,
  }
