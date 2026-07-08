"""
거래내역 rule-based 자동 분류.

내용(description)/비고(note) 텍스트를 키워드로 매칭해 분류 컬럼 값을 정합니다.
규칙은 위에서부터 순서대로 검사하며, 먼저 매칭되는 분류를 사용합니다.
"""

import re

# (분류명, 키워드 목록) — 순서 중요.
# 예: "승강기전기료"는 공과금에서, "승강기점검"은 유지보수에서 잡힙니다.
_CATEGORY_RULES: list[tuple[str, list[str]]] = [
  ("공과금", ["승강기전기료", "전기료", "수도료"]),
  ("대출이자", ["대출이자"]),
  ("세금", ["부가세", "세금"]),
  ("보험", ["사회보험", "건강보험", "국민건강"]),
  ("안전관리", ["소방", "전기안전점검", "안전"]),
  ("유지보수", ["승강기점검", "하수구공사", "공사"]),
  ("보안비용", ["캡스", "보안"]),
  ("통신비", ["HCN", "방송", "통신"]),
  ("가족지출", ["가족", "후식"]),
  ("생활비", ["추석", "생활비", "기름"]),
  ("선지급", ["류익현", "류동현", "선지급"]),
  ("관리자 월급", ["관리운영"]),
  ("관리비", ["에넥스", "관리비", "석유"]),
  ("월세수입", ["월세", "임대"]),
]

# "-25회", "3회차" 같은 회차 표현 → 선지급
_ROUND_PATTERN = re.compile(r"\d+\s*회")


def classify(description: str, note: str, income: int | None) -> str:
  text = f"{description} {note}"

  for category, keywords in _CATEGORY_RULES:
    if any(keyword in text for keyword in keywords):
      return category

  if _ROUND_PATTERN.search(text):
    return "선지급"

  # 입금(수입) 항목인데 위 규칙에 안 걸리면 상호명 월세수입으로 간주.
  if income is not None and income > 0:
    return "월세수입"

  return "미분류"
