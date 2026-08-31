from fastapi.testclient import TestClient


def _create_ticket(client: TestClient, headers: dict[str, str]) -> dict:
    response = client.post(
        "/tickets",
        headers=headers,
        json={
            "title": "Computador travando",
            "description": "Tela azul constante",
            "priority": "high",
            "category": "hardware",
        },
    )
    assert response.status_code == 201
    return response.json()


def test_tecnico_cria_e_lista_atendimento(
    client: TestClient,
    regular_auth_headers,
    tecnico_auth_headers,
) -> None:
    ticket = _create_ticket(client, regular_auth_headers)
    ticket_id = ticket["id"]

    # Técnico inicia atendimento
    response = client.post(
        f"/tickets/{ticket_id}/atendimentos",
        headers=tecnico_auth_headers,
        json={
            "descricao": "Iniciando diagnóstico de hardware e testes de memória.",
            "status": "em_andamento",
        },
    )
    assert response.status_code == 201
    atendimento = response.json()
    assert atendimento["ticket_id"] == ticket_id
    assert atendimento["status"] == "em_andamento"
    assert "tecnico" in atendimento
    assert atendimento["descricao"] == "Iniciando diagnóstico de hardware e testes de memória."

    # Listagem de atendimentos pelo técnico
    list_res = client.get(
        f"/tickets/{ticket_id}/atendimentos",
        headers=tecnico_auth_headers,
    )
    assert list_res.status_code == 200
    atendimentos = list_res.json()
    assert len(atendimentos) == 1
    assert atendimentos[0]["id"] == atendimento["id"]


def test_cliente_visualiza_atendimentos_do_seu_chamado(
    client: TestClient,
    regular_auth_headers,
    tecnico_auth_headers,
) -> None:
    ticket = _create_ticket(client, regular_auth_headers)
    ticket_id = ticket["id"]

    # Técnico cria atendimento
    client.post(
        f"/tickets/{ticket_id}/atendimentos",
        headers=tecnico_auth_headers,
        json={"descricao": "Análise técnica em progresso."},
    )

    # Cliente consulta os atendimentos do seu chamado
    list_res = client.get(
        f"/tickets/{ticket_id}/atendimentos",
        headers=regular_auth_headers,
    )
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1


def test_cliente_bloqueado_de_criar_atendimento(
    client: TestClient,
    regular_auth_headers,
) -> None:
    ticket = _create_ticket(client, regular_auth_headers)
    ticket_id = ticket["id"]

    response = client.post(
        f"/tickets/{ticket_id}/atendimentos",
        headers=regular_auth_headers,
        json={"descricao": "Tentativa indevida do cliente registrar atendimento."},
    )
    assert response.status_code == 403


def test_tecnico_conclui_atendimento(
    client: TestClient,
    regular_auth_headers,
    tecnico_auth_headers,
) -> None:
    ticket = _create_ticket(client, regular_auth_headers)
    ticket_id = ticket["id"]

    create_res = client.post(
        f"/tickets/{ticket_id}/atendimentos",
        headers=tecnico_auth_headers,
        json={"descricao": "Troca de pente de memória RAM."},
    )
    atendimento_id = create_res.json()["id"]

    # Atualiza para concluído
    patch_res = client.patch(
        f"/tickets/{ticket_id}/atendimentos/{atendimento_id}",
        headers=tecnico_auth_headers,
        json={"status": "concluido", "descricao": "Troca de memória RAM concluída com sucesso."},
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["status"] == "concluido"
    assert updated["data_fim"] is not None

    # Verifica se gerou evento na timeline do ticket
    events_res = client.get(f"/tickets/{ticket_id}/events", headers=tecnico_auth_headers)
    assert events_res.status_code == 200
    events = events_res.json()
    messages = [e["message"] for e in events]
    assert any("concluído" in m or "concluido" in m for m in messages if m)
