import os
import sys
from pathlib import Path

from dotenv import load_dotenv

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.core.security import gerar_hash_senha
from app.database import SessionLocal
from app.models.user import User
from app.schemas.auth import LoginRequest


def require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise ValueError(f"A variavel {name} precisa estar definida.")
    return value


def main() -> None:
    load_dotenv()

    name = os.getenv("APP_ADMIN_NAME", os.getenv("P2APP_ADMIN_NAME", "Administrador"))
    email = (
        require_env("APP_ADMIN_EMAIL")
        if os.getenv("APP_ADMIN_EMAIL")
        else require_env("P2APP_ADMIN_EMAIL")
    ).strip().lower()
    password = (
        require_env("APP_ADMIN_PASSWORD")
        if os.getenv("APP_ADMIN_PASSWORD")
        else require_env("P2APP_ADMIN_PASSWORD")
    )

    if len(password) < 12:
        raise ValueError("APP_ADMIN_PASSWORD deve ter pelo menos 12 caracteres.")

    LoginRequest(email=email, senha=password)

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user is None:
            user = User(
                nome=name,
                email=email,
                senha=gerar_hash_senha(password),
                tipo_usuario="admin",
                role="admin",
            )
            db.add(user)
            action = "criado"
        else:
            user.nome = name
            user.senha = gerar_hash_senha(password)
            user.tipo_usuario = "admin"
            user.role = "admin"
            action = "atualizado"

        db.commit()
        print(f"Usuario admin {action}: {email}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
