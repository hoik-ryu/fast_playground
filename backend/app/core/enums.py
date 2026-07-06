from enum import Enum




class AuditAction(str, Enum):
  """허용되는 감사 작업 목록."""

  LOGIN = "LOGIN"
  LOGOUT = "LOGOUT"
  CREATE = "CREATE"
  UPDATE = "UPDATE"
  DELETE = "DELETE"
  CHANGE_PASSWORD = "CHANGE_PASSWORD"


class ItemName(str, Enum):
    """허용되는 상품명(과일) 목록."""

    APPLE = "사과"
    BANANA = "바나나"
    ORANGE = "오렌지"
    GRAPE = "포도"
