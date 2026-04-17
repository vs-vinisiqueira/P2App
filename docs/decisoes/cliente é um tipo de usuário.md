

## Contexto
No estado atual do projeto, não existe uma entidade separada chamada Cliente.
O sistema usa a tabela users com o campo tipo_usuario.

## Decisão atual
Para o MVP, "cliente" será tratado como um tipo de usuário.

## Impactos
- Chamados apontam para users.id em cliente_id
- Simplifica autenticação e cadastro inicial
- Evita criar mais tabelas cedo demais

## Risco futuro
Se o sistema precisar separar empresa, contato, contrato ou múltiplos usuários por cliente, essa modelagem pode precisar evoluir.