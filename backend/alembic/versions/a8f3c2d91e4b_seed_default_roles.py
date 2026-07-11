"""seed default roles and backfill existing users

Revision ID: a8f3c2d91e4b
Revises: 42e044290f05
Create Date: 2026-07-10 14:30:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a8f3c2d91e4b"
down_revision: Union[str, Sequence[str], None] = "42e044290f05"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

DEFAULT_ROLES = (
  ("user", "일반 사용자"),
  ("manager", "매니저"),
  ("admin", "관리자"),
)


def upgrade() -> None:
  conn = op.get_bind()

  for name, description in DEFAULT_ROLES:
    conn.execute(
      sa.text(
        """
        INSERT INTO roles (name, description, created_at, updated_at)
        VALUES (:name, :description, now(), now())
        ON CONFLICT (name) DO NOTHING
        """
      ),
      {"name": name, "description": description},
    )

  conn.execute(
    sa.text(
      """
      INSERT INTO user_roles (user_id, role_id)
      SELECT u.id, r.id
      FROM users u
      JOIN roles r ON r.name = 'user'
      WHERE NOT EXISTS (
        SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id
      )
      """
    )
  )


def downgrade() -> None:
  conn = op.get_bind()

  conn.execute(
    sa.text(
      """
      DELETE FROM user_roles
      WHERE role_id IN (
        SELECT id FROM roles WHERE name IN ('user', 'manager', 'admin')
      )
      """
    )
  )
  conn.execute(
    sa.text("DELETE FROM roles WHERE name IN ('user', 'manager', 'admin')")
  )
