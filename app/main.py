import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.atendimento import router as atendimento_router
from app.routes.auth import router as auth_router
from app.routes.chamado import router as chamado_router
from app.routes.ticket import router as ticket_router
from app.routes.user import router as user_router

DEFAULT_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]


def get_cors_origins() -> list[str]:
    raw_origins = os.getenv("CORS_ORIGINS")
    if not raw_origins:
        return DEFAULT_CORS_ORIGINS

    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


app = FastAPI(root_path=os.getenv("API_ROOT_PATH", ""))

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(chamado_router)
app.include_router(ticket_router)
app.include_router(atendimento_router)
app.include_router(user_router)


@app.get("/")
def home():
    app_name = os.getenv("APP_NAME", "P2App")
    return {"mensagem": f"API do {app_name} rodando"}
