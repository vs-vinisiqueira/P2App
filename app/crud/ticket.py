from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.ticket import Ticket
from app.schemas.ticket import TicketCreate, TicketUpdate


def create_ticket(
    db: Session,
    ticket_data: TicketCreate,
    owner_id: int,
) -> Ticket:
    ticket = Ticket(
        title=ticket_data.title,
        description=ticket_data.description,
        priority=ticket_data.priority,
        category=ticket_data.category,
        assigned_to_id=ticket_data.assigned_to_id,
        status="open",
        owner_id=owner_id,
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return ticket


def count_tickets(db: Session, owner_id: int | None = None) -> int:
    query = db.query(func.count(Ticket.id))

    if owner_id is not None:
        query = query.filter(Ticket.owner_id == owner_id)

    return query.scalar() or 0


def list_tickets(
    db: Session,
    limit: int = 100,
    offset: int = 0,
    owner_id: int | None = None,
) -> list[Ticket]:
    query = db.query(Ticket)

    if owner_id is not None:
        query = query.filter(Ticket.owner_id == owner_id)

    return (
        query.order_by(Ticket.created_at.desc(), Ticket.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def get_ticket_by_id(db: Session, ticket_id: int) -> Ticket | None:
    return db.query(Ticket).filter(Ticket.id == ticket_id).first()


def update_ticket(
    db: Session,
    ticket: Ticket,
    ticket_data: TicketUpdate,
) -> Ticket:
    update_data = ticket_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(ticket, field, value)

    db.commit()
    db.refresh(ticket)

    return ticket


def delete_ticket(db: Session, ticket: Ticket) -> None:
    db.delete(ticket)
    db.commit()
