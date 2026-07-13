"""
장부 합계 행(계/총 합계) 검증.

장부 맨 아래 '계' 행에는 그 달의 입금/출금 총계가 손으로 적혀 있다.
OCR 로 뽑은 거래내역을 실제로 합산해 이 값과 대조하면
- 장부 자체의 계산 오류
- OCR 오인식(금액 누락/오독)
이 있는 달을 "얼마나 어긋났는지"까지 바로 찾아낼 수 있다.

- monthly(월 계): 같은 페이지 거래내역을 합산해 장부 총계와 비교.
- grand(총 합계): 누적값이라 거래내역만으로 계산 불가 → 내부 정합성
  (이월잔액 + 월순액 == running)만 확인.
"""

from app.schemas.accounting_ocr import (
  AccountingSummary,
  AccountingTransaction,
)
from app.services.ocr_service import OcrRawSummary
from app.utils.money import parse_money


def _diff(computed: int | None, stated: int | None) -> int | None:
  """computed - stated. 둘 중 하나라도 없으면 비교 불가(None)."""
  if computed is None or stated is None:
    return None
  return computed - stated


def _reconcile_monthly(
  raw: OcrRawSummary,
  transactions: list[AccountingTransaction],
) -> AccountingSummary:
  """월 계 행: 같은 페이지 거래내역 합산 vs 장부 총계."""
  page = raw["page"]
  page_txs = [t for t in transactions if t.source_page == page]

  computed_income = sum(t.income or 0 for t in page_txs)
  computed_expense = sum(t.expense or 0 for t in page_txs)
  computed_net = computed_income - computed_expense

  stated_income = parse_money(raw["amount_col2"])
  stated_expense = parse_money(raw["amount_col3"])
  stated_net = parse_money(raw["amount_col4"])

  income_diff = _diff(computed_income, stated_income)
  expense_diff = _diff(computed_expense, stated_expense)
  net_diff = _diff(computed_net, stated_net)

  # 입금·출금 총계가 모두 장부와 정확히 일치할 때만 matched.
  matched = income_diff == 0 and expense_diff == 0

  return AccountingSummary(
    source_page=page,
    kind="monthly",
    year=int(raw.get("page_year") or 0),
    month=int(raw.get("page_month") or 0),
    label=raw["label"],
    stated_income=stated_income,
    stated_expense=stated_expense,
    stated_net=stated_net,
    computed_income=computed_income,
    computed_expense=computed_expense,
    computed_net=computed_net,
    income_diff=income_diff,
    expense_diff=expense_diff,
    net_diff=net_diff,
    matched=matched,
  )


def _reconcile_grand(raw: OcrRawSummary) -> AccountingSummary:
  """총 합계 행: 이월잔액 + 월순액 == running 인지 내부 정합성만 확인."""
  balance = parse_money(raw["amount_col2"])  # 이월 잔액
  month_net = parse_money(raw["amount_col3"])  # 이번(해당 기간) 순액
  running = parse_money(raw["amount_col4"])  # 장부에 적힌 총합계

  computed_net = None
  if balance is not None and month_net is not None:
    computed_net = balance + month_net

  net_diff = _diff(computed_net, running)
  matched = net_diff == 0

  return AccountingSummary(
    source_page=raw["page"],
    kind="grand",
    year=int(raw.get("page_year") or 0),
    month=0,
    label=raw["label"],
    stated_income=balance,
    stated_expense=month_net,
    stated_net=running,
    computed_income=None,
    computed_expense=None,
    computed_net=computed_net,
    income_diff=None,
    expense_diff=None,
    net_diff=net_diff,
    matched=matched,
  )


def reconcile(
  transactions: list[AccountingTransaction],
  raw_summaries: list[OcrRawSummary],
) -> list[AccountingSummary]:
  """OCR 합계 행들을 거래내역과 대조해 검증 결과 리스트로 변환."""
  results: list[AccountingSummary] = []

  for raw in raw_summaries:
    if raw.get("kind") == "grand":
      results.append(_reconcile_grand(raw))
    else:
      results.append(_reconcile_monthly(raw, transactions))

  return results
