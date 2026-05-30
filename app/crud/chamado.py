"""Compatibilidade para o nome legado `chamado`.

O CRUD canonico do dominio fica em `app.crud.ticket`; este modulo preserva
imports antigos em portugues sem duplicar regra de negocio.
"""

from app.crud.ticket import (
    count_tickets,
    create_ticket,
    delete_ticket,
    get_ticket_by_id,
    list_tickets,
    update_ticket,
)


criar_chamado = create_ticket
listar_todos_chamados = list_tickets
obter_chamado_por_id = get_ticket_by_id
atualizar_chamado = update_ticket
excluir_chamado = delete_ticket

__all__ = [
    "atualizar_chamado",
    "count_tickets",
    "criar_chamado",
    "excluir_chamado",
    "listar_todos_chamados",
    "obter_chamado_por_id",
]
