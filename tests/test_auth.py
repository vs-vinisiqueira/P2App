from fastapi.testclient import TestClient

from tests.conftest import auth_headers


def test_cadastro_de_usuario_publico(client: TestClient) -> None:
    response = client.post(
        "/users/",
        json={
            "nome": "Cliente Teste",
            "email": "cliente@example.com",
            "senha": "12345678",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "cliente@example.com"
    assert data["tipo_usuario"] == "cliente"
    assert data["role"] == "user"
    assert "senha" not in data


def test_login_com_sucesso(client: TestClient, regular_user) -> None:
    response = client.post(
        "/auth/login",
        json={"email": regular_user.email, "senha": "12345678"},
    )

    assert response.status_code == 200
    assert response.json()["token_type"] == "bearer"
    assert response.json()["access_token"]


def test_login_com_senha_invalida(client: TestClient, regular_user) -> None:
    response = client.post(
        "/auth/login",
        json={"email": regular_user.email, "senha": "senha-errada"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Email ou senha invalidos"


def test_acesso_a_rota_protegida_sem_token(client: TestClient) -> None:
    response = client.get("/auth/me")

    assert response.status_code == 401


def test_token_valido_acessa_rota_protegida(
    client: TestClient,
    regular_user,
    regular_token: str,
) -> None:
    response = client.get("/auth/me", headers=auth_headers(regular_token))

    assert response.status_code == 200
    assert response.json()["email"] == regular_user.email
