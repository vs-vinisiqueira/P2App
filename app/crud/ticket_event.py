from sqlalchemy.orm import Session

from app.models.ticket_event import TicketEvent


def create_ticket_event(
    db: Session,
    *,
    ticket_id: int,
    actor_id: int,
    event_type: str,
    message: str | None = None,
    old_value: str | None = None,
    new_value: str | None = None,
) -> TicketEvent:
    event = TicketEvent(
        ticket_id=ticket_id,
        actor_id=actor_id,
        event_type=event_type,
        message=message,
        old_value=old_value,
        new_value=new_value,
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    return event


def list_ticket_events(db: Session, *, ticket_id: int) -> list[TicketEvent]:
    return (
        db.query(TicketEvent)
        .filter(TicketEvent.ticket_id == ticket_id)
        .order_by(TicketEvent.created_at.asc(), TicketEvent.id.asc())
        .all()
    )
