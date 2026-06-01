from fastapi.testclient import TestClient


def _create_ticket(
    client: TestClient,
    headers: dict[str, str],
    title: str = "Notebook sem rede",
) -> dict:
    response = client.post(
        "/tickets",
        headers=headers,
        json={
            "title": title,
            "description": "Usuario nao consegue acessar a internet",
            "priority": "high",
            "category": "infra",
        },
    )
    assert response.status_code == 201
    return response.json()


def test_criar_chamado_autenticado(client: TestClient, regular_user, regular_auth_headers) -> None:
    ticket = _create_ticket(client, regular_auth_headers)

    assert ticket["title"] == "Notebook sem rede"
    assert ticket["description"] == "Usuario nao consegue acessar a internet"
    assert ticket["status"] == "open"
    assert ticket["priority"] == "high"
    assert ticket["category"] == "infra"
    assert ticket["owner_id"] == regular_user.id


def test_listar_chamados_do_usuario(client: TestClient, regular_auth_headers) -> None:
    _create_ticket(client, regular_auth_headers, title="Primeiro chamado")
    _create_ticket(client, regular_auth_headers, title="Segundo chamado")

    response = client.get("/tickets", headers=regular_auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert {ticket["title"] for ticket in data["items"]} == {
        "Primeiro chamado",
        "Segundo chamado",
    }


def test_buscar_chamado_por_id(client: TestClient, regular_auth_headers) -> None:
    ticket = _create_ticket(client, regular_auth_headers)

    response = client.get(f"/tickets/{ticket['id']}", headers=regular_auth_headers)

    assert response.status_code == 200
    assert response.json()["id"] == ticket["id"]


def test_atualizar_dados_do_chamado(client: TestClient, regular_auth_headers) -> None:
    ticket = _create_ticket(client, regular_auth_headers)

    response = client.patch(
        f"/tickets/{ticket['id']}",
        headers=regular_auth_headers,
        json={
            "title": "Notebook sem acesso a VPN",
            "description": "Usuario consegue navegar, mas nao conecta na VPN",
            "priority": "critical",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Notebook sem acesso a VPN"
    assert data["description"] == "Usuario consegue navegar, mas nao conecta na VPN"
    assert data["priority"] == "critical"
    assert data["status"] == "open"


def test_admin_atualiza_status_do_chamado(
    client: TestClient,
    regular_auth_headers,
    admin_auth_headers,
) -> None:
    ticket = _create_ticket(client, regular_auth_headers)

    response = client.patch(
        f"/tickets/{ticket['id']}",
        headers=admin_auth_headers,
        json={"status": "in_progress"},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "in_progress"

    events_response = client.get(
        f"/tickets/{ticket['id']}/events",
        headers=admin_auth_headers,
    )

    assert events_response.status_code == 200
    events = events_response.json()
    assert [event["event_type"] for event in events] == ["comment", "status_changed"]
    assert events[-1]["old_value"] == "open"
    assert events[-1]["new_value"] == "in_progress"


def test_tecnico_lista_chamados_de_todos_os_usuarios(
    client: TestClient,
    regular_auth_headers,
    tecnico_auth_headers,
) -> None:
    _create_ticket(client, regular_auth_headers, title="Chamado visivel ao tecnico")

    response = client.get("/tickets", headers=tecnico_auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "Chamado visivel ao tecnico"


def test_gerente_atualiza_status_e_responsavel_do_chamado(
    client: TestClient,
    regular_auth_headers,
    gerente_auth_headers,
    tecnico_user,
) -> None:
    ticket = _create_ticket(client, regular_auth_headers)

    response = client.patch(
        f"/tickets/{ticket['id']}",
        headers=gerente_auth_headers,
        json={
            "status": "in_progress",
            "assigned_to_id": tecnico_user.id,
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "in_progress"
    assert data["assigned_to_id"] == tecnico_user.id

    events_response = client.get(
        f"/tickets/{ticket['id']}/events",
        headers=gerente_auth_headers,
    )

    assert events_response.status_code == 200
    assert [event["event_type"] for event in events_response.json()] == [
        "comment",
        "status_changed",
        "assignment_changed",
    ]


def test_usuario_comum_nao_define_responsavel_ao_criar_chamado(
    client: TestClient,
    regular_auth_headers,
    tecnico_user,
) -> None:
    response = client.post(
        "/tickets",
        headers=regular_auth_headers,
        json={
            "title": "Tentativa com responsavel",
            "description": "Cliente nao pode direcionar responsavel na abertura.",
            "priority": "medium",
            "assigned_to_id": tecnico_user.id,
        },
    )

    assert response.status_code == 403


def test_usuario_comum_nao_atualiza_status_do_chamado(
    client: TestClient,
    regular_auth_headers,
) -> None:
    ticket = _create_ticket(client, regular_auth_headers)

    response = client.patch(
        f"/tickets/{ticket['id']}",
        headers=regular_auth_headers,
        json={"status": "closed"},
    )

    assert response.status_code == 403


def test_impedir_acesso_a_chamados_sem_token(client: TestClient) -> None:
    response = client.get("/tickets")

    assert response.status_code == 401


def test_comentar_e_listar_historico_do_chamado(client: TestClient, regular_auth_headers) -> None:
    ticket = _create_ticket(client, regular_auth_headers)

    comment_response = client.post(
        f"/tickets/{ticket['id']}/events",
        headers=regular_auth_headers,
        json={"message": "Cliente anexou evidencias e confirmou impacto."},
    )

    assert comment_response.status_code == 201
    comment = comment_response.json()
    assert comment["event_type"] == "comment"
    assert comment["message"] == "Cliente anexou evidencias e confirmou impacto."

    events_response = client.get(
        f"/tickets/{ticket['id']}/events",
        headers=regular_auth_headers,
    )

    assert events_response.status_code == 200
    events = events_response.json()
    assert [event["event_type"] for event in events] == ["comment", "comment"]
    assert events[0]["message"] == "Chamado aberto."
    assert events[1]["message"] == "Cliente anexou evidencias e confirmou impacto."


def test_usuario_nao_comenta_chamado_de_terceiro(client: TestClient, regular_auth_headers) -> None:
    ticket = _create_ticket(client, regular_auth_headers)

    user_response = client.post(
        "/users/",
        json={
            "nome": "Outro Cliente",
            "email": "outro@example.com",
            "senha": "12345678",
            "tipo_usuario": "cliente",
        },
    )
    assert user_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={"email": "outro@example.com", "senha": "12345678"},
    )
    assert login_response.status_code == 200
    other_headers = {"Authorization": f"Bearer {login_response.json()['access_token']}"}

    response = client.post(
        f"/tickets/{ticket['id']}/events",
        headers=other_headers,
        json={"message": "Tentativa indevida."},
    )

    assert response.status_code == 403
