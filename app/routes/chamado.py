from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from app.core.authorization import is_admin, is_cliente
from app.core.deps import get_current_user
from app.crud.ticket import create_ticket, get_ticket_by_id, list_tickets, update_ticket
from app.database import get_db
from app.models.user import User
from app.schemas.ticket import TicketCreate, TicketUpdate

router = APIRouter(prefix="/chamados", tags=["Chamados"])

_PRIORITY_TO_TICKET = {"baixa": "low", "media": "medium", "alta": "high"}
_PRIORITY_FROM_TICKET = {"low": "baixa", "medium": "media", "high": "alta", "critical": "alta"}
_STATUS_TO_TICKET = {
    "aberto": "open",
    "em_andamento": "in_progress",
    "concluido": "resolved",
    "cancelado": "closed",
}
_STATUS_FROM_TICKET = {
    "open": "aberto",
    "in_progress": "em_andamento",
    "resolved": "concluido",
    "closed": "cancelado",
}


class ChamadoCreate(BaseModel):
    titulo: str = Field(min_length=2, max_length=150)
    descricao: str = Field(min_length=1)
    prioridade: Literal["baixa", "media", "alta"]


class ChamadoStatusUpdate(BaseModel):
    status: Literal["aberto", "em_andamento", "concluido", "cancelado"]


class ChamadoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    titulo: str
    descricao: str
    status: str
    prioridade: str
    cliente_id: int
    created_at: datetime


def _to_chamado_response(ticket) -> dict:
    return {
        "id": ticket.id,
        "titulo": ticket.title,
        "descricao": ticket.description,
        "status": _STATUS_FROM_TICKET[ticket.status],
        "prioridade": _PRIORITY_FROM_TICKET[ticket.priority],
        "cliente_id": ticket.owner_id,
        "created_at": ticket.created_at,
    }


@router.post("/", response_model=ChamadoResponse, status_code=status.HTTP_201_CREATED)
def criar(
    chamado: ChamadoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not is_cliente(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas clientes podem criar chamados",
        )

    ticket = create_ticket(
        db,
        ticket_data=TicketCreate(
            title=chamado.titulo,
            description=chamado.descricao,
            priority=_PRIORITY_TO_TICKET[chamado.prioridade],
        ),
        owner_id=current_user.id,
    )
    db.commit()
    db.refresh(ticket)

    return _to_chamado_response(ticket)


@router.get("/", response_model=list[ChamadoResponse])
def listar(
    limit: int = Query(default=100, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if is_admin(current_user):
        tickets = list_tickets(db, limit=limit, offset=offset)
        return [_to_chamado_response(ticket) for ticket in tickets]

    if is_cliente(current_user):
        tickets = list_tickets(db, limit=limit, offset=offset, owner_id=current_user.id)
        return [_to_chamado_response(ticket) for ticket in tickets]

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Perfil sem permissao para listar chamados",
    )


@router.get("/{chamado_id}", response_model=ChamadoResponse)
def obter(
    chamado_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = get_ticket_by_id(db, ticket_id=chamado_id)
    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chamado nao encontrado",
        )

    if is_admin(current_user) or (is_cliente(current_user) and ticket.owner_id == current_user.id):
        return _to_chamado_response(ticket)

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Perfil sem permissao para visualizar este chamado",
    )


@router.patch("/{chamado_id}/status", response_model=ChamadoResponse)
def atualizar_status(
    chamado_id: int,
    dados_status: ChamadoStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not is_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem atualizar status de chamados",
        )

    ticket = get_ticket_by_id(db, ticket_id=chamado_id)
    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chamado nao encontrado",
        )

    updated_ticket = update_ticket(
        db,
        ticket=ticket,
        ticket_data=TicketUpdate(status=_STATUS_TO_TICKET[dados_status.status]),
    )
    db.commit()
    db.refresh(updated_ticket)

    return _to_chamado_response(updated_ticket)
