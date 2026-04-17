Decisão:
- Adicionar campo `role` no usuário

Implementação:
- Campo `role` com default "user"
- Middleware `require_admin`
- Proteção de rotas críticas

Observação:
- Ainda falta validar fluxo completo (testes)