from fastapi.testclient import TestClient


def test_criacao_de_usuario(client: TestClient) -> None:
    response = client.post(
        "/users/",
        json={
            "nome": "Novo Cliente",
            "email": "novo@example.com",
            "senha": "12345678",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["nome"] == "Novo Cliente"
    assert data["email"] == "novo@example.com"
    assert data["tipo_usuario"] == "cliente"


def test_busca_usuario_autenticado(client: TestClient, regular_user, regular_auth_headers) -> None:
    response = client.get("/auth/me", headers=regular_auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == regular_user.id
    assert data["email"] == regular_user.email
    assert data["role"] == "user"


def test_email_duplicado_retorna_conflito(client: TestClient, regular_user) -> None:
    response = client.post(
        "/users/",
        json={
            "nome": "Usuario Duplicado",
            "email": regular_user.email,
            "senha": "12345678",
        },
    )

    assert response.status_code == 409


def test_senha_curta_retorna_validacao(client: TestClient) -> None:
    response = client.post(
        "/users/",
        json={
            "nome": "Cliente",
            "email": "senha-curta@example.com",
            "senha": "123",
        },
    )

    assert response.status_code == 422


def test_usuario_comum_nao_lista_usuarios(client: TestClient, regular_auth_headers) -> None:
    response = client.get("/users/", headers=regular_auth_headers)

    assert response.status_code == 403


def test_admin_lista_usuarios(client: TestClient, admin_user, admin_auth_headers) -> None:
    response = client.get("/users/", headers=admin_auth_headers)

    assert response.status_code == 200
    assert [user["email"] for user in response.json()] == [admin_user.email]
