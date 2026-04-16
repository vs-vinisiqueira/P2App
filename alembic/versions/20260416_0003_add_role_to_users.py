"""add role to users

Revision ID: 20260416_0003
Revises: 20260416_0002
Create Date: 2026-04-16
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260416_0003"
down_revision: str | None = "20260416_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("role", sa.String(length=20), server_default="user", nullable=False),
    )
    op.execute("UPDATE users SET role = 'admin' WHERE tipo_usuario = 'admin'")


def downgrade() -> None:
    op.drop_column("users", "role")
