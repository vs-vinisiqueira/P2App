"""create chamados table

Revision ID: 20260416_0002
Revises: 20260415_0001
Create Date: 2026-04-16
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260416_0002"
down_revision: str | None = "20260415_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "chamados",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("titulo", sa.String(length=150), nullable=False),
        sa.Column("descricao", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=30), server_default="aberto", nullable=False),
        sa.Column("prioridade", sa.String(length=20), nullable=False),
        sa.Column("cliente_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["cliente_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_chamados_cliente_id"), "chamados", ["cliente_id"])
    op.create_index(op.f("ix_chamados_id"), "chamados", ["id"])


def downgrade() -> None:
    op.drop_index(op.f("ix_chamados_id"), table_name="chamados")
    op.drop_index(op.f("ix_chamados_cliente_id"), table_name="chamados")
    op.drop_table("chamados")
