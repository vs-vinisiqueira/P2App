from fastapi.testclient import TestClient


def test_criar_e_obter_chamado_legado(client: TestClient, regular_auth_headers) -> None:
    response = client.post(
        "/chamados/",
        headers=regular_auth_headers,
        json={
            "titulo": "Impressora sem conexao",
            "descricao": "Nao imprime documentos da recepcao",
            "prioridade": "alta",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["titulo"] == "Impressora sem conexao"
    assert data["status"] == "aberto"
    assert data["prioridade"] == "alta"

    chamado_id = data["id"]
    get_res = client.get(f"/chamados/{chamado_id}", headers=regular_auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["titulo"] == "Impressora sem conexao"


def test_admin_atualiza_status_chamado_legado(
    client: TestClient,
    regular_auth_headers,
    admin_auth_headers,
) -> None:
    create_res = client.post(
        "/chamados/",
        headers=regular_auth_headers,
        json={
            "titulo": "Problema de rede legado",
            "descricao": "Queda intermitente",
            "prioridade": "media",
        },
    )
    assert create_res.status_code == 201
    chamado_id = create_res.json()["id"]

    patch_res = client.patch(
        f"/chamados/{chamado_id}/status",
        headers=admin_auth_headers,
        json={"status": "concluido"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "concluido"
