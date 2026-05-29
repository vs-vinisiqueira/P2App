from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router
from app.routes.chamado import router as chamado_router
from app.routes.ticket import router as ticket_router
from app.routes.user import router as user_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(chamado_router)
app.include_router(ticket_router)
app.include_router(user_router)


@app.get("/")
def home():
    return {"mensagem": "API do P2App rodando"}
