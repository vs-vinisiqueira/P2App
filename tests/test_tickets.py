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
