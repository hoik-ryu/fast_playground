"""
OCR 호출 추상화 레이어.

- settings.OCR_PROVIDER 값으로 provider 를 고른다. ("mock" | "clova")
- provider 는 PDF 파일 경로를 받아 "raw row" 리스트를 돌려준다.
  (날짜/금액이 아직 정제되지 않은 문자열 상태)
- 실제 파싱/정규화는 accounting_parser_service 가 담당한다.

새 OCR 을 붙일 때는 OcrProvider 프로토콜을 구현한 클래스를 만들고
_build_provider() 에 분기만 추가하면 된다.
"""

from typing import Protocol, TypedDict

from app.core.config import settings
from app.core.exceptions import AppException
from app.services import clova_ocr_client


class OcrRawRow(TypedDict):
  page: int
  date: str  # OCR 원문 (예: "01", "2017.01.01")
  description: str  # 내용
  income: str  # 입금 원문 (예: "11,000,000"), 없으면 ""
  expense: str  # 출금 원문, 없으면 ""
  note: str  # 비고
  page_year: int  # PDF 상단 헤더에서 추출한 연도 (없으면 0)
  page_month: int  # PDF 상단 헤더에서 추출한 월 (없으면 0)


class OcrMemo(TypedDict):
  page: int
  text: str  # 표가 아닌 자유 텍스트(메모) 페이지의 원문


class OcrRawSummary(TypedDict):
  """표 하단 '계'(월 합계) / '총 합계'(누적) 행.

  장부 열 순서가 고정이라 col2~col4 원문을 그대로 담는다.
  - monthly(월 계): col2=입금총계, col3=출금총계, col4=입금-출금
  - grand(총 합계): col2=잔액, col3=월순액, col4=running(잔액+월순액)
  """

  page: int
  kind: str  # "monthly" | "grand"
  label: str  # 라벨 원문 (예: "계", "총 합계")
  amount_col2: str
  amount_col3: str
  amount_col4: str
  page_year: int
  page_month: int


class OcrResult(TypedDict):
  rows: list[OcrRawRow]  # 표(거래내역) 페이지에서 추출한 행
  memos: list[OcrMemo]  # 표가 아닌 메모 페이지의 텍스트
  summaries: list[OcrRawSummary]  # 표 하단 계/총합계 행 (검증용)


class OcrProvider(Protocol):
  def extract(self, file_path: str) -> OcrResult:
    ...


# 종이 회계장부 스캔을 OCR 했다고 가정한 mock 데이터.
# 날짜에 "."이 섞이고 금액에 콤마가 들어가도록 해 파서 정규화를 확인한다.
_MOCK_ROWS: list[OcrRawRow] = [
  {
    "page": 1,
    "date": "01",
    "description": "즐겨찾기",
    "income": "11,000,000",
    "expense": "",
    "note": "즐겨찾기",
    "page_year": 2017,
    "page_month": 1,
  },
  {
    "page": 1,
    "date": "03",
    "description": "하수구공사",
    "income": "",
    "expense": "100,000",
    "note": "풍음",
    "page_year": 2017,
    "page_month": 1,
  },
  {
    "page": 1,
    "date": "04",
    "description": "전기료",
    "income": "",
    "expense": "2,260",
    "note": "118-1 2층",
    "page_year": 2017,
    "page_month": 1,
  },
  {
    "page": 1,
    "date": "12",
    "description": "대출이자",
    "income": "",
    "expense": "1,664,289",
    "note": "남문로",
    "page_year": 2017,
    "page_month": 1,
  },
  {
    "page": 1,
    "date": "24",
    "description": "류익현-25회",
    "income": "",
    "expense": "5,000,000",
    "note": "현금(2억5천)",
    "page_year": 2017,
    "page_month": 1,
  },
]


# 표가 아닌 메모 페이지 예시. (실제 장부의 마지막 장 메모를 흉내)
_MOCK_MEMOS: list[OcrMemo] = [
  {
    "page": 2,
    "text": "\n".join(
      [
        "1월 메모",
        "- 즐겨찾기 임대료 3월부터 인상 예정",
        "- 부가세 신고 준비 (3개 건물)",
        "- 승강기 정기점검 일정 확인",
      ]
    ),
  },
]


# 표 하단 합계 행 예시.
# _MOCK_ROWS 의 실제 합과 일치하도록 맞춰, 검증 결과가 "일치"로 나오게 한다.
#   입금합 = 11,000,000 / 출금합 = 6,766,549 / 순액 = 4,233,451
_MOCK_SUMMARIES: list[OcrRawSummary] = [
  {
    "page": 1,
    "kind": "monthly",
    "label": "계",
    "amount_col2": "11,000,000",
    "amount_col3": "6,766,549",
    "amount_col4": "4,233,451",
    "page_year": 2017,
    "page_month": 1,
  },
  {
    "page": 1,
    "kind": "grand",
    "label": "총 합계",
    "amount_col2": "50,000,000",  # 이월 잔액
    "amount_col3": "4,233,451",  # 이번 달 순액
    "amount_col4": "54,233,451",  # 잔액 + 순액
    "page_year": 2017,
    "page_month": 1,
  },
]


class MockOcrProvider:
  """실제 OCR 대신 고정 예시를 반환하는 개발용 provider."""

  def extract(self, file_path: str) -> OcrResult:
    # 업로드된 파일 내용과 무관하게 mock 데이터를 반환한다.
    return {
      "rows": list(_MOCK_ROWS),
      "memos": list(_MOCK_MEMOS),
      "summaries": list(_MOCK_SUMMARIES),
    }


class ClovaOcrProvider:
  """NAVER Cloud CLOVA General OCR(표 추출) 연동 provider."""

  def extract(self, file_path: str) -> OcrResult:
    if not settings.CLOVA_OCR_API_URL or not settings.CLOVA_OCR_SECRET_KEY:
      raise AppException(
        message="CLOVA OCR 설정(URL/Secret)이 없습니다. .env 를 확인하세요.",
        error_code="OCR_CONFIG_MISSING",
        status_code=500,
      )

    with open(file_path, "rb") as f:
      pdf_bytes = f.read()

    return clova_ocr_client.extract_from_pdf(pdf_bytes)


def _build_provider() -> OcrProvider:
  if settings.OCR_PROVIDER == "clova":
    return ClovaOcrProvider()
  return MockOcrProvider()


def extract(file_path: str) -> OcrResult:
  return _build_provider().extract(file_path)
