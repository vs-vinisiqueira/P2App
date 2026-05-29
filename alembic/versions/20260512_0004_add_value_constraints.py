"""add value constraints

Revision ID: 20260512_0004
Revises: 20260416_0003
Create Date: 2026-05-12
"""

from collections.abc import Sequence

from alembic import op


revision: str = "20260512_0004"
down_revision: str | None = "20260416_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_check_constraint(
        "ck_users_tipo_usuario_valid",
        "users",
        "tipo_usuario IN ('admin', 'gerente', 'tecnico', 'cliente')",
    )
    op.create_check_constraint(
        "ck_users_role_valid",
        "users",
        "role IN ('admin', 'user')",
    )
    op.create_check_constraint(
        "ck_chamados_status_valid",
        "chamados",
        "status IN ('aberto', 'em_andamento', 'concluido', 'cancelado')",
    )
    op.create_check_constraint(
        "ck_chamados_prioridade_valid",
        "chamados",
        "prioridade IN ('baixa', 'media', 'alta')",
    )


def downgrade() -> None:
    op.drop_constraint("ck_chamados_prioridade_valid", "chamados", type_="check")
    op.drop_constraint("ck_chamados_status_valid", "chamados", type_="check")
    op.drop_constraint("ck_users_role_valid", "users", type_="check")
    op.drop_constraint("ck_users_tipo_usuario_valid", "users", type_="check")
