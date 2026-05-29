from sqlalchemy import CheckConstraint, Column, Integer, String
from app.database import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint(
            "tipo_usuario IN ('admin', 'gerente', 'tecnico', 'cliente')",
            name="ck_users_tipo_usuario_valid",
        ),
        CheckConstraint(
            "role IN ('admin', 'user')",
            name="ck_users_role_valid",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    senha = Column(String(255), nullable=False)
    tipo_usuario = Column(String(30), nullable=False)
    role = Column(String(20), nullable=False, default="user", server_default="user")
