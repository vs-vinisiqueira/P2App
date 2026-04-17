
## Motivo
O módulo de chamados já existe em código, mas ainda precisa ser fechado corretamente antes de abrir novos módulos.

## Decisão
Antes de criar novos domínios (equipamentos, ordens de serviço, etc.), vamos:
1. alinhar migration
2. validar persistência
3. testar fluxo completo
4. expandir regras operacionais do chamado

## Justificativa
Abrir outro módulo agora aumentaria a complexidade sem fechar a base operacional já iniciada.