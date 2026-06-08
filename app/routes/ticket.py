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
from app.crud.ticket_event import create_ticket_event, list_ticket_events
from app.database import get_db
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.ticket import TicketCreate, TicketListResponse, TicketResponse, TicketUpdate
from app.schemas.ticket_event import TicketEventCreate, TicketEventResponse

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

    created_ticket = create_ticket(db, ticket_data=ticket, owner_id=current_user.id)
    create_ticket_event(
        db,
        ticket_id=created_ticket.id,
        actor_id=current_user.id,
        event_type="comment",
        message="Chamado aberto.",
    )
    db.commit()
    db.refresh(created_ticket)

    return created_ticket


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

    previous_status = ticket.status
    previous_assigned_to_id = ticket.assigned_to_id

    updated_ticket = update_ticket(db, ticket=ticket, ticket_data=ticket_data)

    if previous_status != updated_ticket.status:
        create_ticket_event(
            db,
            ticket_id=updated_ticket.id,
            actor_id=current_user.id,
            event_type="status_changed",
            message="Status atualizado.",
            old_value=previous_status,
            new_value=updated_ticket.status,
        )

    if previous_assigned_to_id != updated_ticket.assigned_to_id:
        create_ticket_event(
            db,
            ticket_id=updated_ticket.id,
            actor_id=current_user.id,
            event_type="assignment_changed",
            message="Responsavel atualizado.",
            old_value=str(previous_assigned_to_id) if previous_assigned_to_id else None,
            new_value=str(updated_ticket.assigned_to_id) if updated_ticket.assigned_to_id else None,
        )

    db.commit()
    db.refresh(updated_ticket)

    return updated_ticket


@router.get("/{ticket_id}/events", response_model=list[TicketEventResponse])
def list_events(
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
    return list_ticket_events(db, ticket_id=ticket.id)


@router.post("/{ticket_id}/events", response_model=TicketEventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    ticket_id: int,
    event_data: TicketEventCreate,
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
    event = create_ticket_event(
        db,
        ticket_id=ticket.id,
        actor_id=current_user.id,
        event_type="comment",
        message=event_data.message,
    )
    db.commit()
    db.refresh(event)
    return event


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
