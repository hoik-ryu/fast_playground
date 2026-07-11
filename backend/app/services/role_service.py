from app.core.roles import ADMIN_ROLE_NAME, MANAGER_ROLE_NAME, USER_ROLE_NAME
from app.models.role import Role
from app.models.user import User
from sqlalchemy.orm import Session

DEFAULT_ROLES: tuple[tuple[str, str], ...] = (
  (USER_ROLE_NAME, "일반 사용자"),
  (MANAGER_ROLE_NAME, "매니저"),
  (ADMIN_ROLE_NAME, "관리자"),
)


def ensure_default_roles(db: Session) -> dict[str, Role]:
  roles_by_name: dict[str, Role] = {}

  for name, description in DEFAULT_ROLES:
    role = db.query(Role).filter(Role.name == name).first()
    if role is None:
      role = Role(name=name, description=description)
      db.add(role)
    else:
      role.description = description

    roles_by_name[name] = role

  db.flush()
  return roles_by_name


def get_role_by_name(db: Session, role_name: str) -> Role | None:
  return db.query(Role).filter(Role.name == role_name).first()


def assign_role_to_user(db: Session, user: User, role_name: str) -> None:
  role = get_role_by_name(db, role_name)
  if role is None:
    ensure_default_roles(db)
    role = get_role_by_name(db, role_name)

  if role is None:
    raise RuntimeError(f"role '{role_name}' 을 찾을 수 없습니다.")

  if role not in user.roles:
    user.roles.append(role)


def assign_default_user_role(db: Session, user: User) -> None:
  ensure_default_roles(db)
  assign_role_to_user(db, user, USER_ROLE_NAME)
