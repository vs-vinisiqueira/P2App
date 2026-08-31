from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.authorization import role_for_tipo_usuario
from app.core.security import gerar_hash_senha
from app.models.user import User
from app.schemas.user import UserCreate


def criar_usuario(db: Session, user: UserCreate):
    usuario_existente = db.query(User).filter(User.email == user.email).first()

    if usuario_existente:
        return None

    senha_hash = gerar_hash_senha(user.senha)

    novo_usuario = User(
        nome=user.nome,
        email=user.email,
        senha=senha_hash,
        tipo_usuario=user.tipo_usuario,
        role=role_for_tipo_usuario(user.tipo_usuario),
    )

    try:
        db.add(novo_usuario)
        db.commit()
        db.refresh(novo_usuario)
    except IntegrityError:
        db.rollback()
        return None

    return novo_usuario


def listar_usuarios(
    db: Session,
    limit: int = 100,
    offset: int = 0,
    tipo_usuario: str | None = None,
):
    query = db.query(User)
    if tipo_usuario is not None:
        query = query.filter(User.tipo_usuario == tipo_usuario)
    return query.offset(offset).limit(limit).all()


def obter_usuario_por_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()
