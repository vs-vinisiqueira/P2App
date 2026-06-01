"""Seed a local demo database with deterministic P2App portfolio data.

Run after `alembic upgrade head`. Passwords are local demo defaults and can be
overridden with P2APP_DEMO_PASSWORD.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

from sqlalchemy.orm import Session

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from app.crud.ticket import create_ticket, get_ticket_by_id, update_ticket
from app.crud.ticket_event import create_ticket_event, list_ticket_events
from app.crud.user import criar_usuario, obter_usuario_por_email
from app.database import SessionLocal
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.ticket import TicketCreate, TicketUpdate
from app.schemas.user import UserCreate

DEMO_PASSWORD = os.getenv("P2APP_DEMO_PASSWORD", "P2AppDemo123!")

DEMO_USERS = [
    ("Cliente Demo", "cliente.demo@example.com", "cliente"),
    ("Tecnico Demo", "tecnico.demo@example.com", "tecnico"),
    ("Gerente Demo", "gerente.demo@example.com", "gerente"),
    ("Admin Demo", "admin.demo@example.com", "admin"),
]


def ensure_user(db: Session, *, nome: str, email: str, tipo_usuario: str) -> User:
    user = obter_usuario_por_email(db, email)
    if user:
        return user

    created = criar_usuario(
        db,
        UserCreate(
            nome=nome,
            email=email,
            senha=DEMO_PASSWORD,
            tipo_usuario=tipo_usuario,  # type: ignore[arg-type]
        ),
    )
    if created is None:
        raise RuntimeError(f"Nao foi possivel criar usuario demo {email}")
    return created


def find_ticket_by_title(db: Session, *, title: str, owner_id: int) -> Ticket | None:
    return (
        db.query(Ticket)
        .filter(Ticket.title == title, Ticket.owner_id == owner_id)
        .first()
    )


def ensure_ticket(
    db: Session,
    *,
    owner: User,
    title: str,
    description: str,
    priority: str,
    category: str,
    assigned_to: User | None = None,
    status: str = "open",
) -> Ticket:
    ticket = find_ticket_by_title(db, title=title, owner_id=owner.id)
    if ticket is None:
        ticket = create_ticket(
            db,
            TicketCreate(
                title=title,
                description=description,
                priority=priority,  # type: ignore[arg-type]
                category=category,
                assigned_to_id=assigned_to.id if assigned_to else None,
            ),
            owner_id=owner.id,
        )
        create_ticket_event(
            db,
            ticket_id=ticket.id,
            actor_id=owner.id,
            event_type="comment",
            message="Chamado aberto.",
        )

    if ticket.status != status or ticket.assigned_to_id != (assigned_to.id if assigned_to else None):
        previous_status = ticket.status
        previous_assigned_to_id = ticket.assigned_to_id
        ticket = update_ticket(
            db,
            ticket,
            TicketUpdate(
                status=status,  # type: ignore[arg-type]
                assigned_to_id=assigned_to.id if assigned_to else None,
            ),
        )
        if previous_status != ticket.status:
            create_ticket_event(
                db,
                ticket_id=ticket.id,
                actor_id=assigned_to.id if assigned_to else owner.id,
                event_type="status_changed",
                message="Status atualizado para demonstracao.",
                old_value=previous_status,
                new_value=ticket.status,
            )
        if previous_assigned_to_id != ticket.assigned_to_id:
            create_ticket_event(
                db,
                ticket_id=ticket.id,
                actor_id=assigned_to.id if assigned_to else owner.id,
                event_type="assignment_changed",
                message="Responsavel atribuido para demonstracao.",
                old_value=str(previous_assigned_to_id) if previous_assigned_to_id else None,
                new_value=str(ticket.assigned_to_id) if ticket.assigned_to_id else None,
            )

    if len(list_ticket_events(db, ticket_id=ticket.id)) == 1:
        create_ticket_event(
            db,
            ticket_id=ticket.id,
            actor_id=assigned_to.id if assigned_to else owner.id,
            event_type="comment",
            message="Ambiente demo preparado para apresentacao tecnica.",
        )

    refreshed = get_ticket_by_id(db, ticket.id)
    if refreshed is None:
        raise RuntimeError("Chamado demo desapareceu durante o seed")
    return refreshed


def main() -> None:
    db = SessionLocal()
    try:
        users = {
            email: ensure_user(db, nome=nome, email=email, tipo_usuario=tipo_usuario)
            for nome, email, tipo_usuario in DEMO_USERS
        }
        cliente = users["cliente.demo@example.com"]
        tecnico = users["tecnico.demo@example.com"]

        ensure_ticket(
            db,
            owner=cliente,
            title="Notebook sem acesso a VPN",
            description="Usuario consegue navegar, mas nao conecta na VPN corporativa.",
            priority="critical",
            category="infra",
            assigned_to=tecnico,
            status="in_progress",
        )
        ensure_ticket(
            db,
            owner=cliente,
            title="Impressora do financeiro sem toner",
            description="Fila de impressao parada no fechamento mensal.",
            priority="high",
            category="suprimentos",
            assigned_to=tecnico,
            status="open",
        )
        ensure_ticket(
            db,
            owner=cliente,
            title="Acesso ao sistema de chamados",
            description="Cliente precisa confirmar se o portal esta registrando historico corretamente.",
            priority="medium",
            category="acesso",
            status="resolved",
        )
    finally:
        db.close()

    print("Demo seed concluido.")
    print("Usuarios demo:")
    for _, email, tipo_usuario in DEMO_USERS:
        print(f"- {tipo_usuario}: {email} / {DEMO_PASSWORD}")


if __name__ == "__main__":
    main()
