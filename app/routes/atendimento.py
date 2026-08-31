from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.authorization import is_support_staff
from app.core.deps import get_current_user
from app.crud.atendimento import (
    create_atendimento,
    delete_atendimento,
    get_atendimento_by_id,
    list_atendimentos_by_ticket,
    update_atendimento,
)
from app.crud.ticket import get_ticket_by_id
from app.crud.ticket_event import create_ticket_event
from app.database import get_db
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.atendimento import (
    AtendimentoCreate,
    AtendimentoResponse,
    AtendimentoUpdate,
)

router = APIRouter(prefix="/tickets/{ticket_id}/atendimentos", tags=["Atendimentos"])


def _ensure_ticket_access(ticket: Ticket, current_user: User) -> None:
    if is_support_staff(current_user) or ticket.owner_id == current_user.id:
        return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Sem permissao para acessar este chamado",
    )


@router.post("", response_model=AtendimentoResponse, status_code=status.HTTP_201_CREATED)
def criar(
    ticket_id: int,
    atendimento_data: AtendimentoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = get_ticket_by_id(db, ticket_id=ticket_id)
    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chamado nao encontrado",
        )

    if not is_support_staff(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas tecnicos e administradores podem registrar atendimentos",
        )

    atendimento = create_atendimento(
        db,
        ticket_id=ticket.id,
        tecnico_id=current_user.id,
        atendimento_data=atendimento_data,
    )

    create_ticket_event(
        db,
        ticket_id=ticket.id,
        actor_id=current_user.id,
        event_type="comment",
        message=f"Atendimento tecnico iniciado por {current_user.nome}: {atendimento.descricao}",
    )

    db.commit()
    db.refresh(atendimento)
    return atendimento


@router.get("", response_model=list[AtendimentoResponse])
def listar(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = get_ticket_by_id(db, ticket_id=ticket_id)
    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chamado nao encontrado",
        )

    _ensure_ticket_access(ticket, current_user)
    return list_atendimentos_by_ticket(db, ticket_id=ticket.id)


@router.patch("/{atendimento_id}", response_model=AtendimentoResponse)
def atualizar(
    ticket_id: int,
    atendimento_id: int,
    atendimento_data: AtendimentoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = get_ticket_by_id(db, ticket_id=ticket_id)
    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chamado nao encontrado",
        )

    if not is_support_staff(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas suporte e administradores podem atualizar atendimentos",
        )

    atendimento = get_atendimento_by_id(db, atendimento_id=atendimento_id)
    if atendimento is None or atendimento.ticket_id != ticket.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Atendimento nao encontrado",
        )

    previous_status = atendimento.status
    updated = update_atendimento(
        db,
        atendimento=atendimento,
        atendimento_data=atendimento_data,
    )

    if previous_status != updated.status and updated.status in {"concluido", "cancelado"}:
        create_ticket_event(
            db,
            ticket_id=ticket.id,
            actor_id=current_user.id,
            event_type="comment",
            message=f"Atendimento tecnico #{updated.id} marcado como {updated.status}.",
        )

    db.commit()
    db.refresh(updated)
    return updated


@router.delete("/{atendimento_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir(
    ticket_id: int,
    atendimento_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = get_ticket_by_id(db, ticket_id=ticket_id)
    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chamado nao encontrado",
        )

    if not is_support_staff(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores ou gerentes podem excluir atendimentos",
        )

    atendimento = get_atendimento_by_id(db, atendimento_id=atendimento_id)
    if atendimento is None or atendimento.ticket_id != ticket.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Atendimento nao encontrado",
        )

    delete_atendimento(db, atendimento=atendimento)
