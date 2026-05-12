# P2App V2

API em desenvolvimento para gerenciamento de chamados técnicos.

Este projeto está sendo recriado do zero com foco em aprendizado real de backend, utilizando FastAPI e boas práticas de organização, autenticação e persistência de dados.

## Objetivo

Construir uma API REST onde:

- clientes possam abrir chamados;
- técnicos possam visualizar e atualizar chamados;
- administradores possam gerenciar usuários e chamados.

## Tecnologias planejadas

- Python
- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- JWT
- Pytest

## Status atual

Projeto reiniciado na branch `rebuild-v2`.

Funcionalidades atuais:

- aplicação FastAPI mínima;
- rota inicial `GET /`;
- documentação automática via Swagger em `/docs`.

## Como rodar

Crie e ative o ambiente virtual:

```bash
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
http://127.0.0.1:8000
http://127.0.0.1:8000/docs