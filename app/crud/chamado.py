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
