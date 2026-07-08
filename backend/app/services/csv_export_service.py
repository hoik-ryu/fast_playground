"""
거래내역 -> CSV 변환.

컬럼 순서는 고정: 날짜, 연도, 월, 내용, 입금, 출금, 비고, 원본페이지, 분류
엑셀에서 한글이 깨지지 않도록 UTF-8 BOM(utf-8-sig)으로 인코딩합니다.
"""

import csv
import io

from app.schemas.accounting_ocr import (
  AccountingMemo,
  AccountingSummary,
  AccountingTransaction,
)

CSV_HEADERS = [
  "날짜",
  "연도",
  "월",
  "내용",
  "입금",
  "출금",
  "비고",
  "원본페이지",
  "분류",
]

MEMO_CSV_HEADERS = [
  "원본페이지",
  "메모",
]

SUMMARY_CSV_HEADERS = [
  "원본페이지",
  "구분",
  "연도",
  "월",
  "라벨",
  "장부_입금(잔액)",
  "장부_출금(월순액)",
  "장부_순액(합계)",
  "계산_입금",
  "계산_출금",
  "계산_순액",
  "입금차이",
  "출금차이",
  "순액차이",
  "일치여부",
]

_KIND_LABEL = {"monthly": "월 계", "grand": "총 합계"}


def build_csv_bytes(transactions: list[AccountingTransaction]) -> bytes:
  buffer = io.StringIO()
  writer = csv.writer(buffer)
  writer.writerow(CSV_HEADERS)

  for tx in transactions:
    writer.writerow(
      [
        tx.date,
        tx.year,
        tx.month,
        tx.description,
        tx.income if tx.income is not None else "",
        tx.expense if tx.expense is not None else "",
        tx.note,
        tx.source_page,
        tx.category,
      ]
    )

  # utf-8-sig -> 앞에 BOM 이 붙어 엑셀에서 한글 정상 표시
  return buffer.getvalue().encode("utf-8-sig")


def build_memo_csv_bytes(memos: list[AccountingMemo]) -> bytes:
  buffer = io.StringIO()
  writer = csv.writer(buffer)
  writer.writerow(MEMO_CSV_HEADERS)

  for memo in memos:
    writer.writerow([memo.source_page, memo.text])

  return buffer.getvalue().encode("utf-8-sig")


def _cell(value: int | None) -> str:
  return "" if value is None else value


def build_summary_csv_bytes(summaries: list[AccountingSummary]) -> bytes:
  buffer = io.StringIO()
  writer = csv.writer(buffer)
  writer.writerow(SUMMARY_CSV_HEADERS)

  for s in summaries:
    writer.writerow(
      [
        s.source_page,
        _KIND_LABEL.get(s.kind, s.kind),
        s.year,
        s.month,
        s.label,
        _cell(s.stated_income),
        _cell(s.stated_expense),
        _cell(s.stated_net),
        _cell(s.computed_income),
        _cell(s.computed_expense),
        _cell(s.computed_net),
        _cell(s.income_diff),
        _cell(s.expense_diff),
        _cell(s.net_diff),
        "일치" if s.matched else "불일치",
      ]
    )

  return buffer.getvalue().encode("utf-8-sig")
