from datetime import datetime, timezone
from sqlalchemy.orm import Session, joinedload

from app.models.atendimento import Atendimento
from app.schemas.atendimento import AtendimentoCreate, AtendimentoUpdate


def create_atendimento(
    db: Session,
    *,
    ticket_id: int,
    tecnico_id: int,
    atendimento_data: AtendimentoCreate,
) -> Atendimento:
    atendimento = Atendimento(
        ticket_id=ticket_id,
        tecnico_id=tecnico_id,
        descricao=atendimento_data.descricao,
        status=atendimento_data.status,
        data_inicio=atendimento_data.data_inicio or datetime.now(timezone.utc),
    )
    db.add(atendimento)
    db.flush()
    db.refresh(atendimento)
    return atendimento


def list_atendimentos_by_ticket(db: Session, *, ticket_id: int) -> list[Atendimento]:
    return (
        db.query(Atendimento)
        .options(joinedload(Atendimento.tecnico))
        .filter(Atendimento.ticket_id == ticket_id)
        .order_by(Atendimento.created_at.asc(), Atendimento.id.asc())
        .all()
    )


def get_atendimento_by_id(db: Session, *, atendimento_id: int) -> Atendimento | None:
    return (
        db.query(Atendimento)
        .options(joinedload(Atendimento.tecnico))
        .filter(Atendimento.id == atendimento_id)
        .first()
    )


def update_atendimento(
    db: Session,
    *,
    atendimento: Atendimento,
    atendimento_data: AtendimentoUpdate,
) -> Atendimento:
    update_dict = atendimento_data.model_dump(exclude_unset=True)

    # Se estiver concluindo ou cancelando e não tiver data_fim, preenche com agora
    if (
        update_dict.get("status") in {"concluido", "cancelado"}
        and "data_fim" not in update_dict
        and atendimento.data_fim is None
    ):
        update_dict["data_fim"] = datetime.now(timezone.utc)

    for field, value in update_dict.items():
        setattr(atendimento, field, value)

    db.flush()
    db.refresh(atendimento)
    return atendimento


def delete_atendimento(db: Session, *, atendimento: Atendimento) -> None:
    db.delete(atendimento)
    db.commit()
