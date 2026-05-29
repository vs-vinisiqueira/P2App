"""create tickets module over chamados table

Revision ID: 20260529_0005
Revises: 20260512_0004
Create Date: 2026-05-29
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260529_0005"
down_revision: str | None = "20260512_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _table_exists(table_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return table_name in inspector.get_table_names()


def _columns(table_name: str) -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return {column["name"] for column in inspector.get_columns(table_name)}


def _check_constraints(table_name: str) -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return {
        constraint["name"]
        for constraint in inspector.get_check_constraints(table_name)
        if constraint.get("name")
    }


def _indexes(table_name: str) -> set[str]:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return {index["name"] for index in inspector.get_indexes(table_name)}


def upgrade() -> None:
    if not _table_exists("chamados"):
        op.create_table(
            "chamados",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("title", sa.String(length=150), nullable=False),
            sa.Column("description", sa.Text(), nullable=False),
            sa.Column("status", sa.String(length=30), server_default="open", nullable=False),
            sa.Column("priority", sa.String(length=20), server_default="medium", nullable=False),
            sa.Column("category", sa.String(length=80), nullable=True),
            sa.Column("owner_id", sa.Integer(), nullable=False),
            sa.Column("assigned_to_id", sa.Integer(), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
                nullable=False,
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
                nullable=False,
            ),
            sa.CheckConstraint(
                "status IN ('open', 'in_progress', 'resolved', 'closed')",
                name="ck_chamados_status_valid",
            ),
            sa.CheckConstraint(
                "priority IN ('low', 'medium', 'high', 'critical')",
                name="ck_chamados_priority_valid",
            ),
            sa.ForeignKeyConstraint(["owner_id"], ["users.id"]),
            sa.ForeignKeyConstraint(["assigned_to_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_chamados_id"), "chamados", ["id"])
        op.create_index(op.f("ix_chamados_owner_id"), "chamados", ["owner_id"])
        op.create_index(op.f("ix_chamados_assigned_to_id"), "chamados", ["assigned_to_id"])
        return

    constraints = _check_constraints("chamados")
    if "ck_chamados_status_valid" in constraints:
        op.drop_constraint("ck_chamados_status_valid", "chamados", type_="check")
    if "ck_chamados_prioridade_valid" in constraints:
        op.drop_constraint("ck_chamados_prioridade_valid", "chamados", type_="check")

    columns = _columns("chamados")
    if "titulo" in columns and "title" not in columns:
        op.alter_column(
            "chamados",
            "titulo",
            new_column_name="title",
            existing_type=sa.String(length=150),
            existing_nullable=False,
        )
    if "descricao" in columns and "description" not in columns:
        op.alter_column(
            "chamados",
            "descricao",
            new_column_name="description",
            existing_type=sa.Text(),
            existing_nullable=False,
        )
    if "prioridade" in columns and "priority" not in columns:
        op.alter_column(
            "chamados",
            "prioridade",
            new_column_name="priority",
            existing_type=sa.String(length=20),
            existing_nullable=False,
        )
    if "cliente_id" in columns and "owner_id" not in columns:
        op.alter_column(
            "chamados",
            "cliente_id",
            new_column_name="owner_id",
            existing_type=sa.Integer(),
            existing_nullable=False,
        )

    columns = _columns("chamados")
    if "category" not in columns:
        op.add_column("chamados", sa.Column("category", sa.String(length=80), nullable=True))
    if "assigned_to_id" not in columns:
        op.add_column("chamados", sa.Column("assigned_to_id", sa.Integer(), nullable=True))
        op.create_foreign_key(
            "fk_chamados_assigned_to_id_users",
            "chamados",
            "users",
            ["assigned_to_id"],
            ["id"],
        )
    if "updated_at" not in columns:
        op.add_column(
            "chamados",
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
                nullable=False,
            ),
        )

    op.alter_column("chamados", "status", server_default="open")
    op.alter_column("chamados", "priority", server_default="medium")

    op.execute(
        """
        UPDATE chamados
        SET status = CASE status
            WHEN 'aberto' THEN 'open'
            WHEN 'em_andamento' THEN 'in_progress'
            WHEN 'concluido' THEN 'resolved'
            WHEN 'cancelado' THEN 'closed'
            ELSE status
        END
        """
    )
    op.execute(
        """
        UPDATE chamados
        SET priority = CASE priority
            WHEN 'baixa' THEN 'low'
            WHEN 'media' THEN 'medium'
            WHEN 'alta' THEN 'high'
            ELSE priority
        END
        """
    )

    constraints = _check_constraints("chamados")
    if "ck_chamados_status_valid" not in constraints:
        op.create_check_constraint(
            "ck_chamados_status_valid",
            "chamados",
            "status IN ('open', 'in_progress', 'resolved', 'closed')",
        )
    if "ck_chamados_priority_valid" not in constraints:
        op.create_check_constraint(
            "ck_chamados_priority_valid",
            "chamados",
            "priority IN ('low', 'medium', 'high', 'critical')",
        )

    indexes = _indexes("chamados")
    if "ix_chamados_owner_id" not in indexes:
        op.create_index(op.f("ix_chamados_owner_id"), "chamados", ["owner_id"])
    if "ix_chamados_assigned_to_id" not in indexes:
        op.create_index(op.f("ix_chamados_assigned_to_id"), "chamados", ["assigned_to_id"])


def downgrade() -> None:
    constraints = _check_constraints("chamados")
    if "ck_chamados_priority_valid" in constraints:
        op.drop_constraint("ck_chamados_priority_valid", "chamados", type_="check")
    if "ck_chamados_status_valid" in constraints:
        op.drop_constraint("ck_chamados_status_valid", "chamados", type_="check")

    indexes = _indexes("chamados")
    if "ix_chamados_assigned_to_id" in indexes:
        op.drop_index(op.f("ix_chamados_assigned_to_id"), table_name="chamados")
    if "ix_chamados_owner_id" in indexes:
        op.drop_index(op.f("ix_chamados_owner_id"), table_name="chamados")

    columns = _columns("chamados")
    if "assigned_to_id" in columns:
        op.drop_constraint("fk_chamados_assigned_to_id_users", "chamados", type_="foreignkey")
        op.drop_column("chamados", "assigned_to_id")
    if "category" in columns:
        op.drop_column("chamados", "category")
    if "updated_at" in columns:
        op.drop_column("chamados", "updated_at")

    op.execute(
        """
        UPDATE chamados
        SET status = CASE status
            WHEN 'open' THEN 'aberto'
            WHEN 'in_progress' THEN 'em_andamento'
            WHEN 'resolved' THEN 'concluido'
            WHEN 'closed' THEN 'cancelado'
            ELSE status
        END
        """
    )
    op.execute(
        """
        UPDATE chamados
        SET priority = CASE priority
            WHEN 'low' THEN 'baixa'
            WHEN 'medium' THEN 'media'
            WHEN 'high' THEN 'alta'
            WHEN 'critical' THEN 'alta'
            ELSE priority
        END
        """
    )

    columns = _columns("chamados")
    if "title" in columns and "titulo" not in columns:
        op.alter_column(
            "chamados",
            "title",
            new_column_name="titulo",
            existing_type=sa.String(length=150),
            existing_nullable=False,
        )
    if "description" in columns and "descricao" not in columns:
        op.alter_column(
            "chamados",
            "description",
            new_column_name="descricao",
            existing_type=sa.Text(),
            existing_nullable=False,
        )
    if "priority" in columns and "prioridade" not in columns:
        op.alter_column(
            "chamados",
            "priority",
            new_column_name="prioridade",
            existing_type=sa.String(length=20),
            existing_nullable=False,
        )
    if "owner_id" in columns and "cliente_id" not in columns:
        op.alter_column(
            "chamados",
            "owner_id",
            new_column_name="cliente_id",
            existing_type=sa.Integer(),
            existing_nullable=False,
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
