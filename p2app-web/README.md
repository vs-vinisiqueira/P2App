# P2App Web

Frontend em Next.js para o backend P2App, uma API FastAPI de gestao de chamados tecnicos.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- Axios
- TanStack Query
- Lucide React
- Sonner

## Configuracao

```bash
npm install
cp .env.example .env.local
```

No Windows PowerShell:

```powershell
npm install
copy .env.example .env.local
```

Configure:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8001
```

## Rodando

Com o backend P2App ativo em `http://127.0.0.1:8001`:

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

Para uma demo local completa, rode no backend:

```powershell
venv\Scripts\python.exe -m alembic upgrade head
venv\Scripts\python.exe scripts\seed_demo.py
```

Use `NEXT_PUBLIC_API_URL=http://127.0.0.1:8001` no `.env.local`.

## Rotas principais

| Rota | Descricao |
| --- | --- |
| `/` | Landing page institucional do P2App. |
| `/login` | Login com JWT via `POST /auth/login`. |
| `/register` | Cadastro publico via `POST /users/`. |
| `/dashboard` | Resumo calculado a partir de `GET /tickets`. |
| `/chamados` | Lista de tickets do endpoint `GET /tickets`. |
| `/chamados/novo` | Criacao via `POST /tickets`. |
| `/chamados/[id]` | Detalhe, edicao, historico, comentarios e exclusao via `/tickets/{ticket_id}`. |
| `/usuarios` | Listagem administrativa via `GET /users/`. |

## Integracao com backend

O token JWT e armazenado inicialmente em `localStorage` e enviado pelo interceptor Axios:

```http
Authorization: Bearer <token>
```

O codigo foi organizado para facilitar uma migracao futura para cookies HTTP-only.

A guarda de autenticacao reage a login, logout, `401`, mudancas em `localStorage` e sincronizacao entre abas, evitando redirect antes da hidratacao.

## Observacoes

- O backend nao possui endpoint especifico de estatisticas; o dashboard calcula os numeros a partir de `GET /tickets`.
- A tela de usuarios depende de `GET /users/`, que exige `role="admin"` no backend.
- Usuarios comuns nao podem alterar `status` nem `assigned_to_id` em `/tickets`.

## Proximos passos

- Migrar autenticacao para cookies HTTP-only.
- Adicionar testes de componentes e fluxos.
- Melhorar permissoes visuais com base em claims de token ou sessao server-side.
- Adicionar paginacao/filtros server-side caso o backend evolua.
