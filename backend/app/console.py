"""Rails console(db) 같은 대화형 DB 콘솔."""

from code import interact

from app.db.database import SessionLocal
from app.models import AuditLog, Item, RefreshToken, Role, User, UserRole

BANNER = """
FastAPI DB Console  (종료: Ctrl-D)

  db              SQLAlchemy 세션
  User, Item, ... 모델 클래스

예시:
  User.all()                    # 전체 유저
  User.find(1)                  # id로 조회
  User.where(email="a@b.com")   # 조건 조회
  User.delete_all()             # 전체 삭제 (주의!)
  db.query(Item).all()
"""


def _patch_query_helpers() -> None:
    """Rails 스타일 헬퍼를 모델에 붙인다."""

    def _all(cls):
        return db.query(cls).all()

    def _find(cls, pk: int):
        return db.get(cls, pk)

    def _where(cls, **kwargs):
        return db.query(cls).filter_by(**kwargs).all()

    def _first(cls, **kwargs):
        return db.query(cls).filter_by(**kwargs).first()

    def _delete_all(cls):
        deleted = db.query(cls).delete(synchronize_session=False)
        db.commit()
        print(f"deleted {deleted} row(s) from {cls.__tablename__}")
        return deleted

    for model in (User, Item, Role, UserRole, RefreshToken, AuditLog):
        model.all = classmethod(_all)  # type: ignore[method-assign]
        model.find = classmethod(_find)  # type: ignore[method-assign]
        model.where = classmethod(_where)  # type: ignore[method-assign]
        model.first = classmethod(_first)  # type: ignore[method-assign]
        model.delete_all = classmethod(_delete_all)  # type: ignore[method-assign]


db = SessionLocal()
_patch_query_helpers()

NAMESPACE = {
    "db": db,
    "SessionLocal": SessionLocal,
    "User": User,
    "Item": Item,
    "Role": Role,
    "UserRole": UserRole,
    "RefreshToken": RefreshToken,
    "AuditLog": AuditLog,
}


def main() -> None:
    try:
        try:
            from IPython import start_ipython

            print(BANNER)
            start_ipython(argv=[], user_ns=NAMESPACE, display_banner=False)
        except ImportError:
            interact(banner=BANNER, local=NAMESPACE)
    finally:
        db.close()


if __name__ == "__main__":
    main()
