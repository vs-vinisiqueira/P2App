
## Autenticação
- Usuário faz login em /auth/login
- API valida email e senha
- API gera access token JWT
- Rotas protegidas usam o usuário autenticado a partir do token

## Usuários
- Cadastro público cria apenas usuário do tipo cliente
- Listagem de usuários exige admin

## Chamados
- Apenas cliente autenticado pode criar chamado
- Admin pode listar todos os chamados
- Cliente pode listar apenas os seus

## Observação arquitetural
O chamado referencia users.id como cliente_id.
Hoje não existe entidade separada para cliente.