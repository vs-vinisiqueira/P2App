from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.core.authorization import is_support_staff
from app.core.deps import get_current_user
from app.crud.ticket import (
    count_tickets,
    create_ticket,
    delete_ticket,
    get_ticket_by_id,
    list_tickets,
    update_ticket,
)
from app.database import get_db
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.ticket import TicketCreate, TicketListResponse, TicketResponse, TicketUpdate

router = APIRouter(prefix="/tickets", tags=["Tickets"])


def _ensure_ticket_access(ticket: Ticket, current_user: User) -> None:
    if is_support_staff(current_user) or ticket.owner_id == current_user.id:
        return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Sem permissao para acessar este chamado",
    )


@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create(
    ticket: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if ticket.assigned_to_id is not None and not is_support_staff(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas suporte ou administradores podem definir responsavel",
        )

    return create_ticket(db, ticket_data=ticket, owner_id=current_user.id)


@router.get("", response_model=TicketListResponse)
def list_all(
    limit: int = Query(default=100, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    owner_id = None if is_support_staff(current_user) else current_user.id

    return TicketListResponse(
        items=list_tickets(db, limit=limit, offset=offset, owner_id=owner_id),
        total=count_tickets(db, owner_id=owner_id),
        limit=limit,
        offset=offset,
    )


@router.get("/{ticket_id}", response_model=TicketResponse)
def get(
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
    return ticket


@router.patch("/{ticket_id}", response_model=TicketResponse)
def update(
    ticket_id: int,
    ticket_data: TicketUpdate,
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

    if not is_support_staff(current_user):
        restricted_fields = {"status", "assigned_to_id"}
        requested_fields = set(ticket_data.model_dump(exclude_unset=True))
        if requested_fields & restricted_fields:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Apenas suporte ou administradores podem alterar status e responsavel",
            )

    return update_ticket(db, ticket=ticket, ticket_data=ticket_data)


@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(
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
    delete_ticket(db, ticket=ticket)

    return Response(status_code=status.HTTP_204_NO_CONTENT)
