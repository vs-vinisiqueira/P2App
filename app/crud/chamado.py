from sqlalchemy.orm import Session

from app.models.chamado import Chamado
from app.schemas.chamado import ChamadoCreate


def criar_chamado(
    db: Session,
    chamado_data: ChamadoCreate,
    cliente_id: int,
) -> Chamado:
    novo_chamado = Chamado(
        titulo=chamado_data.titulo,
        descricao=chamado_data.descricao,
        prioridade=chamado_data.prioridade,
        status="aberto",
        cliente_id=cliente_id,
    )

    db.add(novo_chamado)
    db.commit()
    db.refresh(novo_chamado)

    return novo_chamado


def listar_chamados_por_cliente(
    db: Session,
    cliente_id: int,
    limit: int = 100,
    offset: int = 0,
) -> list[Chamado]:
    return (
        db.query(Chamado)
        .filter(Chamado.cliente_id == cliente_id)
        .offset(offset)
        .limit(limit)
        .all()
    )


def listar_todos_chamados(
    db: Session,
    limit: int = 100,
    offset: int = 0,
) -> list[Chamado]:
    return db.query(Chamado).offset(offset).limit(limit).all()
