# P2App Backend

API backend em FastAPI para gestao de atendimentos tecnicos e chamados. O projeto implementa autenticacao JWT, controle de acesso por perfil, persistencia em PostgreSQL com SQLAlchemy e Alembic, e uma organizacao modular pensada para manutencao e expansao.

## Status do projeto

O P2App e um projeto de portfolio backend em evolucao. A aplicacao ja possui cadastro publico de usuarios clientes, login com JWT, rotas protegidas, controle de acesso administrativo, modulo de tickets/chamados, migrations com Alembic, testes automatizados com Pytest e configuracao Docker para API com PostgreSQL.

## Funcionalidades

- Cadastro publico de usuarios clientes.
- Login com JWT usando email e senha.
- Protecao de rotas autenticadas com token Bearer.
- Controle de acesso por `role` e `tipo_usuario`.
- Consulta do usuario autenticado em `/auth/me`.
- Listagem administrativa de usuarios em `/users/`.
- Criacao, listagem, consulta, atualizacao e exclusao de tickets em `/tickets`.
- Rotas legadas/compatibilidade em portugues para chamados em `/chamados`.
- Hash de senha com Passlib/bcrypt.
- Persistencia com SQLAlchemy ORM.
- Migrations versionadas com Alembic.
- Configuracao via variaveis de ambiente.
- Testes automatizados com Pytest usando banco SQLite em memoria.
- Dockerfile e Docker Compose para executar API e PostgreSQL.

## Tecnologias utilizadas

| Tecnologia | Uso no projeto |
| --- | --- |
| Python | Linguagem principal da API |
| FastAPI | Framework web e documentacao OpenAPI |
| PostgreSQL | Banco de dados principal configurado por `DATABASE_URL` |
| SQLAlchemy | ORM e conexao com banco |
| Alembic | Controle de migrations |
| Pydantic | Validacao e serializacao de dados |
| PyJWT | Criacao e validacao de tokens JWT |
| Passlib/bcrypt | Hash e verificacao de senhas |
| Uvicorn | Servidor ASGI para execucao local |
| Pytest | Testes automatizados |
| python-dotenv | Carregamento de variaveis do arquivo `.env` |

## Arquitetura do projeto

```text
P2App/
├── app/
│   ├── core/
│   ├── crud/
│   ├── models/
│   ├── routes/
│   ├── schemas/
│   ├── api_deps.py
│   ├── database.py
│   └── main.py
├── alembic/
│   └── versions/
├── docs/
├── scripts/
├── tests/
├── .dockerignore
├── .env.example
├── alembic.ini
├── docker-compose.yml
├── Dockerfile
├── pytest.ini
├── requirements.txt
└── README.md
```

| Caminho | Responsabilidade |
| --- | --- |
| `app/main.py` | Cria a aplicacao FastAPI e registra os routers de `auth`, `chamado`, `ticket` e `user`. |
| `app/database.py` | Configura engine, sessao SQLAlchemy e dependencia `get_db`. |
| `app/api_deps.py` | Reexporta dependencias de autenticacao para compatibilidade/importacao centralizada. |
| `app/core/` | Seguranca JWT, hash de senha, dependencia de usuario autenticado e regras de autorizacao. |
| `app/crud/` | Operacoes de persistencia para usuarios e tickets. |
| `app/models/` | Models SQLAlchemy `User`, `Ticket` e alias `Chamado`. |
| `app/routes/` | Endpoints HTTP da API. |
| `app/schemas/` | Schemas Pydantic de entrada e resposta. |
| `alembic/` | Ambiente e historico de migrations do banco. |
| `docs/` | Anotacoes de arquitetura, decisoes tecnicas e tarefas do projeto. |
| `tests/` | Testes automatizados de autenticacao, usuarios e tickets. |
| `scripts/` | Script de entrypoint Docker para aguardar o banco antes de iniciar a API. |

## Pre-requisitos

- Git.
- Python compativel com o projeto. O Dockerfile usa `python:3.14-slim`.
- PostgreSQL instalado e rodando, caso execute sem Docker.
- Ambiente virtual Python recomendado.
- Docker e Docker Compose, caso prefira executar por containers.

## Configuracao do ambiente

### Windows PowerShell

```powershell
git clone https://github.com/vs-vinisiqueira/P2App.git
cd P2App
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

### Linux/macOS

```bash
git clone https://github.com/vs-vinisiqueira/P2App.git
cd P2App
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Depois de copiar o `.env.example`, ajuste `DATABASE_URL`, `POSTGRES_PASSWORD` e `JWT_SECRET_KEY` conforme seu ambiente local.

## Variaveis de ambiente

| Variavel | Descricao |
| --- | --- |
| `POSTGRES_DB` | Nome do banco usado pelo Docker Compose. |
| `POSTGRES_USER` | Usuario do PostgreSQL usado pelo Docker Compose. |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL usada pelo Docker Compose. |
| `DATABASE_URL` | URL de conexao SQLAlchemy usada pela aplicacao e pelo Alembic. |
| `JWT_SECRET_KEY` | Chave secreta usada para assinar tokens JWT. |
| `JWT_ALGORITHM` | Algoritmo JWT. O exemplo usa `HS256`. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Tempo de expiracao do token em minutos. |
| `DB_WAIT_TIMEOUT` | Tempo maximo, em segundos, para o entrypoint Docker aguardar o banco. |

Nunca suba um `.env` real para o GitHub. Troque `JWT_SECRET_KEY` e `POSTGRES_PASSWORD` em qualquer ambiente que nao seja local.

Exemplo seguro:

```env
POSTGRES_DB=p2app
POSTGRES_USER=p2app
POSTGRES_PASSWORD=troque-esta-senha
DATABASE_URL=postgresql://p2app:troque-esta-senha@localhost:5432/p2app
JWT_SECRET_KEY=troque-esta-chave-em-producao
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DB_WAIT_TIMEOUT=30
```

## Banco de dados e migrations

O projeto usa Alembic para versionar o schema do banco. Com o `.env` configurado e o PostgreSQL acessivel, aplique as migrations:

```bash
alembic upgrade head
```

Para criar uma nova migration durante evolucao do projeto:

```bash
alembic revision --autogenerate -m "descricao_da_migration"
```

Esse comando cria um novo arquivo de migration. Para rodar o projeto inicialmente, use apenas `alembic upgrade head`.

## Executando a API

```bash
uvicorn app.main:app --reload
```

URLs locais:

```text
API: http://localhost:8000
Swagger UI: http://localhost:8000/docs
ReDoc: http://localhost:8000/redoc
```

## Executando com Docker

O repositorio possui `Dockerfile` e `docker-compose.yml` com dois servicos: `api` e `db`. O PostgreSQL usa volume persistente chamado `postgres_data`.

Subir os containers:

```bash
docker compose up --build
```

Rodar migrations dentro do container:

```bash
docker compose run --rm api alembic upgrade head
```

Derrubar os containers:

```bash
docker compose down
```

Remover containers e volume do banco:

```bash
docker compose down -v
```

## Deploy profissional em servidor local

Para instalacao em uma empresa ou VM local, use os artefatos de producao:

- `docker-compose.prod.yml`: stack com PostgreSQL, API, frontend Next.js e Nginx.
- `.env.production.example`: modelo de variaveis para producao.
- `deploy/nginx/p2app.conf`: proxy HTTP unico para frontend e API em `/api`.
- `scripts/create_admin.py`: criacao ou atualizacao do admin inicial.
- `scripts/backup_postgres.sh` e `scripts/restore_postgres.sh`: rotina operacional de backup e restore.

Fluxo resumido no servidor:

```bash
cp .env.production.example .env.production
# edite .env.production com senhas fortes e dominio/IP real
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
docker compose -f docker-compose.prod.yml --env-file .env.production exec api python scripts/create_admin.py
```

Runbook completo:

```text
docs/deploy-servidor-local.md
```

## Testes automatizados

A suite Pytest esta organizada em `tests/test_auth.py`, `tests/test_users.py` e `tests/test_tickets.py`. Os testes substituem a dependencia de banco da API e usam SQLite em memoria.

```bash
pytest
```

## Ambiente demo local

Para validar o fluxo completo de portfolio, use banco migrado e dados previsiveis:

```powershell
$env:DATABASE_URL="postgresql://p2app:troque-esta-senha@localhost:5432/p2app"
$env:JWT_SECRET_KEY="troque-esta-chave-local"
venv\Scripts\python.exe -m alembic upgrade head
venv\Scripts\python.exe scripts\seed_demo.py
venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

O seed cria usuarios locais de demonstracao com a senha padrao `P2AppDemo123!`:

| Perfil | E-mail |
| --- | --- |
| Cliente | `cliente.demo@example.com` |
| Tecnico | `tecnico.demo@example.com` |
| Gerente | `gerente.demo@example.com` |
| Admin | `admin.demo@example.com` |

Para trocar a senha do seed sem alterar codigo:

```powershell
$env:P2APP_DEMO_PASSWORD="uma-senha-local"
venv\Scripts\python.exe scripts\seed_demo.py
```

Depois, rode o frontend com `NEXT_PUBLIC_API_URL=http://127.0.0.1:8001` e acesse `http://127.0.0.1:3000`.

Screenshot da demo:

![Dashboard demo](docs/screenshots/p2app-dashboard-demo.png)

## Endpoints principais

| Metodo | Rota | Autenticacao | Perfil necessario | Descricao |
| --- | --- | --- | --- | --- |
| `GET` | `/` | Nao | Publico | Health check simples da API. |
| `POST` | `/users/` | Nao | Publico | Cadastra um usuario publico sempre como cliente. |
| `GET` | `/users/` | Sim | `role="admin"` | Lista usuarios cadastrados. |
| `POST` | `/auth/login` | Nao | Publico | Autentica usuario e retorna token JWT. |
| `GET` | `/auth/me` | Sim | Usuario autenticado | Retorna os dados do usuario autenticado. |
| `POST` | `/tickets` | Sim | Usuario autenticado | Cria ticket para o usuario autenticado. `assigned_to_id` so pode ser definido por suporte/admin. |
| `GET` | `/tickets` | Sim | Usuario autenticado | Lista tickets. Suporte/admin ve todos; demais usuarios veem apenas os proprios. |
| `GET` | `/tickets/{ticket_id}` | Sim | Dono do ticket ou suporte/admin | Consulta um ticket por ID. |
| `PATCH` | `/tickets/{ticket_id}` | Sim | Dono do ticket ou suporte/admin | Atualiza dados do ticket. Somente suporte/admin altera `status` e `assigned_to_id`. |
| `DELETE` | `/tickets/{ticket_id}` | Sim | Dono do ticket ou suporte/admin | Remove um ticket. |
| `POST` | `/chamados/` | Sim | `tipo_usuario="cliente"` | Cria chamado usando payload em portugues. |
| `GET` | `/chamados/` | Sim | Admin ou cliente | Admin lista todos; cliente lista os proprios. |
| `GET` | `/chamados/{chamado_id}` | Sim | Admin ou cliente dono | Consulta chamado por ID usando resposta em portugues. |
| `PATCH` | `/chamados/{chamado_id}/status` | Sim | `role="admin"` | Atualiza status do chamado pela rota legada em portugues. |

## Exemplos de uso

### Cadastro de cliente

```http
POST /users/
Content-Type: application/json
```

Request:

```json
{
  "nome": "Cliente Teste",
  "email": "cliente@example.com",
  "senha": "12345678"
}
```

Response `201`:

```json
{
  "id": 1,
  "nome": "Cliente Teste",
  "email": "cliente@example.com",
  "tipo_usuario": "cliente",
  "role": "user"
}
```

### Login

```http
POST /auth/login
Content-Type: application/json
```

Request:

```json
{
  "email": "cliente@example.com",
  "senha": "12345678"
}
```

Response `200`:

```json
{
  "access_token": "SEU_TOKEN_JWT",
  "token_type": "bearer"
}
```

O endpoint tambem aceita `application/x-www-form-urlencoded` com `username` e `password`, formato usado pelo fluxo OAuth2 do Swagger.

### Uso do token JWT

```http
Authorization: Bearer SEU_TOKEN_AQUI
```

### Criacao de ticket

```http
POST /tickets
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json
```

Request:

```json
{
  "title": "Notebook sem rede",
  "description": "Usuario nao consegue acessar a internet",
  "priority": "high",
  "category": "infra"
}
```

Response `201`:

```json
{
  "id": 1,
  "title": "Notebook sem rede",
  "description": "Usuario nao consegue acessar a internet",
  "status": "open",
  "priority": "high",
  "category": "infra",
  "owner_id": 1,
  "assigned_to_id": null,
  "created_at": "2026-05-29T14:00:00Z",
  "updated_at": "2026-05-29T14:00:00Z"
}
```

### Criacao de chamado pela rota legada

```http
POST /chamados/
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json
```

Request:

```json
{
  "titulo": "Impressora sem papel",
  "descricao": "Setor financeiro precisa de reposicao",
  "prioridade": "media"
}
```

## Modelos principais

### User

Entidade persistida na tabela `users`.

| Campo | Descricao |
| --- | --- |
| `id` | Identificador numerico. |
| `nome` | Nome do usuario, de 2 a 120 caracteres nos schemas. |
| `email` | Email unico, normalizado para minusculas nos schemas. |
| `senha` | Hash da senha armazenado no banco. Nao e exposto nas respostas. |
| `tipo_usuario` | Perfil de negocio: `admin`, `gerente`, `tecnico` ou `cliente`. |
| `role` | Permissao de acesso: `admin` ou `user`. |

### Ticket/Chamado

Entidade interna `Ticket`, persistida na tabela `chamados`. O alias `Chamado` aponta para o mesmo model.

| Campo | Descricao |
| --- | --- |
| `id` | Identificador numerico. |
| `title` | Titulo do ticket, de 2 a 150 caracteres. |
| `description` | Descricao do atendimento. |
| `status` | `open`, `in_progress`, `resolved` ou `closed`. |
| `priority` | `low`, `medium`, `high` ou `critical`. |
| `category` | Categoria opcional, de 2 a 80 caracteres quando informada. |
| `owner_id` | Usuario dono do ticket. |
| `assigned_to_id` | Usuario responsavel pelo atendimento, opcional. |
| `created_at` | Data de criacao. |
| `updated_at` | Data da ultima atualizacao. |

As rotas `/chamados` traduzem valores em portugues para os valores internos do ticket, por exemplo `aberto` para `open` e `alta` para `high`.

## Controle de acesso

- Usuarios criados pelo endpoint publico `POST /users/` sempre recebem `tipo_usuario="cliente"` e `role="user"`.
- `tipo_usuario` representa o perfil de negocio: `admin`, `gerente`, `tecnico` ou `cliente`.
- `role` representa permissao de acesso ampla: `admin` ou `user`.
- `GET /users/` exige `role="admin"`.
- Em `/tickets`, suporte e administracao sao definidos por `role="admin"` ou `tipo_usuario` igual a `gerente` ou `tecnico`.
- Em `/tickets`, usuarios comuns acessam apenas tickets proprios.
- Em `/tickets`, somente suporte/admin pode alterar `status` e `assigned_to_id`.
- Em `/chamados`, a regra legada permite criacao apenas por clientes e atualizacao de status apenas por admin.

## Tratamento de erros

| Status | Quando ocorre |
| --- | --- |
| `401 Unauthorized` | Token ausente/invalido ou login com credenciais invalidas. |
| `403 Forbidden` | Usuario autenticado sem permissao para a acao solicitada. |
| `404 Not Found` | Ticket/chamado nao encontrado. |
| `409 Conflict` | Tentativa de cadastrar email ja existente. |
| `422 Unprocessable Entity` | Payload invalido segundo os schemas Pydantic. |

## Qualidade tecnica

- Arquitetura modular com separacao entre rotas, schemas, models e CRUD.
- SQLAlchemy ORM para modelagem e persistencia.
- Alembic para evolucao versionada do banco.
- Pydantic para validacao de entrada e formato de resposta.
- Hash de senha com Passlib/bcrypt.
- Autenticacao JWT com expiracao configuravel.
- Configuracao via variaveis de ambiente.
- Testes automatizados cobrindo autenticacao, usuarios e tickets.
- Docker Compose com servico de API, PostgreSQL, healthcheck e volume persistente.
- Documentacao tecnica adicional em `docs/`, com notas de arquitetura, seguranca, autorizacao e decisoes de implementacao.

## Proximos passos

- Melhorar a documentacao Swagger com descricoes mais detalhadas por endpoint.
- Preparar deploy em ambiente de nuvem.
- Adicionar prints do Swagger ou exemplos visuais ao README.
- Aumentar cobertura de testes.
- Padronizar responses e payloads de erro.
- Evoluir filtros, paginacao e busca dos tickets.

## Observacoes tecnicas

- A entidade interna atual e `Ticket`, mas a tabela no banco permanece `chamados` por historico de evolucao do projeto.
- As rotas `/tickets` e `/chamados` convivem no `app/main.py`; `/chamados` funciona como camada de compatibilidade em portugues e possui regras de permissao mais restritas.
- O cadastro publico nao cria usuarios admin. Para usar rotas administrativas em um ambiente novo, ainda e necessario criar um usuario admin por um processo externo ao endpoint publico.
- As migrations antigas criam chamados com campos em portugues e a migration mais recente migra para o modelo interno de tickets em ingles. Em bancos novos, rode sempre `alembic upgrade head`.

## Licenca

Este projeto ainda nao possui uma licenca definida.
