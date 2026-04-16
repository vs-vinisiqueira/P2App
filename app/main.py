from fastapi import FastAPI
from app.routes.auth import router as auth_router
from app.routes.chamado import router as chamado_router
from app.routes.user import router as user_router

app = FastAPI()

app.include_router(auth_router)
app.include_router(chamado_router)
app.include_router(user_router)


@app.get("/")
def home():
    return {"mensagem": "API do P2App rodando"}
