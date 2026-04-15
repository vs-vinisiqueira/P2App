# P2App
SISTEMA DE GESTÃO DE ATENDIMENTOS TÉCNICOS

## Configuração

1. Crie o ambiente virtual e instale as dependências:

```powershell
python -m venv venv
venv\Scripts\python.exe -m pip install -r requirements.txt
```

2. Crie um arquivo `.env` baseado em `.env.example` e configure `DATABASE_URL`.

3. Aplique as migrations:

```powershell
venv\Scripts\python.exe -m alembic upgrade head
```

4. Rode a API:

```powershell
venv\Scripts\python.exe -m uvicorn app.main:app --reload
```
