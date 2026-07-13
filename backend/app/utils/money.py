"""금액 파싱·검증 공통 유틸."""

import math
import re

# 100억(10,000,000,000원) 이상은 OCR 오인식으로 간주한다.
MAX_MONEY_VALUE = 10_000_000_000

SUSPICIOUS_AMOUNT_NOTE = "수치가 이상함 확인필요"


def append_note(note: str, extra: str) -> str:
  note = (note or "").strip()
  if not note:
    return extra
  if extra in note:
    return note
  return f"{note} / {extra}"


def _is_suspicious_amount(value: int) -> bool:
  return abs(value) >= MAX_MONEY_VALUE


def parse_money_amount(raw: str | int | float | None) -> tuple[int | None, bool]:
  """금액과 비정상 여부를 반환. 100억 이상이면 호출측에서 0 + 비고 처리."""
  if raw is None or raw == "":
    return None, False

  if isinstance(raw, bool):
    return 0, True

  if isinstance(raw, float):
    if not math.isfinite(raw):
      return 0, True
    value = int(round(raw))
    if _is_suspicious_amount(value):
      return 0, True
    return value, False

  if isinstance(raw, int):
    if _is_suspicious_amount(raw):
      return 0, True
    return raw, False

  text = str(raw).strip()
  if not text:
    return None, False

  digits = re.sub(r"[^\d]", "", text)
  if not digits:
    return 0, True

  value = int(digits)
  if _is_suspicious_amount(value):
    return 0, True
  return value, False


def parse_money(raw: str | int | float | None) -> int | None:
  """API 재검증용. 비정상 금액은 0으로 정리."""
  value, suspicious = parse_money_amount(raw)
  if suspicious:
    return 0
  return value
