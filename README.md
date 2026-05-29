# P2App Backend

API backend desenvolvida com FastAPI para gerenciamento de usuários, autenticação e chamados, com arquitetura modular e preparada para expansão futura.

## 📌 Sobre o projeto

O P2App é um sistema backend voltado para gestão de usuários e autenticação, com foco em escalabilidade, organização de código e boas práticas de desenvolvimento.

Atualmente o sistema possui:

- Cadastro de usuários
- Autenticação com JWT
- Controle de acesso por tipo de usuário
- Gerenciamento inicial de chamados
- Estrutura organizada para crescimento do projeto

## 🚀 Tecnologias utilizadas

- Python
- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- Pydantic
- JWT (JSON Web Token)
- Passlib (hash de senha)

## 📂 Estrutura do projeto

```bash
app/
 core/        # Configurações, segurança e autorização
 routes/      # Rotas da API
 schemas/     # Validação de dados (Pydantic)
 crud/        # Operações com banco de dados
 models/      # Modelos do banco (SQLAlchemy)
 database.py  # Conexão com o banco
 main.py      # Entrada da aplicação
```

## ⚙️ Configuração do ambiente

Crie e ative um ambiente virtual:

```powershell
python -m venv venv
```

Instale as dependências:

```powershell
venv\Scripts\python.exe -m pip install -r requirements.txt
```

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`.

Exemplo:

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/p2app
JWT_SECRET_KEY=troque-esta-chave-em-producao
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## 🗄️ Banco de dados

O projeto utiliza PostgreSQL com SQLAlchemy e Alembic para controle de migrations.

Para aplicar as migrations:

```powershell
venv\Scripts\python.exe -m alembic upgrade head
```

## ▶️ Como executar

Inicie a API com Uvicorn:

```powershell
venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

A API ficará disponível em:

```text
http://127.0.0.1:8000
```

## 🧪 Testes automatizados

Execute a suíte com:

```powershell
venv\Scripts\python.exe -m pytest
```

Os testes usam SQLite em memória e validam cadastro público, login, rota autenticada, permissões administrativas e escopo de chamados por cliente.

## 📖 Documentação interativa

Após iniciar o servidor, acesse o Swagger:

```text
http://127.0.0.1:8000/docs
```

Também é possível acessar a documentação ReDoc:

```text
http://127.0.0.1:8000/redoc
```

## 🔐 Autenticação

A autenticação é feita com JWT.

Fluxo básico:

1. Criar um usuário.
2. Fazer login em `/auth/login`.
3. Copiar o `access_token` retornado.
4. Clicar em `Authorize` no Swagger.
5. Informar o token para acessar rotas protegidas.

O token JWT utiliza o email do usuário como identificador no payload.

## 👥 Tipos de usuário e permissões

O sistema separa tipo de usuário e permissão:

- `tipo_usuario` representa o perfil de negócio.
- `role` representa permissão de acesso.

Tipos de usuário aceitos:

- `admin`
- `gerente`
- `tecnico`
- `cliente`

Roles aceitas:

- `admin`
- `user`

No cadastro público, novos usuários são sempre criados com `tipo_usuario="cliente"` e `role="user"`.

Perfis internos devem ser criados apenas por fluxos administrativos protegidos.

## 🔗 Endpoints principais

### Público

```http
GET /
```

Verifica se a API está rodando.

```http
POST /users/
```

Cria um novo usuário público com perfil `cliente`.

```http
POST /auth/login
```

Autentica um usuário e retorna um token JWT.

### Autenticado

```http
GET /auth/me
```

Retorna os dados do usuário autenticado.

### Módulo de chamados

O módulo de chamados está disponível pelas rotas `/tickets`, com criação, listagem, consulta, atualização e exclusão protegidas por JWT. Usuários comuns acessam apenas os próprios chamados; administradores, gerentes e técnicos podem visualizar e atualizar chamados de suporte.

### Administrador

```http
GET /users/
```

Lista usuários cadastrados. Requer usuário com perfil `admin`.

### Chamados

```http
POST /tickets
```

Cria chamado para o cliente autenticado.

```http
GET /tickets
```

Lista chamados. Admin, gerente e técnico veem todos; usuários comuns veem apenas os próprios.

```http
GET /tickets/{ticket_id}
```

Consulta um chamado por ID.

```http
PATCH /tickets/{ticket_id}
```

Atualiza um chamado. Usuários comuns não podem alterar status nem responsável.

```http
DELETE /tickets/{ticket_id}
```

Remove um chamado.

## 🧪 Como testar pelo Swagger

1. Acesse:

```text
http://127.0.0.1:8000/docs
```

2. Crie um usuário em `POST /users/`.

Exemplo:

```json
{
  "nome": "Usuario Teste",
  "email": "usuario@email.com",
  "senha": "12345678"
}
```

3. Faça login em `POST /auth/login`.

Exemplo:

```json
{
  "email": "usuario@email.com",
  "senha": "12345678"
}
```

4. Copie o `access_token` retornado.

5. Clique em `Authorize` no Swagger e informe as credenciais ou o token JWT.

6. Teste a rota protegida:

```http
GET /auth/me
```

## 🛡️ Segurança

- Senhas são armazenadas com hash usando Passlib.
- Tokens JWT possuem expiração configurável.
- Rotas protegidas exigem token Bearer válido.
- Rotas administrativas exigem `role="admin"`.
- Valores de `tipo_usuario`, `role`, `status` e `prioridade` são validados também no banco.
- Respostas públicas não expõem senha nem hash.

## 📌 Observações

- Configure `JWT_SECRET_KEY` no `.env` antes de executar o projeto.
- Execute as migrations antes de iniciar a API em um banco novo.
- O projeto está preparado para receber novos módulos e regras de negócio futuramente.
