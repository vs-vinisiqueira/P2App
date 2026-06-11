# Deploy profissional em servidor local

Este runbook descreve uma instalacao do P2App em um servidor da empresa usando Docker Engine e Docker Compose. O alvo recomendado e uma VM ou servidor Linux, por exemplo Ubuntu Server ou Debian, acessivel pela rede interna da empresa.

## Arquitetura

```text
usuarios da rede
  -> nginx/proxy :80
      -> web Next.js :3000
      -> api FastAPI :8000 em /api
          -> PostgreSQL :5432
```

Servicos do `docker-compose.prod.yml`:

| Servico | Funcao |
| --- | --- |
| `proxy` | Entrada HTTP unica para usuarios e API. |
| `web` | Frontend Next.js em modo production. |
| `api` | Backend FastAPI com migrations Alembic no start. |
| `db` | PostgreSQL com volume persistente. |

## Pre-requisitos no servidor

- Linux atualizado.
- Docker Engine instalado.
- Docker Compose plugin instalado.
- Git instalado.
- Porta 80 liberada na rede interna.
- DNS interno opcional apontando para o servidor, por exemplo `p2app.empresa.local`.

## Primeira instalacao

Clone o repositorio:

```bash
git clone https://github.com/vs-vinisiqueira/P2App.git
cd P2App
```

Crie o arquivo de variaveis de producao:

```bash
cp .env.production.example .env.production
```

Edite `.env.production` e troque pelo menos:

```env
POSTGRES_PASSWORD=uma-senha-forte
DATABASE_URL=postgresql://p2app_app:uma-senha-forte@db:5432/p2app
JWT_SECRET_KEY=uma-chave-grande-e-aleatoria
CORS_ORIGINS=http://p2app.empresa.local
APP_ADMIN_EMAIL=admin@empresa.com.br
APP_ADMIN_PASSWORD=uma-senha-admin-forte
```

Se for acessar apenas pelo IP do servidor, use o IP em `CORS_ORIGINS`. Se usar HTTPS no futuro, troque para `https://...`. Para `APP_ADMIN_EMAIL`, use um e-mail com dominio aceito pela validacao da aplicacao, como um dominio corporativo real; dominios especiais como `.local` nao sao aceitos pelo login.

Suba a stack:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

Crie ou atualize o admin inicial:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec api python scripts/create_admin.py
```

Acesse:

```text
http://IP_DO_SERVIDOR
http://p2app.empresa.local
```

Swagger da API:

```text
http://IP_DO_SERVIDOR/api/docs
```

## Atualizacao do sistema

```bash
git pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

O servico `api` roda `alembic upgrade head` antes de iniciar, entao migrations novas sao aplicadas durante a subida.

## Operacao diaria

Ver status:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production ps
```

Ver logs:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f api
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f web
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f db
```

Reiniciar um servico:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production restart api
```

Parar sem apagar dados:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production down
```

Nunca use `down -v` em producao sem backup validado, porque isso remove o volume do PostgreSQL.

## Backup e restore

Carregue as variaveis e gere um backup:

```bash
set -a
. ./.env.production
set +a
sh scripts/backup_postgres.sh
```

Restaure um backup:

```bash
set -a
. ./.env.production
set +a
sh scripts/restore_postgres.sh ./backups/p2app-YYYYMMDD-HHMMSS.dump
```

Teste restore periodicamente em outro ambiente. Backup sem restore testado nao deve ser tratado como recuperacao garantida.

## Checklist antes de entregar para uma empresa

- `.env.production` criado fora do Git e com senhas fortes.
- `JWT_SECRET_KEY` unico por cliente.
- Admin inicial criado e senha trocada pelo responsavel.
- Acesso validado pelo IP ou DNS interno.
- `docker compose ps` mostrando `proxy`, `web`, `api` e `db`.
- Backup criado e restore testado.
- Politica de atualizacao combinada com a empresa.
- Se expor fora da rede interna, adicionar HTTPS antes de liberar acesso.
