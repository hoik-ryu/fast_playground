"""
회계장부 OCR 관련 스키마.

프론트(AccountingTransaction)와 맞추기 위해 JSON 은 camelCase 로 직렬화합니다.
(source_page <-> sourcePage). CSV 컬럼 순서는 csv_export_service 가 고정.
"""

from typing import Annotated

from app.utils.money import parse_money
from pydantic import BaseModel, BeforeValidator, ConfigDict
from pydantic.alias_generators import to_camel

MoneyInt = Annotated[int | None, BeforeValidator(parse_money)]


class CamelModel(BaseModel):
  model_config = ConfigDict(
    alias_generator=to_camel,
    populate_by_name=True,
  )


class AccountingTransaction(CamelModel):
  date: str  # YYYY-MM-DD
  year: int
  month: int
  description: str
  income: MoneyInt = None
  expense: MoneyInt = None
  note: str = ""
  source_page: int
  category: str


class AccountingMemo(CamelModel):
  source_page: int
  text: str


class AccountingSummary(CamelModel):
  """장부의 합계 행(계/총 합계)을 거래내역 합산값과 대조한 결과.

  - kind="monthly": 월 계 행. stated=장부에 적힌 총계, computed=거래내역 합산.
  - kind="grand": 총 합계 행. stated_net=running(잔액+월순액),
    computed_net=잔액+월순액 으로 내부 정합성만 확인.
  필드 의미(kind 별):
    stated_income  monthly=입금총계 / grand=이월잔액
    stated_expense monthly=출금총계 / grand=월순액
    stated_net     monthly=입금-출금 / grand=총합계(running)
  """

  source_page: int
  kind: str  # "monthly" | "grand"
  year: int
  month: int  # grand 은 0
  label: str
  stated_income: MoneyInt = None
  stated_expense: MoneyInt = None
  stated_net: MoneyInt = None
  computed_income: MoneyInt = None
  computed_expense: MoneyInt = None
  computed_net: MoneyInt = None
  income_diff: MoneyInt = None  # computed - stated
  expense_diff: MoneyInt = None
  net_diff: MoneyInt = None
  matched: bool


class UploadResult(CamelModel):
  transactions: list[AccountingTransaction]
  memos: list[AccountingMemo]
  summaries: list[AccountingSummary]


class ExportCsvRequest(CamelModel):
  transactions: list[AccountingTransaction]


class ExportMemoCsvRequest(CamelModel):
  memos: list[AccountingMemo]


class ExportSummaryCsvRequest(CamelModel):
  summaries: list[AccountingSummary]
