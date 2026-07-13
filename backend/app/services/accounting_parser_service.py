"""
OCR raw row -> AccountingTransaction 파싱.

- 날짜: 다양한 구분자("2017.01.01", "2017/1/1")를 YYYY-MM-DD 로 정규화
- 입금/출금: 숫자만 남겨 int 로 변환
- 분류: accounting_category_service 로 rule-based 분류
- 원본페이지: OCR row 의 page 번호
"""

import re

from app.schemas.accounting_ocr import AccountingTransaction
from app.services import accounting_category_service
from app.services.ocr_service import OcrRawRow
from app.utils.money import SUSPICIOUS_AMOUNT_NOTE, append_note, parse_money_amount


def _normalize_date(
  raw: str,
  page_year: int = 0,
  page_month: int = 0,
) -> tuple[str, int, int]:
  """날짜 셀 + 페이지 상단 연/월 헤더를 합쳐 YYYY-MM-DD 를 만든다.

  장부 표에는 '01', '3' 처럼 일(day)만 있고 연/월은 PDF 상단에 있는 경우가 많다.
  """
  text = raw.strip()
  parts = [p for p in re.split(r"[^\d]+", text) if p]

  # 완전한 날짜: 2017.01.01 / 2017/1/1
  if len(parts) >= 3:
    year = int(parts[0])
    month = int(parts[1])
    day = int(parts[2])
    return f"{year:04d}-{month:02d}-{day:02d}", year, month

  # 일만 있는 경우: '01', '1', '1일'
  if len(parts) == 1 and page_year and page_month:
    day = int(parts[0])
    if 1 <= day <= 31:
      return (
        f"{page_year:04d}-{page_month:02d}-{day:02d}",
        page_year,
        page_month,
      )

  # 월/일만 있는 경우 (연도는 페이지 헤더)
  if len(parts) == 2 and page_year:
    month, day = int(parts[0]), int(parts[1])
    if 1 <= month <= 12 and 1 <= day <= 31:
      return f"{page_year:04d}-{month:02d}-{day:02d}", page_year, month

  # 파싱 실패 — 페이지 헤더 연/월이라도 CSV 연/월 컬럼에 넣을 수 있게
  if page_year and page_month:
    return text, page_year, page_month

  return text, 0, 0


def parse_rows(rows: list[OcrRawRow]) -> list[AccountingTransaction]:
  transactions: list[AccountingTransaction] = []

  for row in rows:
    page_year = int(row.get("page_year") or 0)
    page_month = int(row.get("page_month") or 0)
    date_str, year, month = _normalize_date(
      row["date"],
      page_year=page_year,
      page_month=page_month,
    )

    income, income_suspicious = parse_money_amount(row.get("income", ""))
    expense, expense_suspicious = parse_money_amount(row.get("expense", ""))

    description = row["description"].strip()
    note = row.get("note", "").strip()

    if income_suspicious:
      income = 0
    if expense_suspicious:
      expense = 0
    if income_suspicious or expense_suspicious:
      note = append_note(note, SUSPICIOUS_AMOUNT_NOTE)

    category = accounting_category_service.classify(
      description=description,
      note=note,
      income=income,
    )

    transactions.append(
      AccountingTransaction(
        date=date_str,
        year=year,
        month=month,
        description=description,
        income=income,
        expense=expense,
        note=note,
        source_page=row["page"],
        category=category,
      )
    )

  return transactions
