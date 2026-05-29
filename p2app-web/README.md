# P2App Web

Frontend em Next.js para o backend P2App, uma API FastAPI de gestão de chamados técnicos.

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

## Configuração

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
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Rodando

Com o backend P2App ativo em `http://localhost:8000`:

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

## Rotas principais

| Rota | Descrição |
| --- | --- |
| `/` | Landing page institucional do P2App. |
| `/login` | Login com JWT via `POST /auth/login`. |
| `/register` | Cadastro público via `POST /users/`. |
| `/dashboard` | Resumo calculado a partir de `GET /tickets`. |
| `/chamados` | Lista de tickets do endpoint `GET /tickets`. |
| `/chamados/novo` | Criação via `POST /tickets`. |
| `/chamados/[id]` | Detalhe, edição e exclusão via `/tickets/{ticket_id}`. |
| `/usuarios` | Listagem administrativa via `GET /users/`. |

## Integração com backend

O token JWT é armazenado inicialmente em `localStorage` e enviado pelo interceptor Axios:

```http
Authorization: Bearer <token>
```

O código foi organizado para facilitar uma migração futura para cookies HTTP-only.

## Observações

- O backend não possui endpoint específico de estatísticas; o dashboard calcula os números a partir de `GET /tickets`.
- A tela de usuários depende de `GET /users/`, que exige `role="admin"` no backend.
- Usuários comuns não podem alterar `status` nem `assigned_to_id` em `/tickets`.

## Próximos passos

- Migrar autenticação para cookies HTTP-only.
- Adicionar testes de componentes e fluxos.
- Melhorar permissões visuais com base em claims de token ou sessão server-side.
- Adicionar paginação/filtros server-side caso o backend evolua.
